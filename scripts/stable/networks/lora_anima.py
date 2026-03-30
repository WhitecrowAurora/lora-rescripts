# LoRA network module for Anima
import ast
import math
import os
import re
from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple, Type, Union
import torch
import torch.nn.functional as F
from library.utils import setup_logging
from networks.lora_flux import LoRAModule, LoRAInfModule
from torch.nn.modules.module import _IncompatibleKeys

import logging

setup_logging()
logger = logging.getLogger(__name__)


TRAIN_NORM_PREFIX_ANIMA = "train_norm_unet"
TRAIN_NORM_PREFIX_TEXT_ENCODER = "train_norm_te"


def _parse_bool_arg(value, default: bool = False) -> bool:
    if value is None:
        return default
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        return value != 0
    return str(value).strip().lower() in {"1", "true", "yes", "on"}


@dataclass
class TrainNormRef:
    lora_name: str
    original_name: str
    org_module: torch.nn.Module

    def named_parameters(self):
        return self.org_module.named_parameters(recurse=False)


class TrainNormParamProxy(torch.nn.Module):
    def __init__(self, refs: List[TrainNormRef], proxy_name: str):
        super().__init__()
        self.refs = refs
        self.proxy_name = proxy_name

    def named_parameters(self, prefix: str = "", recurse: bool = True, remove_duplicate: bool = True):
        del recurse
        memo = set()
        prefix = f"{prefix}." if prefix else ""
        for ref in self.refs:
            for name, param in ref.named_parameters():
                if remove_duplicate and id(param) in memo:
                    continue
                memo.add(id(param))
                yield f"{prefix}{ref.lora_name}.{name}", param


class LoKrModule(torch.nn.Module):
    """
    Anima-specific LoKr module implemented as a linear-layer injector.
    This intentionally targets Linear layers only, matching the current
    verified Anima DiT route.
    """

    def __init__(
        self,
        lora_name,
        org_module: torch.nn.Module,
        multiplier=1.0,
        lora_dim=4,
        alpha=1,
        dropout=None,
        rank_dropout=None,
        module_dropout=None,
        factor=8,
    ):
        super().__init__()
        if org_module.__class__.__name__ != "Linear":
            raise ValueError(f"LoKrModule only supports Linear layers for Anima, got {org_module.__class__.__name__}")

        self.lora_name = lora_name
        self.lora_dim = int(lora_dim if lora_dim is not None else 4)
        self.multiplier = multiplier
        self.org_module = org_module
        self.dropout = dropout
        self.rank_dropout = rank_dropout
        self.module_dropout = module_dropout

        in_dim = org_module.in_features
        out_dim = org_module.out_features
        self.factor = self._find_factor(in_dim, out_dim, int(factor) if factor is not None else 8)
        self.lokr_in_dim = in_dim // self.factor
        self.lokr_out_dim = out_dim // self.factor

        self.lokr_w1 = torch.nn.Parameter(torch.empty(self.factor, self.factor))
        self.lokr_w2 = torch.nn.Parameter(torch.empty(self.lokr_out_dim, self.lokr_in_dim))
        torch.nn.init.kaiming_uniform_(self.lokr_w1, a=math.sqrt(5))
        torch.nn.init.zeros_(self.lokr_w2)

        if type(alpha) == torch.Tensor:
            alpha = alpha.detach().float().cpu().item()
        alpha = self.lora_dim if alpha is None or alpha == 0 else float(alpha)
        self.scale = alpha / self.lora_dim
        self.register_buffer("alpha", torch.tensor(alpha))
        self.register_buffer("lokr_rank", torch.tensor(self.lora_dim))

    @staticmethod
    def _find_factor(in_features: int, out_features: int, target_factor: int) -> int:
        candidates = []
        if target_factor > 0:
            candidates.append(target_factor)
        candidates.extend([16, 12, 8, 6, 4, 3, 2, 1])

        seen = set()
        for factor in candidates:
            if factor in seen or factor <= 0:
                continue
            seen.add(factor)
            if in_features % factor == 0 and out_features % factor == 0:
                return factor
        return 1

    def apply_to(self):
        self.org_forward = self.org_module.forward
        self.org_module.forward = self.forward
        del self.org_module

    def _compute_weight(self, device=None, dtype=None):
        weight = torch.kron(self.lokr_w1, self.lokr_w2)
        if device is not None or dtype is not None:
            weight = weight.to(device=device or weight.device, dtype=dtype or weight.dtype)
        return weight

    def forward(self, x):
        org_forwarded = self.org_forward(x)

        if self.module_dropout is not None and self.training:
            if torch.rand(1, device=x.device) < self.module_dropout:
                return org_forwarded

        lx = x
        if self.dropout is not None and self.training:
            lx = F.dropout(lx, p=self.dropout)

        weight = self._compute_weight(device=lx.device, dtype=lx.dtype)
        lx = F.linear(lx, weight)
        return org_forwarded + lx * self.multiplier * self.scale

    @property
    def device(self):
        return next(self.parameters()).device

    @property
    def dtype(self):
        return next(self.parameters()).dtype


class LoKrInfModule(LoKrModule):
    def __init__(
        self,
        lora_name,
        org_module: torch.nn.Module,
        multiplier=1.0,
        lora_dim=4,
        alpha=1,
        factor=8,
        **kwargs,
    ):
        super().__init__(
            lora_name,
            org_module,
            multiplier=multiplier,
            lora_dim=lora_dim,
            alpha=alpha,
            dropout=None,
            rank_dropout=None,
            module_dropout=None,
            factor=factor,
        )
        self.org_module_ref = [org_module]
        self.enabled = True
        self.network = None

    def set_network(self, network):
        self.network = network

    def merge_to(self, sd, dtype, device):
        org_sd = self.org_module.state_dict()
        weight = org_sd["weight"].to(torch.float)
        org_dtype = org_sd["weight"].dtype
        org_device = org_sd["weight"].device

        if dtype is None:
            dtype = org_dtype
        if device is None:
            device = org_device

        lokr_w1 = sd["lokr_w1"].to(torch.float).to(device)
        lokr_w2 = sd["lokr_w2"].to(torch.float).to(device)
        adapter_weight = torch.kron(lokr_w1, lokr_w2)
        org_sd["weight"] = (weight.to(device) + self.multiplier * adapter_weight * self.scale).to(dtype)
        self.org_module.load_state_dict(org_sd)

    def get_weight(self, multiplier=None):
        if multiplier is None:
            multiplier = self.multiplier
        return multiplier * self._compute_weight(device=self.device, dtype=torch.float) * self.scale

    def set_region(self, region):
        self.region = region

def create_network(
    multiplier: float,
    network_dim: Optional[int],
    network_alpha: Optional[float],
    vae,
    text_encoders: list,
    unet,
    neuron_dropout: Optional[float] = None,
    **kwargs,
):
    if network_dim is None:
        network_dim = 4
    if network_alpha is None:
        network_alpha = 1.0

    adapter_type = str(
        kwargs.get("anima_adapter_type", kwargs.get("adapter_type", kwargs.get("lycoris_algo", "lora")))
    ).strip().lower()
    use_lokr = adapter_type == "lokr"
    lokr_factor = int(kwargs.get("lokr_factor", kwargs.get("factor", 8)) or 8)
    train_norm = _parse_bool_arg(kwargs.get("train_norm", None), default=False)

    # train LLM adapter
    train_llm_adapter = kwargs.get("train_llm_adapter", "false")
    if train_llm_adapter is not None:
        train_llm_adapter = True if train_llm_adapter.lower() == "true" else False

    exclude_patterns = kwargs.get("exclude_patterns", None)
    if exclude_patterns is None:
        exclude_patterns = []
    else:
        exclude_patterns = ast.literal_eval(exclude_patterns)
        if not isinstance(exclude_patterns, list):
            exclude_patterns = [exclude_patterns]

    # add default exclude patterns
    if train_norm:
        exclude_patterns.append(r".*(_modulation|_embedder|final_layer).*")
    else:
        exclude_patterns.append(r".*(_modulation|_norm|_embedder|final_layer).*")

    # regular expression for module selection: exclude and include
    include_patterns = kwargs.get("include_patterns", None)
    if include_patterns is not None:
        include_patterns = ast.literal_eval(include_patterns)
        if not isinstance(include_patterns, list):
            include_patterns = [include_patterns]

    # rank/module dropout
    rank_dropout = kwargs.get("rank_dropout", None)
    if rank_dropout is not None:
        rank_dropout = float(rank_dropout)
    module_dropout = kwargs.get("module_dropout", None)
    if module_dropout is not None:
        module_dropout = float(module_dropout)

    # verbose
    verbose = kwargs.get("verbose", "false")
    if verbose is not None:
        verbose = True if verbose.lower() == "true" else False

    # regex-specific learning rates / dimensions
    def parse_kv_pairs(kv_pair_str: str, is_int: bool) -> Dict[str, float]:
        """
        Parse a string of key-value pairs separated by commas.
        """
        pairs = {}
        for pair in kv_pair_str.split(","):
            pair = pair.strip()
            if not pair:
                continue
            if "=" not in pair:
                logger.warning(f"Invalid format: {pair}, expected 'key=value'")
                continue
            key, value = pair.split("=", 1)
            key = key.strip()
            value = value.strip()
            try:
                pairs[key] = int(value) if is_int else float(value)
            except ValueError:
                logger.warning(f"Invalid value for {key}: {value}")
        return pairs

    network_reg_lrs = kwargs.get("network_reg_lrs", None)
    if network_reg_lrs is not None:
        reg_lrs = parse_kv_pairs(network_reg_lrs, is_int=False)
    else:
        reg_lrs = None

    network_reg_dims = kwargs.get("network_reg_dims", None)
    if network_reg_dims is not None:
        reg_dims = parse_kv_pairs(network_reg_dims, is_int=True)
    else:
        reg_dims = None

    module_class = LoKrModule if use_lokr else LoRAModule

    network = LoRANetwork(
        text_encoders,
        unet,
        multiplier=multiplier,
        lora_dim=network_dim,
        alpha=network_alpha,
        dropout=neuron_dropout,
        rank_dropout=rank_dropout,
        module_dropout=module_dropout,
        train_llm_adapter=train_llm_adapter,
        exclude_patterns=exclude_patterns,
        include_patterns=include_patterns,
        reg_dims=reg_dims,
        reg_lrs=reg_lrs,
        verbose=verbose,
        module_class=module_class,
        use_lokr=use_lokr,
        lokr_factor=lokr_factor,
        train_norm=train_norm,
    )

    loraplus_lr_ratio = kwargs.get("loraplus_lr_ratio", None)
    loraplus_unet_lr_ratio = kwargs.get("loraplus_unet_lr_ratio", None)
    loraplus_text_encoder_lr_ratio = kwargs.get("loraplus_text_encoder_lr_ratio", None)
    loraplus_lr_ratio = float(loraplus_lr_ratio) if loraplus_lr_ratio is not None else None
    loraplus_unet_lr_ratio = float(loraplus_unet_lr_ratio) if loraplus_unet_lr_ratio is not None else None
    loraplus_text_encoder_lr_ratio = float(loraplus_text_encoder_lr_ratio) if loraplus_text_encoder_lr_ratio is not None else None
    if loraplus_lr_ratio is not None or loraplus_unet_lr_ratio is not None or loraplus_text_encoder_lr_ratio is not None:
        network.set_loraplus_lr_ratio(loraplus_lr_ratio, loraplus_unet_lr_ratio, loraplus_text_encoder_lr_ratio)

    return network


def create_network_from_weights(multiplier, file, ae, text_encoders, unet, weights_sd=None, for_inference=False, **kwargs):
    if weights_sd is None:
        if os.path.splitext(file)[1] == ".safetensors":
            from safetensors.torch import load_file

            weights_sd = load_file(file)
        else:
            weights_sd = torch.load(file, map_location="cpu")

    modules_dim = {}
    modules_alpha = {}
    modules_factor = {}
    train_llm_adapter = False
    is_lokr = False
    train_norm = False
    for key, value in weights_sd.items():
        if "." not in key:
            continue

        lora_name = key.split(".")[0]
        if lora_name.startswith(TRAIN_NORM_PREFIX_ANIMA) or lora_name.startswith(TRAIN_NORM_PREFIX_TEXT_ENCODER):
            train_norm = True
            continue
        if "alpha" in key:
            modules_alpha[lora_name] = value
        elif "lokr_rank" in key:
            modules_dim[lora_name] = int(value.detach().float().cpu().item())
            is_lokr = True
        elif "lokr_w1" in key:
            modules_factor[lora_name] = value.size(0)
            if lora_name not in modules_dim:
                alpha_value = modules_alpha.get(lora_name)
                modules_dim[lora_name] = int(alpha_value.detach().float().cpu().item()) if alpha_value is not None else 4
            is_lokr = True
        elif "lokr_w2" in key:
            if lora_name not in modules_dim:
                alpha_value = modules_alpha.get(lora_name)
                modules_dim[lora_name] = int(alpha_value.detach().float().cpu().item()) if alpha_value is not None else 4
            is_lokr = True
        elif "lora_down" in key:
            dim = value.size()[0]
            modules_dim[lora_name] = dim

        if "llm_adapter" in lora_name:
            train_llm_adapter = True

    if is_lokr:
        module_class = LoKrInfModule if for_inference else LoKrModule
    else:
        module_class = LoRAInfModule if for_inference else LoRAModule

    network = LoRANetwork(
        text_encoders,
        unet,
        multiplier=multiplier,
        modules_dim=modules_dim,
        modules_alpha=modules_alpha,
        module_class=module_class,
        train_llm_adapter=train_llm_adapter,
        use_lokr=is_lokr,
        lokr_factor=next(iter(modules_factor.values())) if modules_factor else 8,
        modules_factor=modules_factor if is_lokr else None,
        train_norm=train_norm,
    )
    return network, weights_sd


class LoRANetwork(torch.nn.Module):
    # Target modules: DiT blocks, embedders, final layer. embedders and final layer are excluded by default.
    ANIMA_TARGET_REPLACE_MODULE = ["Block", "PatchEmbed", "TimestepEmbedding", "FinalLayer"]
    # Target modules: LLM Adapter blocks
    ANIMA_ADAPTER_TARGET_REPLACE_MODULE = ["LLMAdapterTransformerBlock"]
    # Target modules for text encoder (Qwen3)
    TEXT_ENCODER_TARGET_REPLACE_MODULE = ["Qwen3Attention", "Qwen3MLP", "Qwen3SdpaAttention", "Qwen3FlashAttention2"]

    LORA_PREFIX_ANIMA = "lora_unet"  # ComfyUI compatible
    LORA_PREFIX_TEXT_ENCODER = "lora_te"  # Qwen3

    def __init__(
        self,
        text_encoders: list,
        unet,
        multiplier: float = 1.0,
        lora_dim: int = 4,
        alpha: float = 1,
        dropout: Optional[float] = None,
        rank_dropout: Optional[float] = None,
        module_dropout: Optional[float] = None,
        module_class: Type[object] = LoRAModule,
        modules_dim: Optional[Dict[str, int]] = None,
        modules_alpha: Optional[Dict[str, int]] = None,
        train_llm_adapter: bool = False,
        exclude_patterns: Optional[List[str]] = None,
        include_patterns: Optional[List[str]] = None,
        reg_dims: Optional[Dict[str, int]] = None,
        reg_lrs: Optional[Dict[str, float]] = None,
        verbose: Optional[bool] = False,
        use_lokr: bool = False,
        lokr_factor: int = 8,
        modules_factor: Optional[Dict[str, int]] = None,
        train_norm: bool = False,
    ) -> None:
        super().__init__()
        self.multiplier = multiplier
        self.lora_dim = lora_dim
        self.alpha = alpha
        self.dropout = dropout
        self.rank_dropout = rank_dropout
        self.module_dropout = module_dropout
        self.train_llm_adapter = train_llm_adapter
        self.reg_dims = reg_dims
        self.reg_lrs = reg_lrs
        self.use_lokr = use_lokr
        self.lokr_factor = lokr_factor
        self.modules_factor = modules_factor or {}
        self.adapter_type = "lokr" if self.use_lokr else "lora"
        self.train_norm = bool(train_norm)

        self.loraplus_lr_ratio = None
        self.loraplus_unet_lr_ratio = None
        self.loraplus_text_encoder_lr_ratio = None

        if modules_dim is not None:
            logger.info(f"create {self.adapter_type.upper()} network from weights")
        else:
            logger.info(f"create {self.adapter_type.upper()} network. base dim (rank): {lora_dim}, alpha: {alpha}")
            logger.info(
                f"neuron dropout: p={self.dropout}, rank dropout: p={self.rank_dropout}, module dropout: p={self.module_dropout}"
            )

        # compile regular expression if specified
        def str_to_re_patterns(patterns: Optional[List[str]]) -> List[re.Pattern]:
            re_patterns = []
            if patterns is not None:
                for pattern in patterns:
                    try:
                        re_pattern = re.compile(pattern)
                    except re.error as e:
                        logger.error(f"Invalid pattern '{pattern}': {e}")
                        continue
                    re_patterns.append(re_pattern)
            return re_patterns

        exclude_re_patterns = str_to_re_patterns(exclude_patterns)
        include_re_patterns = str_to_re_patterns(include_patterns)

        def is_allowed_module(original_name: str) -> bool:
            excluded = any(pattern.fullmatch(original_name) for pattern in exclude_re_patterns)
            included = any(pattern.fullmatch(original_name) for pattern in include_re_patterns)
            if excluded and not included:
                if verbose:
                    logger.info(f"exclude: {original_name}")
                return False
            return True

        def iter_target_modules(root_module: torch.nn.Module, target_replace_modules: List[str]):
            if target_replace_modules is None:
                yield "", root_module
                return

            for name, module in root_module.named_modules():
                if module.__class__.__name__ in target_replace_modules:
                    yield name, module

        def build_train_norm_prefix(is_unet: bool, text_encoder_idx: Optional[int]) -> str:
            if is_unet:
                return TRAIN_NORM_PREFIX_ANIMA
            if text_encoder_idx in (None, 0):
                return TRAIN_NORM_PREFIX_TEXT_ENCODER
            return f"{TRAIN_NORM_PREFIX_TEXT_ENCODER}{text_encoder_idx + 1}"

        def is_trainable_norm_module(module: torch.nn.Module) -> bool:
            if "norm" not in module.__class__.__name__.lower():
                return False
            return any(True for _name, _param in module.named_parameters(recurse=False))

        # create module instances
        def create_modules(
            is_unet: bool,
            text_encoder_idx: Optional[int],
            root_module: torch.nn.Module,
            target_replace_modules: List[str],
            default_dim: Optional[int] = None,
        ) -> Tuple[List[LoRAModule], List[TrainNormRef], List[str]]:
            prefix = self.LORA_PREFIX_ANIMA if is_unet else self.LORA_PREFIX_TEXT_ENCODER
            norm_prefix = build_train_norm_prefix(is_unet, text_encoder_idx)

            loras = []
            norm_refs = []
            skipped = []
            seen_lora_names = set()
            seen_norm_names = set()
            for scope_name, scope_module in iter_target_modules(root_module, target_replace_modules):
                for child_name, child_module in scope_module.named_modules():
                    original_name = ".".join(part for part in (scope_name, child_name) if part)
                    if not original_name:
                        continue

                    if self.train_norm and original_name not in seen_norm_names and is_trainable_norm_module(child_module):
                        if is_allowed_module(original_name):
                            norm_name = f"{norm_prefix}_{original_name}".replace(".", "_")
                            norm_ref = TrainNormRef(norm_name, original_name, child_module)
                            norm_refs.append(norm_ref)
                            seen_norm_names.add(original_name)

                    is_linear = child_module.__class__.__name__ == "Linear"
                    is_conv2d = child_module.__class__.__name__ == "Conv2d"
                    is_conv2d_1x1 = is_conv2d and child_module.kernel_size == (1, 1)

                    should_inject = is_linear or (is_conv2d and not self.use_lokr)
                    if not should_inject or original_name in seen_lora_names:
                        continue
                    if not is_allowed_module(original_name):
                        continue

                    lora_name = f"{prefix}.{original_name}".replace(".", "_")
                    dim = None
                    alpha_val = None
                    factor_val = self.modules_factor.get(lora_name, self.lokr_factor)

                    if modules_dim is not None:
                        if lora_name in modules_dim:
                            dim = modules_dim[lora_name]
                            alpha_val = modules_alpha.get(lora_name, dim)
                    else:
                        if self.reg_dims is not None:
                            for reg, d in self.reg_dims.items():
                                if re.fullmatch(reg, original_name):
                                    dim = d
                                    alpha_val = self.alpha
                                    logger.info(f"Module {original_name} matched with regex '{reg}' -> dim: {dim}")
                                    break
                        if dim is None and (is_linear or is_conv2d_1x1):
                            dim = default_dim if default_dim is not None else self.lora_dim
                            alpha_val = self.alpha

                    if dim is None or dim == 0:
                        if is_linear or (is_conv2d_1x1 and not self.use_lokr):
                            skipped.append(lora_name)
                        continue

                    module_kwargs = dict(
                        dropout=dropout,
                        rank_dropout=rank_dropout,
                        module_dropout=module_dropout,
                    )
                    if self.use_lokr:
                        module_kwargs["factor"] = factor_val

                    lora = module_class(
                        lora_name,
                        child_module,
                        self.multiplier,
                        dim,
                        alpha_val,
                        **module_kwargs,
                    )
                    lora.original_name = original_name
                    loras.append(lora)
                    seen_lora_names.add(original_name)
            return loras, norm_refs, skipped

        # Create LoRA for text encoders (Qwen3 - typically not trained for Anima)
        self.text_encoder_loras: List[Union[LoRAModule, LoRAInfModule]] = []
        self.text_encoder_norms: List[TrainNormRef] = []
        skipped_te = []
        if text_encoders is not None:
            for i, text_encoder in enumerate(text_encoders):
                if text_encoder is None:
                    continue
                logger.info(f"create {self.adapter_type.upper()} for Text Encoder {i+1}:")
                te_loras, te_norms, te_skipped = create_modules(
                    False, i, text_encoder, LoRANetwork.TEXT_ENCODER_TARGET_REPLACE_MODULE
                )
                logger.info(f"create {self.adapter_type.upper()} for Text Encoder {i+1}: {len(te_loras)} modules.")
                self.text_encoder_loras.extend(te_loras)
                self.text_encoder_norms.extend(te_norms)
                if self.train_norm:
                    logger.info(f"create train_norm for Text Encoder {i+1}: {len(te_norms)} modules.")
                skipped_te += te_skipped

        # Create LoRA for DiT blocks
        target_modules = list(LoRANetwork.ANIMA_TARGET_REPLACE_MODULE)
        if train_llm_adapter:
            target_modules.extend(LoRANetwork.ANIMA_ADAPTER_TARGET_REPLACE_MODULE)

        self.unet_loras: List[Union[LoRAModule, LoRAInfModule]]
        self.unet_norms: List[TrainNormRef]
        self.unet_loras, self.unet_norms, skipped_un = create_modules(True, None, unet, target_modules)

        logger.info(f"create {self.adapter_type.upper()} for Anima DiT: {len(self.unet_loras)} modules.")
        if self.train_norm:
            logger.info(f"create train_norm for Anima DiT: {len(self.unet_norms)} modules.")
        if verbose:
            for lora in self.unet_loras:
                logger.info(f"\t{lora.lora_name:60} {lora.lora_dim}, {lora.alpha}")

        skipped = skipped_te + skipped_un
        if verbose and len(skipped) > 0:
            logger.warning(f"dim (rank) is 0, {len(skipped)} {self.adapter_type.upper()} modules are skipped:")
            for name in skipped:
                logger.info(f"\t{name}")

        # assertion: no duplicate names
        names = set()
        for module_ref in self.text_encoder_loras + self.unet_loras + self.text_encoder_norms + self.unet_norms:
            assert module_ref.lora_name not in names, f"duplicated lora name: {module_ref.lora_name}"
            names.add(module_ref.lora_name)

    def set_multiplier(self, multiplier):
        self.multiplier = multiplier
        for lora in self.text_encoder_loras + self.unet_loras:
            lora.multiplier = self.multiplier

    def set_enabled(self, is_enabled):
        for lora in self.text_encoder_loras + self.unet_loras:
            lora.enabled = is_enabled

    def load_weights(self, file):
        if os.path.splitext(file)[1] == ".safetensors":
            from safetensors.torch import load_file

            weights_sd = load_file(file)
        else:
            weights_sd = torch.load(file, map_location="cpu")

        info = self.load_state_dict(weights_sd, False)
        return info

    def _iter_train_norm_refs(self):
        return self.text_encoder_norms + self.unet_norms

    def _iter_train_norm_param_items(self):
        for norm_ref in self._iter_train_norm_refs():
            for name, param in norm_ref.named_parameters():
                yield norm_ref, name, param

    def _apply_train_norm_state_dict(self, state_dict):
        norm_ref_map = {norm_ref.lora_name: norm_ref for norm_ref in self._iter_train_norm_refs()}
        missing_norm_keys = []
        unexpected_norm_keys = []
        expected_norm_keys = {
            f"{norm_ref.lora_name}.{name}"
            for norm_ref, name, _param in self._iter_train_norm_param_items()
        }
        saw_train_norm_key = False

        for key, value in state_dict.items():
            if "." not in key:
                continue
            lora_name, param_name = key.split(".", 1)
            if not (
                lora_name.startswith(TRAIN_NORM_PREFIX_ANIMA) or lora_name.startswith(TRAIN_NORM_PREFIX_TEXT_ENCODER)
            ):
                continue
            saw_train_norm_key = True
            if lora_name not in norm_ref_map:
                unexpected_norm_keys.append(key)
                continue

            norm_ref = norm_ref_map[lora_name]
            params_by_name = dict(norm_ref.named_parameters())
            target_param = params_by_name.get(param_name)
            if target_param is None:
                unexpected_norm_keys.append(key)
                continue
            if tuple(target_param.shape) != tuple(value.shape):
                raise RuntimeError(
                    f"size mismatch for {key}: copying a param with shape {tuple(value.shape)} "
                    f"from checkpoint, the shape in current model is {tuple(target_param.shape)}."
                )
            target_param.data.copy_(value.to(device=target_param.device, dtype=target_param.dtype))
            expected_norm_keys.discard(key)

        if saw_train_norm_key:
            missing_norm_keys.extend(sorted(expected_norm_keys))
        return missing_norm_keys, unexpected_norm_keys

    def load_state_dict(self, state_dict, strict=True):
        lora_state_dict = {}
        unexpected_norm_keys = []
        for key, value in state_dict.items():
            if "." not in key:
                lora_state_dict[key] = value
                continue
            lora_name = key.split(".", 1)[0]
            if lora_name.startswith(TRAIN_NORM_PREFIX_ANIMA) or lora_name.startswith(TRAIN_NORM_PREFIX_TEXT_ENCODER):
                continue
            lora_state_dict[key] = value

        info = super().load_state_dict(lora_state_dict, strict=False)
        missing_norm_keys, norm_unexpected = self._apply_train_norm_state_dict(state_dict)
        unexpected_norm_keys.extend(norm_unexpected)

        missing_keys = list(info.missing_keys)
        unexpected_keys = list(info.unexpected_keys)

        if strict:
            missing_keys.extend(missing_norm_keys)
            unexpected_keys.extend(unexpected_norm_keys)
            if missing_keys or unexpected_keys:
                error_msgs = []
                if unexpected_keys:
                    error_msgs.append(
                        "Unexpected key(s) in state_dict: {}.".format(", ".join(f'"{k}"' for k in unexpected_keys))
                    )
                if missing_keys:
                    error_msgs.append(
                        "Missing key(s) in state_dict: {}.".format(", ".join(f'"{k}"' for k in missing_keys))
                    )
                raise RuntimeError(
                    f"Error(s) in loading state_dict for {self.__class__.__name__}:\n\t" + "\n\t".join(error_msgs)
                )
            return _IncompatibleKeys([], [])

        return _IncompatibleKeys(missing_keys + missing_norm_keys, unexpected_keys + unexpected_norm_keys)

    def apply_to(self, text_encoders, unet, apply_text_encoder=True, apply_unet=True):
        if apply_text_encoder:
            logger.info(f"enable {self.adapter_type.upper()} for text encoder: {len(self.text_encoder_loras)} modules")
            if self.train_norm and self.text_encoder_norms:
                logger.info(f"enable train_norm for text encoder: {len(self.text_encoder_norms)} modules")
        else:
            self.text_encoder_loras = []
            self.text_encoder_norms = []

        if apply_unet:
            logger.info(f"enable {self.adapter_type.upper()} for DiT: {len(self.unet_loras)} modules")
            if self.train_norm and self.unet_norms:
                logger.info(f"enable train_norm for DiT: {len(self.unet_norms)} modules")
        else:
            self.unet_loras = []
            self.unet_norms = []

        for lora in self.text_encoder_loras + self.unet_loras:
            lora.apply_to()
            self.add_module(lora.lora_name, lora)

    def is_mergeable(self):
        return True

    def merge_to(self, text_encoders, unet, weights_sd, dtype=None, device=None):
        apply_text_encoder = apply_unet = False
        for key in weights_sd.keys():
            if key.startswith(LoRANetwork.LORA_PREFIX_TEXT_ENCODER):
                apply_text_encoder = True
            elif key.startswith(TRAIN_NORM_PREFIX_TEXT_ENCODER):
                apply_text_encoder = True
            elif key.startswith(LoRANetwork.LORA_PREFIX_ANIMA):
                apply_unet = True
            elif key.startswith(TRAIN_NORM_PREFIX_ANIMA):
                apply_unet = True

        if apply_text_encoder:
            logger.info(f"enable {self.adapter_type.upper()} for text encoder")
        else:
            self.text_encoder_loras = []
            self.text_encoder_norms = []

        if apply_unet:
            logger.info(f"enable {self.adapter_type.upper()} for DiT")
        else:
            self.unet_loras = []
            self.unet_norms = []

        for lora in self.text_encoder_loras + self.unet_loras:
            sd_for_lora = {}
            for key in weights_sd.keys():
                if key.startswith(lora.lora_name):
                    sd_for_lora[key[len(lora.lora_name) + 1 :]] = weights_sd[key]
            lora.merge_to(sd_for_lora, dtype, device)

        self._apply_train_norm_state_dict(weights_sd)

        logger.info("weights are merged")

    def set_loraplus_lr_ratio(self, loraplus_lr_ratio, loraplus_unet_lr_ratio, loraplus_text_encoder_lr_ratio):
        self.loraplus_lr_ratio = loraplus_lr_ratio
        self.loraplus_unet_lr_ratio = loraplus_unet_lr_ratio
        self.loraplus_text_encoder_lr_ratio = loraplus_text_encoder_lr_ratio

        logger.info(f"LoRA+ UNet LR Ratio: {self.loraplus_unet_lr_ratio or self.loraplus_lr_ratio}")
        logger.info(f"LoRA+ Text Encoder LR Ratio: {self.loraplus_text_encoder_lr_ratio or self.loraplus_lr_ratio}")

    def prepare_optimizer_params_with_multiple_te_lrs(self, text_encoder_lr, unet_lr, default_lr):
        if text_encoder_lr is None or (isinstance(text_encoder_lr, list) and len(text_encoder_lr) == 0):
            text_encoder_lr = [default_lr]
        elif isinstance(text_encoder_lr, float) or isinstance(text_encoder_lr, int):
            text_encoder_lr = [float(text_encoder_lr)]
        elif len(text_encoder_lr) == 1:
            pass  # already a list with one element

        self.requires_grad_(True)

        all_params = []
        lr_descriptions = []

        def assemble_params(loras, norms, lr, loraplus_ratio):
            param_groups = {"lora": {}, "plus": {}, "norm": {}}
            reg_groups = {}
            reg_lrs_list = list(self.reg_lrs.items()) if self.reg_lrs is not None else []

            for lora in loras:
                matched_reg_lr = None
                for i, (regex_str, reg_lr) in enumerate(reg_lrs_list):
                    if re.fullmatch(regex_str, lora.original_name):
                        matched_reg_lr = (i, reg_lr)
                        logger.info(f"Module {lora.original_name} matched regex '{regex_str}' -> LR {reg_lr}")
                        break

                for name, param in lora.named_parameters():
                    if matched_reg_lr is not None:
                        reg_idx, reg_lr = matched_reg_lr
                        group_key = f"reg_lr_{reg_idx}"
                        if group_key not in reg_groups:
                            reg_groups[group_key] = {"lora": {}, "plus": {}, "norm": {}, "lr": reg_lr}
                        if loraplus_ratio is not None and "lora_up" in name:
                            reg_groups[group_key]["plus"][f"{lora.lora_name}.{name}"] = param
                        else:
                            reg_groups[group_key]["lora"][f"{lora.lora_name}.{name}"] = param
                        continue

                    if loraplus_ratio is not None and "lora_up" in name:
                        param_groups["plus"][f"{lora.lora_name}.{name}"] = param
                    else:
                        param_groups["lora"][f"{lora.lora_name}.{name}"] = param

            for norm_ref in norms:
                matched_reg_lr = None
                for i, (regex_str, reg_lr) in enumerate(reg_lrs_list):
                    if re.fullmatch(regex_str, norm_ref.original_name):
                        matched_reg_lr = (i, reg_lr)
                        logger.info(f"Norm module {norm_ref.original_name} matched regex '{regex_str}' -> LR {reg_lr}")
                        break

                for name, param in norm_ref.named_parameters():
                    if matched_reg_lr is not None:
                        reg_idx, reg_lr = matched_reg_lr
                        group_key = f"reg_lr_{reg_idx}"
                        if group_key not in reg_groups:
                            reg_groups[group_key] = {"lora": {}, "plus": {}, "norm": {}, "lr": reg_lr}
                        reg_groups[group_key]["norm"][f"{norm_ref.lora_name}.{name}"] = param
                        continue

                    param_groups["norm"][f"{norm_ref.lora_name}.{name}"] = param

            params = []
            descriptions = []
            for group_key, group in reg_groups.items():
                reg_lr = group["lr"]
                for key in ("lora", "plus", "norm"):
                    param_data = {"params": group[key].values()}
                    if len(param_data["params"]) == 0:
                        continue
                    if key == "plus":
                        param_data["lr"] = reg_lr * loraplus_ratio if loraplus_ratio is not None else reg_lr
                    else:
                        param_data["lr"] = reg_lr
                    if param_data.get("lr", None) == 0 or param_data.get("lr", None) is None:
                        logger.info("NO LR skipping!")
                        continue
                    params.append(param_data)
                    desc = f"reg_lr_{group_key.split('_')[-1]}"
                    if key == "plus":
                        desc += " plus"
                    elif key == "norm":
                        desc += " norm"
                    descriptions.append(desc)

            for key in param_groups.keys():
                param_data = {"params": param_groups[key].values()}
                if len(param_data["params"]) == 0:
                    continue
                if lr is not None:
                    if key == "plus":
                        param_data["lr"] = lr * loraplus_ratio
                    else:
                        param_data["lr"] = lr
                if param_data.get("lr", None) == 0 or param_data.get("lr", None) is None:
                    logger.info("NO LR skipping!")
                    continue
                params.append(param_data)
                descriptions.append("plus" if key == "plus" else "norm" if key == "norm" else "")
            return params, descriptions

        if self.text_encoder_loras or self.text_encoder_norms:
            loraplus_ratio = self.loraplus_text_encoder_lr_ratio or self.loraplus_lr_ratio
            te1_loras = [lora for lora in self.text_encoder_loras if lora.lora_name.startswith(self.LORA_PREFIX_TEXT_ENCODER)]
            te1_norms = [norm_ref for norm_ref in self.text_encoder_norms if norm_ref.lora_name.startswith(TRAIN_NORM_PREFIX_TEXT_ENCODER)]
            if len(te1_loras) > 0 or len(te1_norms) > 0:
                logger.info(
                    f"Text Encoder 1 (Qwen3): {len(te1_loras)} adapter modules, {len(te1_norms)} norm modules, LR {text_encoder_lr[0]}"
                )
                params, descriptions = assemble_params(te1_loras, te1_norms, text_encoder_lr[0], loraplus_ratio)
                all_params.extend(params)
                lr_descriptions.extend(["textencoder 1" + (" " + d if d else "") for d in descriptions])

        if self.unet_loras or self.unet_norms:
            logger.info(
                f"Anima DiT: {len(self.unet_loras)} adapter modules, {len(self.unet_norms)} norm modules, "
                f"LR {unet_lr if unet_lr is not None else default_lr}"
            )
            params, descriptions = assemble_params(
                self.unet_loras,
                self.unet_norms,
                unet_lr if unet_lr is not None else default_lr,
                self.loraplus_unet_lr_ratio or self.loraplus_lr_ratio,
            )
            all_params.extend(params)
            lr_descriptions.extend(["unet" + (" " + d if d else "") for d in descriptions])

        return all_params, lr_descriptions

    def enable_gradient_checkpointing(self):
        pass  # not supported

    def prepare_grad_etc(self, text_encoder, unet):
        self.requires_grad_(True)
        for _norm_ref, _name, param in self._iter_train_norm_param_items():
            param.requires_grad_(True)

    def on_epoch_start(self, text_encoder, unet):
        self.train()

    def get_trainable_params(self):
        params = []
        seen = set()
        for param in self.parameters():
            if id(param) in seen:
                continue
            seen.add(id(param))
            params.append(param)
        for _norm_ref, _name, param in self._iter_train_norm_param_items():
            if id(param) in seen:
                continue
            seen.add(id(param))
            params.append(param)
        return params

    def state_dict(self, destination=None, prefix="", keep_vars=False):
        state_dict = super().state_dict(destination=destination, prefix=prefix, keep_vars=keep_vars)
        for norm_ref, name, param in self._iter_train_norm_param_items():
            key = f"{prefix}{norm_ref.lora_name}.{name}"
            state_dict[key] = param if keep_vars else param.detach()
        return state_dict

    def get_extra_ema_modules(self):
        modules = []
        if self.text_encoder_norms:
            modules.append(("network_text_encoder_norms", TrainNormParamProxy(self.text_encoder_norms, "text_encoder_norms")))
        if self.unet_norms:
            modules.append(("network_unet_norms", TrainNormParamProxy(self.unet_norms, "unet_norms")))
        return modules

    def save_weights(self, file, dtype, metadata):
        if metadata is not None and len(metadata) == 0:
            metadata = None

        state_dict = self.state_dict()

        if dtype is not None:
            for key in list(state_dict.keys()):
                v = state_dict[key]
                v = v.detach().clone().to("cpu").to(dtype)
                state_dict[key] = v

        if os.path.splitext(file)[1] == ".safetensors":
            from safetensors.torch import save_file
            from library import train_util

            if metadata is None:
                metadata = {}
            model_hash, legacy_hash = train_util.precalculate_safetensors_hashes(state_dict, metadata)
            metadata["sshs_model_hash"] = model_hash
            metadata["sshs_legacy_hash"] = legacy_hash

            save_file(state_dict, file, metadata)
        else:
            torch.save(state_dict, file)

    def backup_weights(self):
        loras: List[LoRAInfModule] = self.text_encoder_loras + self.unet_loras
        for lora in loras:
            org_module = lora.org_module_ref[0]
            if not hasattr(org_module, "_lora_org_weight"):
                sd = org_module.state_dict()
                org_module._lora_org_weight = sd["weight"].detach().clone()
                org_module._lora_restored = True

    def restore_weights(self):
        loras: List[LoRAInfModule] = self.text_encoder_loras + self.unet_loras
        for lora in loras:
            org_module = lora.org_module_ref[0]
            if not org_module._lora_restored:
                sd = org_module.state_dict()
                sd["weight"] = org_module._lora_org_weight
                org_module.load_state_dict(sd)
                org_module._lora_restored = True

    def pre_calculation(self):
        loras: List[LoRAInfModule] = self.text_encoder_loras + self.unet_loras
        for lora in loras:
            org_module = lora.org_module_ref[0]
            sd = org_module.state_dict()

            org_weight = sd["weight"]
            lora_weight = lora.get_weight().to(org_weight.device, dtype=org_weight.dtype)
            sd["weight"] = org_weight + lora_weight
            assert sd["weight"].shape == org_weight.shape
            org_module.load_state_dict(sd)

            org_module._lora_restored = False
            lora.enabled = False

    def apply_max_norm_regularization(self, max_norm_value, device):
        if self.use_lokr:
            return 0, 0, 0

        downkeys = []
        upkeys = []
        alphakeys = []
        norms = []
        keys_scaled = 0

        state_dict = self.state_dict()
        for key in state_dict.keys():
            if "lora_down" in key and "weight" in key:
                downkeys.append(key)
                upkeys.append(key.replace("lora_down", "lora_up"))
                alphakeys.append(key.replace("lora_down.weight", "alpha"))

        for i in range(len(downkeys)):
            down = state_dict[downkeys[i]].to(device)
            up = state_dict[upkeys[i]].to(device)
            alpha = state_dict[alphakeys[i]].to(device)
            dim = down.shape[0]
            scale = alpha / dim

            if up.shape[2:] == (1, 1) and down.shape[2:] == (1, 1):
                updown = (up.squeeze(2).squeeze(2) @ down.squeeze(2).squeeze(2)).unsqueeze(2).unsqueeze(3)
            elif up.shape[2:] == (3, 3) or down.shape[2:] == (3, 3):
                updown = torch.nn.functional.conv2d(down.permute(1, 0, 2, 3), up).permute(1, 0, 2, 3)
            else:
                updown = up @ down

            updown *= scale

            norm = updown.norm().clamp(min=max_norm_value / 2)
            desired = torch.clamp(norm, max=max_norm_value)
            ratio = desired.cpu() / norm.cpu()
            sqrt_ratio = ratio**0.5
            if ratio != 1:
                keys_scaled += 1
                state_dict[upkeys[i]] *= sqrt_ratio
                state_dict[downkeys[i]] *= sqrt_ratio
            scalednorm = updown.norm() * ratio
            norms.append(scalednorm.item())

        return keys_scaled, sum(norms) / len(norms), max(norms)
