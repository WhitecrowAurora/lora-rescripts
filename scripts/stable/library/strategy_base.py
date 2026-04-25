# base class for platform strategies. this file defines the interface for strategies

from collections import OrderedDict
from concurrent.futures import FIRST_COMPLETED, Future, ThreadPoolExecutor, wait
from dataclasses import dataclass
import json
import math
import os
import re
from typing import Any, List, Optional, Tuple, Union, Callable

import numpy as np
import safetensors.torch
import torch
from transformers import CLIPTokenizer, CLIPTextModel, CLIPTextModelWithProjection

from library.latents_disk_cache import (
    LatentsDiskCacheRef,
    build_latents_cache_image_key,
    build_safetensors_cache_dir,
    build_safetensors_shard_stem,
    build_safetensors_sidecar_path,
    load_safetensors_shard_manifest,
    normalize_latents_disk_cache_format,
    resolve_latents_cache_root,
    safe_open_torch_cpu,
    save_safetensors_shard_manifest,
)
from library.safetensors_utils import mem_eff_save_file

# TODO remove circular import by moving ImageInfo to a separate file
# from library.train_util import ImageInfo

from library.utils import setup_logging

setup_logging()
import logging

logger = logging.getLogger(__name__)


def _resolve_npz_cache_items(env_key: str, default_value: int) -> int:
    raw_value = os.environ.get(env_key, "")
    if not raw_value:
        return max(0, int(default_value))
    try:
        resolved = int(raw_value)
    except (TypeError, ValueError):
        return max(0, int(default_value))
    return max(0, resolved)


def _resolve_npz_cache_identity(npz_path: str) -> tuple[str, int, int]:
    stat = os.stat(npz_path)
    return (npz_path, int(stat.st_mtime_ns), int(stat.st_size))


def _resolve_npz_write_workers(env_key: str, default_value: int) -> int:
    raw_value = os.environ.get(env_key, "")
    if not raw_value:
        return max(0, int(default_value))
    try:
        resolved = int(raw_value)
    except (TypeError, ValueError):
        return max(0, int(default_value))
    return max(0, resolved)


def _resolve_runtime_flag(env_key: str, default_value: bool) -> bool:
    raw_value = os.environ.get(env_key, "")
    if not raw_value:
        return bool(default_value)
    return str(raw_value).strip().lower() in {"1", "true", "yes", "on"}


def _normalize_optional_int(value: Optional[Any], *, minimum: int) -> Optional[int]:
    if value is None or value == "":
        return None
    try:
        resolved = int(value)
    except (TypeError, ValueError):
        return None
    return max(minimum, resolved)


def _resolve_runtime_int(
    explicit_value: Optional[Any],
    runtime_value: Optional[Any],
    env_key: str,
    default_value: int,
    *,
    minimum: int,
) -> int:
    normalized_explicit_value = _normalize_optional_int(explicit_value, minimum=minimum)
    if normalized_explicit_value is not None:
        return normalized_explicit_value

    normalized_runtime_value = _normalize_optional_int(runtime_value, minimum=minimum)
    if normalized_runtime_value is not None:
        return normalized_runtime_value

    raw_value = os.environ.get(env_key, "")
    if raw_value:
        normalized_env_value = _normalize_optional_int(raw_value, minimum=minimum)
        if normalized_env_value is not None:
            return normalized_env_value

    return max(minimum, int(default_value))


_LATENTS_CACHE_RUNTIME_DEFAULTS = {
    "preprocess_workers": None,
    "prefetch_batches": None,
    "disk_cache_format": None,
}


def configure_latents_cache_runtime(
    *,
    preprocess_workers: Optional[Any] = None,
    prefetch_batches: Optional[Any] = None,
    disk_cache_format: Optional[Any] = None,
) -> None:
    _LATENTS_CACHE_RUNTIME_DEFAULTS["preprocess_workers"] = _normalize_optional_int(preprocess_workers, minimum=0)
    _LATENTS_CACHE_RUNTIME_DEFAULTS["prefetch_batches"] = _normalize_optional_int(prefetch_batches, minimum=1)
    normalized_format = None if disk_cache_format in (None, "") else normalize_latents_disk_cache_format(disk_cache_format)
    _LATENTS_CACHE_RUNTIME_DEFAULTS["disk_cache_format"] = normalized_format


@dataclass
class PreparedLatentsBatch:
    img_tensor: torch.Tensor
    alpha_masks: List[Optional[Union[torch.Tensor, np.ndarray]]]
    original_sizes: List[Tuple[int, int]]
    crop_ltrbs: List[Tuple[int, int, int, int]]


@dataclass
class PendingSafetensorsLatentsEntry:
    info: Any
    latents_tensor: torch.Tensor
    original_size: Tuple[int, int]
    crop_ltrb: Tuple[int, int, int, int]
    flipped_latents_tensor: Optional[torch.Tensor]
    alpha_mask_tensor: Optional[torch.Tensor]


class TokenizeStrategy:
    _strategy = None  # strategy instance: actual strategy class

    _re_attention = re.compile(
        r"""\\\(|
\\\)|
\\\[|
\\]|
\\\\|
\\|
\(|
\[|
:([+-]?[.\d]+)\)|
\)|
]|
[^\\()\[\]:]+|
:
""",
        re.X,
    )

    @classmethod
    def set_strategy(cls, strategy):
        if cls._strategy is not None:
            raise RuntimeError(f"Internal error. {cls.__name__} strategy is already set")
        cls._strategy = strategy

    @classmethod
    def get_strategy(cls) -> Optional["TokenizeStrategy"]:
        return cls._strategy

    def _load_tokenizer(
        self, model_class: Any, model_id: str, subfolder: Optional[str] = None, tokenizer_cache_dir: Optional[str] = None
    ) -> Any:
        tokenizer = None
        if tokenizer_cache_dir:
            local_tokenizer_path = os.path.join(tokenizer_cache_dir, model_id.replace("/", "_"))
            if os.path.exists(local_tokenizer_path):
                logger.info(f"load tokenizer from cache: {local_tokenizer_path}")
                tokenizer = model_class.from_pretrained(local_tokenizer_path)  # same for v1 and v2

        if tokenizer is None:
            tokenizer = model_class.from_pretrained(model_id, subfolder=subfolder)

        if tokenizer_cache_dir and not os.path.exists(local_tokenizer_path):
            logger.info(f"save Tokenizer to cache: {local_tokenizer_path}")
            tokenizer.save_pretrained(local_tokenizer_path)

        return tokenizer

    def tokenize(self, text: Union[str, List[str]]) -> List[torch.Tensor]:
        raise NotImplementedError

    def tokenize_with_weights(self, text: Union[str, List[str]]) -> Tuple[List[torch.Tensor], List[torch.Tensor]]:
        """
        returns: [tokens1, tokens2, ...], [weights1, weights2, ...]
        """
        raise NotImplementedError

    def _get_weighted_input_ids(
        self, tokenizer: CLIPTokenizer, text: str, max_length: Optional[int] = None
    ) -> Tuple[torch.Tensor, torch.Tensor]:
        """
        max_length includes starting and ending tokens.
        """

        def parse_prompt_attention(text):
            """
            Parses a string with attention tokens and returns a list of pairs: text and its associated weight.
            Accepted tokens are:
            (abc) - increases attention to abc by a multiplier of 1.1
            (abc:3.12) - increases attention to abc by a multiplier of 3.12
            [abc] - decreases attention to abc by a multiplier of 1.1
            \( - literal character '('
            \[ - literal character '['
            \) - literal character ')'
            \] - literal character ']'
            \\ - literal character '\'
            anything else - just text
            >>> parse_prompt_attention('normal text')
            [['normal text', 1.0]]
            >>> parse_prompt_attention('an (important) word')
            [['an ', 1.0], ['important', 1.1], [' word', 1.0]]
            >>> parse_prompt_attention('(unbalanced')
            [['unbalanced', 1.1]]
            >>> parse_prompt_attention('\(literal\]')
            [['(literal]', 1.0]]
            >>> parse_prompt_attention('(unnecessary)(parens)')
            [['unnecessaryparens', 1.1]]
            >>> parse_prompt_attention('a (((house:1.3)) [on] a (hill:0.5), sun, (((sky))).')
            [['a ', 1.0],
            ['house', 1.5730000000000004],
            [' ', 1.1],
            ['on', 1.0],
            [' a ', 1.1],
            ['hill', 0.55],
            [', sun, ', 1.1],
            ['sky', 1.4641000000000006],
            ['.', 1.1]]
            """

            res = []
            round_brackets = []
            square_brackets = []

            round_bracket_multiplier = 1.1
            square_bracket_multiplier = 1 / 1.1

            def multiply_range(start_position, multiplier):
                for p in range(start_position, len(res)):
                    res[p][1] *= multiplier

            for m in TokenizeStrategy._re_attention.finditer(text):
                text = m.group(0)
                weight = m.group(1)

                if text.startswith("\\"):
                    res.append([text[1:], 1.0])
                elif text == "(":
                    round_brackets.append(len(res))
                elif text == "[":
                    square_brackets.append(len(res))
                elif weight is not None and len(round_brackets) > 0:
                    multiply_range(round_brackets.pop(), float(weight))
                elif text == ")" and len(round_brackets) > 0:
                    multiply_range(round_brackets.pop(), round_bracket_multiplier)
                elif text == "]" and len(square_brackets) > 0:
                    multiply_range(square_brackets.pop(), square_bracket_multiplier)
                else:
                    res.append([text, 1.0])

            for pos in round_brackets:
                multiply_range(pos, round_bracket_multiplier)

            for pos in square_brackets:
                multiply_range(pos, square_bracket_multiplier)

            if len(res) == 0:
                res = [["", 1.0]]

            # merge runs of identical weights
            i = 0
            while i + 1 < len(res):
                if res[i][1] == res[i + 1][1]:
                    res[i][0] += res[i + 1][0]
                    res.pop(i + 1)
                else:
                    i += 1

            return res

        def get_prompts_with_weights(text: str, max_length: int):
            r"""
            Tokenize a list of prompts and return its tokens with weights of each token. max_length does not include starting and ending token.

            No padding, starting or ending token is included.
            """
            truncated = False

            texts_and_weights = parse_prompt_attention(text)
            tokens = []
            weights = []
            for word, weight in texts_and_weights:
                # tokenize and discard the starting and the ending token
                token = tokenizer(word).input_ids[1:-1]
                tokens += token
                # copy the weight by length of token
                weights += [weight] * len(token)
                # stop if the text is too long (longer than truncation limit)
                if len(tokens) > max_length:
                    truncated = True
                    break
            # truncate
            if len(tokens) > max_length:
                truncated = True
                tokens = tokens[:max_length]
                weights = weights[:max_length]
            if truncated:
                logger.warning("Prompt was truncated. Try to shorten the prompt or increase max_embeddings_multiples")
            return tokens, weights

        def pad_tokens_and_weights(tokens, weights, max_length, bos, eos, pad):
            r"""
            Pad the tokens (with starting and ending tokens) and weights (with 1.0) to max_length.
            """
            tokens = [bos] + tokens + [eos] + [pad] * (max_length - 2 - len(tokens))
            weights = [1.0] + weights + [1.0] * (max_length - 1 - len(weights))
            return tokens, weights

        if max_length is None:
            max_length = tokenizer.model_max_length

        tokens, weights = get_prompts_with_weights(text, max_length - 2)
        tokens, weights = pad_tokens_and_weights(
            tokens, weights, max_length, tokenizer.bos_token_id, tokenizer.eos_token_id, tokenizer.pad_token_id
        )
        return torch.tensor(tokens).unsqueeze(0), torch.tensor(weights).unsqueeze(0)

    def _get_input_ids(
        self, tokenizer: CLIPTokenizer, text: str, max_length: Optional[int] = None, weighted: bool = False
    ) -> torch.Tensor:
        """
        for SD1.5/2.0/SDXL
        TODO support batch input
        """
        if max_length is None:
            max_length = tokenizer.model_max_length - 2

        if weighted:
            input_ids, weights = self._get_weighted_input_ids(tokenizer, text, max_length)
        else:
            input_ids = tokenizer(text, padding="max_length", truncation=True, max_length=max_length, return_tensors="pt").input_ids

        if max_length > tokenizer.model_max_length:
            input_ids = input_ids.squeeze(0)
            iids_list = []
            if tokenizer.pad_token_id == tokenizer.eos_token_id:
                # v1
                # 77以上の時は "<BOS> .... <EOS> <EOS> <EOS>" でトータル227とかになっているので、"<BOS>...<EOS>"の三連に変換する
                # 1111氏のやつは , で区切る、とかしているようだが　とりあえず単純に
                for i in range(1, max_length - tokenizer.model_max_length + 2, tokenizer.model_max_length - 2):  # (1, 152, 75)
                    ids_chunk = (
                        input_ids[0].unsqueeze(0),
                        input_ids[i : i + tokenizer.model_max_length - 2],
                        input_ids[-1].unsqueeze(0),
                    )
                    ids_chunk = torch.cat(ids_chunk)
                    iids_list.append(ids_chunk)
            else:
                # v2 or SDXL
                # 77以上の時は "<BOS> .... <EOS> <PAD> <PAD>..." でトータル227とかになっているので、"<BOS>...<EOS> <PAD> <PAD> ..."の三連に変換する
                for i in range(1, max_length - tokenizer.model_max_length + 2, tokenizer.model_max_length - 2):
                    ids_chunk = (
                        input_ids[0].unsqueeze(0),  # BOS
                        input_ids[i : i + tokenizer.model_max_length - 2],
                        input_ids[-1].unsqueeze(0),
                    )  # PAD or EOS
                    ids_chunk = torch.cat(ids_chunk)

                    # 末尾が <EOS> <PAD> または <PAD> <PAD> の場合は、何もしなくてよい
                    # 末尾が x <PAD/EOS> の場合は末尾を <EOS> に変える（x <EOS> なら結果的に変化なし）
                    if ids_chunk[-2] != tokenizer.eos_token_id and ids_chunk[-2] != tokenizer.pad_token_id:
                        ids_chunk[-1] = tokenizer.eos_token_id
                    # 先頭が <BOS> <PAD> ... の場合は <BOS> <EOS> <PAD> ... に変える
                    if ids_chunk[1] == tokenizer.pad_token_id:
                        ids_chunk[1] = tokenizer.eos_token_id

                    iids_list.append(ids_chunk)

            input_ids = torch.stack(iids_list)  # 3,77

            if weighted:
                weights = weights.squeeze(0)
                new_weights = torch.ones(input_ids.shape)
                for i in range(1, max_length - tokenizer.model_max_length + 2, tokenizer.model_max_length - 2):
                    b = i // (tokenizer.model_max_length - 2)
                    new_weights[b, 1 : 1 + tokenizer.model_max_length - 2] = weights[i : i + tokenizer.model_max_length - 2]
                weights = new_weights

        if weighted:
            return input_ids, weights
        return input_ids


class TextEncodingStrategy:
    _strategy = None  # strategy instance: actual strategy class

    @classmethod
    def set_strategy(cls, strategy):
        if cls._strategy is not None:
            raise RuntimeError(f"Internal error. {cls.__name__} strategy is already set")
        cls._strategy = strategy

    @classmethod
    def get_strategy(cls) -> Optional["TextEncodingStrategy"]:
        return cls._strategy

    def encode_tokens(
        self, tokenize_strategy: TokenizeStrategy, models: List[Any], tokens: List[torch.Tensor]
    ) -> List[torch.Tensor]:
        """
        Encode tokens into embeddings and outputs.
        :param tokens: list of token tensors for each TextModel
        :return: list of output embeddings for each architecture
        """
        raise NotImplementedError

    def encode_tokens_with_weights(
        self, tokenize_strategy: TokenizeStrategy, models: List[Any], tokens: List[torch.Tensor], weights: List[torch.Tensor]
    ) -> List[torch.Tensor]:
        """
        Encode tokens into embeddings and outputs.
        :param tokens: list of token tensors for each TextModel
        :param weights: list of weight tensors for each TextModel
        :return: list of output embeddings for each architecture
        """
        raise NotImplementedError


class TextEncoderOutputsCachingStrategy:
    _strategy = None  # strategy instance: actual strategy class

    def __init__(
        self,
        cache_to_disk: bool,
        batch_size: Optional[int],
        skip_disk_cache_validity_check: bool,
        is_partial: bool = False,
        is_weighted: bool = False,
    ) -> None:
        self._cache_to_disk = cache_to_disk
        self._batch_size = batch_size
        self.skip_disk_cache_validity_check = skip_disk_cache_validity_check
        self._is_partial = is_partial
        self._is_weighted = is_weighted
        self._npz_cache_items = _resolve_npz_cache_items("MIKAZUKI_TEXT_NPZ_CACHE_ITEMS", 32)
        self._npz_cache: OrderedDict[tuple[str, int, int], dict[str, np.ndarray]] = OrderedDict()

    @classmethod
    def set_strategy(cls, strategy):
        if cls._strategy is not None:
            raise RuntimeError(f"Internal error. {cls.__name__} strategy is already set")
        cls._strategy = strategy

    @classmethod
    def get_strategy(cls) -> Optional["TextEncoderOutputsCachingStrategy"]:
        return cls._strategy

    @property
    def cache_to_disk(self):
        return self._cache_to_disk

    @property
    def batch_size(self):
        return self._batch_size

    @property
    def is_partial(self):
        return self._is_partial

    @property
    def is_weighted(self):
        return self._is_weighted

    def _load_npz_archive(self, npz_path: str) -> dict[str, np.ndarray]:
        cache_identity = None
        if self._npz_cache_items > 0:
            try:
                cache_identity = _resolve_npz_cache_identity(npz_path)
            except OSError:
                cache_identity = None
            if cache_identity is not None and cache_identity in self._npz_cache:
                self._npz_cache.move_to_end(cache_identity)
                return self._npz_cache[cache_identity]

        with np.load(npz_path, allow_pickle=False) as npz:
            archive = {key: np.asarray(npz[key]) for key in npz.files}

        if cache_identity is not None:
            self._npz_cache[cache_identity] = archive
            while len(self._npz_cache) > self._npz_cache_items:
                self._npz_cache.popitem(last=False)
        return archive

    def get_outputs_npz_path(self, image_abs_path: str) -> str:
        raise NotImplementedError

    def load_outputs_npz(self, npz_path: str) -> List[np.ndarray]:
        raise NotImplementedError

    def is_disk_cached_outputs_expected(self, npz_path: str) -> bool:
        raise NotImplementedError

    def cache_batch_outputs(
        self, tokenize_strategy: TokenizeStrategy, models: List[Any], text_encoding_strategy: TextEncodingStrategy, batch: List
    ):
        raise NotImplementedError


class LatentsCachingStrategy:
    # TODO commonize utillity functions to this class, such as npz handling etc.

    _strategy = None  # strategy instance: actual strategy class

    def __init__(self, cache_to_disk: bool, batch_size: int, skip_disk_cache_validity_check: bool) -> None:
        self._cache_to_disk = cache_to_disk
        self._batch_size = batch_size
        self.skip_disk_cache_validity_check = skip_disk_cache_validity_check
        self._disk_cache_format = normalize_latents_disk_cache_format(
            _LATENTS_CACHE_RUNTIME_DEFAULTS.get("disk_cache_format")
            or os.environ.get("MIKAZUKI_LATENTS_DISK_CACHE_FORMAT")
            or "safetensors"
        )
        self._npz_cache_items = _resolve_npz_cache_items("MIKAZUKI_LATENTS_NPZ_CACHE_ITEMS", 16)
        self._npz_cache: OrderedDict[tuple[str, int, int], dict[str, np.ndarray]] = OrderedDict()
        self._dynamic_batch_enabled = _resolve_runtime_flag("MIKAZUKI_LATENTS_CACHE_DYNAMIC_BATCH", True)
        self._dynamic_batch_reference_edge = _resolve_runtime_int(
            None,
            None,
            "MIKAZUKI_LATENTS_CACHE_DYNAMIC_BATCH_REFERENCE_EDGE",
            1024,
            minimum=64,
        )
        self._dynamic_batch_max_size = _resolve_runtime_int(
            None,
            None,
            "MIKAZUKI_LATENTS_CACHE_DYNAMIC_BATCH_MAX",
            min(32, max(int(batch_size or 1) * 4, 4)),
            minimum=1,
        )
        self._bucket_batch_size_cache: dict[Tuple[int, int], int] = {}
        self._logged_bucket_batch_sizes: set[Tuple[int, int]] = set()
        self._preprocess_workers = _resolve_runtime_int(
            None,
            _LATENTS_CACHE_RUNTIME_DEFAULTS.get("preprocess_workers"),
            "MIKAZUKI_LATENTS_CACHE_PREPROCESS_WORKERS",
            1,
            minimum=0,
        )
        default_prefetch_batches = 0 if self._preprocess_workers <= 0 else max(2, self._preprocess_workers)
        self._prefetch_batches = _resolve_runtime_int(
            None,
            _LATENTS_CACHE_RUNTIME_DEFAULTS.get("prefetch_batches"),
            "MIKAZUKI_LATENTS_CACHE_PREFETCH_BATCHES",
            default_prefetch_batches,
            minimum=1,
        )
        if self._preprocess_workers <= 0:
            self._prefetch_batches = 0
        self._npz_write_workers = _resolve_npz_write_workers("MIKAZUKI_LATENTS_NPZ_WRITE_WORKERS", 2) if cache_to_disk else 0
        self._npz_write_executor = (
            ThreadPoolExecutor(max_workers=self._npz_write_workers, thread_name_prefix="latents-npz")
            if self._npz_write_workers > 0
            else None
        )
        self._pending_npz_writes: List[Future] = []
        self._max_pending_npz_writes = max(1, self._npz_write_workers * 4) if self._npz_write_workers > 0 else 0
        self._safetensors_catalog_cache: dict[str, dict[str, dict[str, Any]]] = {}
        self._pending_safetensors_entries: List[PendingSafetensorsLatentsEntry] = []
        self._pending_safetensors_context: Optional[dict[str, Any]] = None
        self._max_pending_safetensors_entries = max(64, max(1, self.max_batch_size) * 16)

    @classmethod
    def set_strategy(cls, strategy):
        if cls._strategy is not None:
            raise RuntimeError(f"Internal error. {cls.__name__} strategy is already set")
        cls._strategy = strategy

    @classmethod
    def get_strategy(cls) -> Optional["LatentsCachingStrategy"]:
        return cls._strategy

    @property
    def cache_to_disk(self):
        return self._cache_to_disk

    @property
    def batch_size(self):
        return self._batch_size

    @property
    def disk_cache_format(self) -> str:
        return self._disk_cache_format

    @property
    def uses_safetensors_disk_cache(self) -> bool:
        return self._cache_to_disk and self._disk_cache_format == "safetensors"

    @property
    def uses_npz_disk_cache(self) -> bool:
        return self._cache_to_disk and self._disk_cache_format == "npz"

    @property
    def max_batch_size(self) -> int:
        if self._dynamic_batch_enabled:
            return max(self._batch_size, self._dynamic_batch_max_size)
        return self._batch_size

    @property
    def preprocess_workers(self) -> int:
        return self._preprocess_workers

    @property
    def prefetch_batches(self) -> int:
        return self._prefetch_batches

    @property
    def disk_cache_namespace(self) -> str:
        cache_suffix = str(self.cache_suffix or "")
        normalized = cache_suffix[:-4] if cache_suffix.endswith(".npz") else cache_suffix
        normalized = normalized.strip("._")
        return normalized or "latents"

    def _load_npz_archive(self, npz_path: str) -> dict[str, np.ndarray]:
        cache_identity = None
        if self._npz_cache_items > 0:
            try:
                cache_identity = _resolve_npz_cache_identity(npz_path)
            except OSError:
                cache_identity = None
            if cache_identity is not None and cache_identity in self._npz_cache:
                self._npz_cache.move_to_end(cache_identity)
                return self._npz_cache[cache_identity]

        with np.load(npz_path, allow_pickle=False) as npz:
            archive = {key: np.asarray(npz[key]) for key in npz.files}

        if cache_identity is not None:
            self._npz_cache[cache_identity] = archive
            while len(self._npz_cache) > self._npz_cache_items:
                self._npz_cache.popitem(last=False)
        return archive

    def resolve_disk_cache_root(self, absolute_path: str, dataset_root: Optional[str] = None) -> str:
        return resolve_latents_cache_root(absolute_path, dataset_root)

    def build_disk_cache_image_key(
        self,
        absolute_path: str,
        cache_root: str,
        *,
        image_size: Optional[Tuple[int, int]] = None,
        bucket_reso: Optional[Tuple[int, int]] = None,
        flip_aug: Optional[bool] = None,
        alpha_mask: Optional[bool] = None,
    ) -> str:
        return build_latents_cache_image_key(
            absolute_path,
            cache_root,
            image_size=image_size,
            bucket_reso=bucket_reso,
            flip_aug=flip_aug,
            alpha_mask=alpha_mask,
        )

    def _get_safetensors_cache_dir(self, cache_root: str) -> str:
        normalized_cache_root = os.path.abspath(cache_root)
        return build_safetensors_cache_dir(normalized_cache_root, self.disk_cache_namespace)

    def _load_safetensors_catalog(self, cache_root: str) -> dict[str, dict[str, Any]]:
        normalized_cache_root = os.path.abspath(cache_root)
        cached_catalog = self._safetensors_catalog_cache.get(normalized_cache_root)
        if cached_catalog is not None:
            return cached_catalog

        cache_dir = self._get_safetensors_cache_dir(normalized_cache_root)
        catalog: dict[str, dict[str, Any]] = {}
        if os.path.isdir(cache_dir):
            for entry in os.scandir(cache_dir):
                if not entry.is_file() or not entry.name.lower().endswith(".json"):
                    continue

                try:
                    manifest = load_safetensors_shard_manifest(entry.path)
                except Exception as ex:
                    logger.warning(f"failed to load latent-cache manifest {entry.path}: {ex}")
                    continue

                if str(manifest.get("namespace") or self.disk_cache_namespace) != self.disk_cache_namespace:
                    continue

                shard_file = str(manifest.get("shard_file") or "")
                if shard_file:
                    shard_path = shard_file if os.path.isabs(shard_file) else os.path.join(cache_dir, shard_file)
                else:
                    shard_path = os.path.splitext(entry.path)[0] + ".safetensors"
                shard_path = os.path.abspath(shard_path)
                if not os.path.exists(shard_path):
                    continue

                for manifest_entry in manifest.get("entries") or []:
                    image_key = str(manifest_entry.get("image_key") or "").strip()
                    entry_key = str(manifest_entry.get("entry_key") or "").strip()
                    if not image_key or not entry_key:
                        continue

                    catalog[image_key] = {
                        "path": shard_path,
                        "entry_key": entry_key,
                        "image_size": tuple(manifest_entry.get("image_size") or ()),
                        "bucket_reso": tuple(manifest_entry.get("bucket_reso") or manifest.get("bucket_reso") or ()),
                        "flip_aug": bool(manifest_entry.get("flip_aug", manifest.get("flip_aug"))),
                        "alpha_mask": bool(manifest_entry.get("alpha_mask", manifest.get("alpha_mask"))),
                        "source_mtime_ns": int(manifest_entry.get("source_mtime_ns", 0) or 0),
                        "source_size": int(manifest_entry.get("source_size", 0) or 0),
                    }

        self._safetensors_catalog_cache[normalized_cache_root] = catalog
        return catalog

    def _update_safetensors_catalog_entry(
        self,
        cache_root: str,
        image_key: str,
        *,
        shard_path: str,
        entry_key: str,
        image_size: Optional[Tuple[int, int]],
        bucket_reso: Tuple[int, int],
        flip_aug: bool,
        alpha_mask: bool,
        source_mtime_ns: int,
        source_size: int,
    ) -> None:
        normalized_cache_root = os.path.abspath(cache_root)
        catalog = self._safetensors_catalog_cache.setdefault(normalized_cache_root, {})
        catalog[str(image_key)] = {
            "path": os.path.abspath(shard_path),
            "entry_key": str(entry_key),
            "image_size": tuple(image_size or ()),
            "bucket_reso": tuple(bucket_reso),
            "flip_aug": bool(flip_aug),
            "alpha_mask": bool(alpha_mask),
            "source_mtime_ns": int(source_mtime_ns),
            "source_size": int(source_size),
        }

    @property
    def cache_suffix(self):
        raise NotImplementedError

    def get_image_size_from_disk_cache_path(self, absolute_path: str, npz_path: str) -> Tuple[Optional[int], Optional[int]]:
        w, h = os.path.splitext(npz_path)[0].split("_")[-2].split("x")
        return int(w), int(h)

    def get_latents_npz_path(self, absolute_path: str, image_size: Tuple[int, int]) -> str:
        raise NotImplementedError

    def find_existing_latents_disk_cache_ref(
        self,
        absolute_path: str,
        image_size: Tuple[int, int],
        *,
        cache_root: Optional[str],
        bucket_reso: Tuple[int, int],
        flip_aug: bool,
        alpha_mask: bool,
    ) -> Optional[LatentsDiskCacheRef]:
        if not self.cache_to_disk:
            return None

        if self._disk_cache_format == "npz":
            npz_path = self.get_latents_npz_path(absolute_path, image_size)
            if self.is_disk_cached_latents_expected(bucket_reso, npz_path, flip_aug, alpha_mask):
                return LatentsDiskCacheRef(format="npz", path=npz_path)
            return None

        cache_root = self.resolve_disk_cache_root(absolute_path, cache_root)
        image_key = self.build_disk_cache_image_key(
            absolute_path,
            cache_root,
            image_size=image_size,
            bucket_reso=bucket_reso,
            flip_aug=flip_aug,
            alpha_mask=alpha_mask,
        )
        catalog = self._load_safetensors_catalog(cache_root)
        entry = catalog.get(image_key)
        if entry is None:
            legacy_image_key = self.build_disk_cache_image_key(absolute_path, cache_root)
            entry = catalog.get(legacy_image_key)
        if entry is not None:
            if tuple(entry.get("bucket_reso") or ()) == tuple(bucket_reso):
                entry_image_size = tuple(entry.get("image_size") or ())
                if entry_image_size and entry_image_size != tuple(image_size):
                    entry = None
                else:
                    if bool(entry.get("flip_aug")) == bool(flip_aug) and bool(entry.get("alpha_mask")) == bool(alpha_mask):
                        shard_path = str(entry.get("path") or "")
                        entry_key = str(entry.get("entry_key") or "")
                        if shard_path and entry_key and os.path.exists(shard_path):
                            try:
                                source_stat = os.stat(absolute_path)
                            except OSError:
                                source_stat = None
                            if source_stat is not None:
                                if int(entry.get("source_mtime_ns", 0) or 0) == int(source_stat.st_mtime_ns):
                                    if int(entry.get("source_size", 0) or 0) == int(source_stat.st_size):
                                        return LatentsDiskCacheRef(format="safetensors", path=shard_path, entry_key=entry_key)

        npz_path = self.get_latents_npz_path(absolute_path, image_size)
        if self.is_disk_cached_latents_expected(bucket_reso, npz_path, flip_aug, alpha_mask):
            return LatentsDiskCacheRef(format="npz", path=npz_path)
        return None

    def is_disk_cached_latents_expected(
        self, bucket_reso: Tuple[int, int], npz_path: str, flip_aug: bool, alpha_mask: bool
    ) -> bool:
        raise NotImplementedError

    def cache_batch_latents(self, model: Any, batch: List, flip_aug: bool, alpha_mask: bool, random_crop: bool):
        raise NotImplementedError

    def resolve_cache_batch_size(self, bucket_reso: Optional[Tuple[int, int]]) -> int:
        base_batch_size = max(1, int(self._batch_size or 1))
        if not self._dynamic_batch_enabled or bucket_reso is None:
            return base_batch_size

        normalized_bucket_reso = (int(bucket_reso[0]), int(bucket_reso[1]))
        cached_batch_size = self._bucket_batch_size_cache.get(normalized_bucket_reso)
        if cached_batch_size is not None:
            return cached_batch_size

        bucket_pixels = max(1, normalized_bucket_reso[0] * normalized_bucket_reso[1])
        reference_pixels = max(1, int(self._dynamic_batch_reference_edge) * int(self._dynamic_batch_reference_edge))
        scaled_batch_size = max(1, int(math.floor(base_batch_size * (reference_pixels / bucket_pixels))))
        resolved_batch_size = min(self._dynamic_batch_max_size, scaled_batch_size)
        resolved_batch_size = max(1, resolved_batch_size)

        self._bucket_batch_size_cache[normalized_bucket_reso] = resolved_batch_size
        if normalized_bucket_reso not in self._logged_bucket_batch_sizes:
            logger.info(
                "latent cache auto batch for bucket "
                f"{normalized_bucket_reso[0]}x{normalized_bucket_reso[1]}: {resolved_batch_size} "
                f"(base={base_batch_size}, reference={self._dynamic_batch_reference_edge})"
            )
            self._logged_bucket_batch_sizes.add(normalized_bucket_reso)
        return resolved_batch_size

    def prepare_batch_latents(
        self,
        image_infos: List,
        apply_alpha_mask: bool,
        random_crop: bool,
    ) -> PreparedLatentsBatch:
        from library import train_util  # import here to avoid circular import

        img_tensor, alpha_masks, original_sizes, crop_ltrbs = train_util.load_images_and_masks_for_caching(
            image_infos, apply_alpha_mask, random_crop
        )
        return PreparedLatentsBatch(img_tensor, alpha_masks, original_sizes, crop_ltrbs)

    def cache_batch_latents_prepared(
        self,
        model: Any,
        image_infos: List,
        prepared_batch: PreparedLatentsBatch,
        flip_aug: bool,
        alpha_mask: bool,
        random_crop: bool,
    ) -> None:
        raise NotImplementedError

    def finalize_caching(self) -> None:
        self.flush_pending_disk_cache()
        self._drain_pending_npz_writes(wait_for_all=True)
        if self._npz_write_executor is not None:
            self._npz_write_executor.shutdown(wait=True)
            self._npz_write_executor = None

    def flush_pending_disk_cache(self) -> None:
        self._flush_pending_safetensors_entries()

    def _collect_finished_npz_writes(self) -> None:
        if not self._pending_npz_writes:
            return

        pending_writes: List[Future] = []
        for future in self._pending_npz_writes:
            if future.done():
                future.result()
            else:
                pending_writes.append(future)
        self._pending_npz_writes = pending_writes

    def _drain_pending_npz_writes(self, wait_for_all: bool = False) -> None:
        if self._npz_write_executor is None or not self._pending_npz_writes:
            return

        self._collect_finished_npz_writes()
        if not self._pending_npz_writes:
            return

        if wait_for_all:
            done, not_done = wait(self._pending_npz_writes)
        elif len(self._pending_npz_writes) < self._max_pending_npz_writes:
            return
        else:
            done, not_done = wait(self._pending_npz_writes, return_when=FIRST_COMPLETED)

        for future in done:
            future.result()
        self._pending_npz_writes = list(not_done)

    def _flush_pending_safetensors_entries(self) -> None:
        if not self._pending_safetensors_entries or self._pending_safetensors_context is None:
            return

        context = dict(self._pending_safetensors_context)
        entries = list(self._pending_safetensors_entries)
        self._pending_safetensors_entries = []
        self._pending_safetensors_context = None

        cache_root = str(context["cache_root"])
        cache_dir = self._get_safetensors_cache_dir(cache_root)
        os.makedirs(cache_dir, exist_ok=True)

        shard_stem = build_safetensors_shard_stem(
            tuple(context["bucket_reso"]),
            flip_aug=bool(context["flip_aug"]),
            alpha_mask=bool(context["alpha_mask"]),
        )
        shard_path = os.path.join(cache_dir, shard_stem + ".safetensors")
        sidecar_path = build_safetensors_sidecar_path(shard_path)

        tensors: dict[str, torch.Tensor] = {}
        sidecar_entries: list[dict[str, Any]] = []

        for entry_index, entry in enumerate(entries):
            entry_key = f"{entry_index:08d}"
            tensors[f"latents::{entry_key}"] = entry.latents_tensor.detach().cpu().contiguous()
            tensors[f"original_size::{entry_key}"] = torch.tensor(entry.original_size, dtype=torch.int32)
            tensors[f"crop_ltrb::{entry_key}"] = torch.tensor(entry.crop_ltrb, dtype=torch.int32)

            if entry.flipped_latents_tensor is not None:
                tensors[f"latents_flipped::{entry_key}"] = entry.flipped_latents_tensor.detach().cpu().contiguous()
            if entry.alpha_mask_tensor is not None:
                tensors[f"alpha_mask::{entry_key}"] = entry.alpha_mask_tensor.detach().cpu().contiguous()

            cache_root_for_entry = str(getattr(entry.info, "latents_cache_root", "") or cache_root)
            image_key = self.build_disk_cache_image_key(
                entry.info.absolute_path,
                cache_root_for_entry,
                image_size=getattr(entry.info, "image_size", None),
                bucket_reso=tuple(context["bucket_reso"]),
                flip_aug=bool(context["flip_aug"]),
                alpha_mask=bool(context["alpha_mask"]),
            )
            try:
                source_stat = os.stat(entry.info.absolute_path)
                source_mtime_ns = int(source_stat.st_mtime_ns)
                source_size = int(source_stat.st_size)
            except OSError:
                source_mtime_ns = 0
                source_size = 0

            sidecar_entries.append(
                {
                    "image_key": image_key,
                    "entry_key": entry_key,
                    "image_size": list(getattr(entry.info, "image_size", ()) or ()),
                    "bucket_reso": list(tuple(context["bucket_reso"])),
                    "flip_aug": bool(context["flip_aug"]),
                    "alpha_mask": bool(context["alpha_mask"]),
                    "source_mtime_ns": source_mtime_ns,
                    "source_size": source_size,
                }
            )

            entry.info.latents_disk_cache_ref = LatentsDiskCacheRef(format="safetensors", path=shard_path, entry_key=entry_key)

            self._update_safetensors_catalog_entry(
                cache_root_for_entry,
                image_key,
                shard_path=shard_path,
                entry_key=entry_key,
                image_size=getattr(entry.info, "image_size", None),
                bucket_reso=tuple(context["bucket_reso"]),
                flip_aug=bool(context["flip_aug"]),
                alpha_mask=bool(context["alpha_mask"]),
                source_mtime_ns=source_mtime_ns,
                source_size=source_size,
            )

        mem_eff_save_file(
            tensors,
            shard_path,
            metadata={
                "format": "mikazuki_latents_safetensors_shard",
                "format_version": "1",
                "namespace": self.disk_cache_namespace,
                "bucket_reso": json.dumps(list(tuple(context["bucket_reso"]))),
                "flip_aug": "1" if context["flip_aug"] else "0",
                "alpha_mask": "1" if context["alpha_mask"] else "0",
                "entry_count": str(len(entries)),
            },
        )
        save_safetensors_shard_manifest(
            sidecar_path,
            {
                "format": "mikazuki_latents_safetensors_shard",
                "format_version": 1,
                "namespace": self.disk_cache_namespace,
                "shard_file": os.path.basename(shard_path),
                "bucket_reso": list(tuple(context["bucket_reso"])),
                "flip_aug": bool(context["flip_aug"]),
                "alpha_mask": bool(context["alpha_mask"]),
                "entries": sidecar_entries,
            },
        )

    @staticmethod
    def _latents_to_numpy_array(latents: Union[torch.Tensor, np.ndarray]) -> np.ndarray:
        if isinstance(latents, np.ndarray):
            return latents
        return latents.float().cpu().numpy()

    @staticmethod
    def _optional_mask_to_numpy(alpha_mask: Optional[Union[torch.Tensor, np.ndarray]]) -> Optional[np.ndarray]:
        if alpha_mask is None:
            return None
        if isinstance(alpha_mask, np.ndarray):
            return alpha_mask
        return alpha_mask.float().cpu().numpy()

    def _write_latents_npz(
        self,
        npz_path: str,
        latents_array: np.ndarray,
        original_size: Tuple[int, int],
        crop_ltrb: Tuple[int, int, int, int],
        flipped_latents_array: Optional[np.ndarray] = None,
        alpha_mask_array: Optional[np.ndarray] = None,
        key_reso_suffix: str = "",
    ) -> None:
        kwargs = {}

        if os.path.exists(npz_path):
            # load existing npz and update it
            with np.load(npz_path, allow_pickle=False) as npz:
                for key in npz.files:
                    kwargs[key] = np.asarray(npz[key])

        kwargs["latents" + key_reso_suffix] = latents_array
        kwargs["original_size" + key_reso_suffix] = np.asarray(original_size)
        kwargs["crop_ltrb" + key_reso_suffix] = np.asarray(crop_ltrb)
        if flipped_latents_array is not None:
            kwargs["latents_flipped" + key_reso_suffix] = flipped_latents_array
        if alpha_mask_array is not None:
            kwargs["alpha_mask" + key_reso_suffix] = alpha_mask_array
        np.savez(npz_path, **kwargs)

    def _queue_latents_npz_write(
        self,
        npz_path: str,
        latents_array: np.ndarray,
        original_size: Tuple[int, int],
        crop_ltrb: Tuple[int, int, int, int],
        flipped_latents_array: Optional[np.ndarray] = None,
        alpha_mask_array: Optional[np.ndarray] = None,
        key_reso_suffix: str = "",
    ) -> None:
        if self._npz_write_executor is None:
            self._write_latents_npz(
                npz_path,
                latents_array,
                original_size,
                crop_ltrb,
                flipped_latents_array,
                alpha_mask_array,
                key_reso_suffix,
            )
            return

        self._drain_pending_npz_writes(wait_for_all=False)
        future = self._npz_write_executor.submit(
            self._write_latents_npz,
            npz_path,
            latents_array,
            original_size,
            crop_ltrb,
            flipped_latents_array,
            alpha_mask_array,
            key_reso_suffix,
        )
        self._pending_npz_writes.append(future)

    def _queue_latents_safetensors_entries(
        self,
        image_infos: List,
        latents_tensors: Union[List[torch.Tensor], torch.Tensor],
        flipped_latents: Union[List[Optional[torch.Tensor]], torch.Tensor],
        alpha_masks: List[Optional[Union[torch.Tensor, np.ndarray]]],
        original_sizes: List[Tuple[int, int]],
        crop_ltrbs: List[Tuple[int, int, int, int]],
        *,
        bucket_reso: Tuple[int, int],
        flip_aug: bool,
        alpha_mask: bool,
    ) -> None:
        if not image_infos:
            return

        cache_root = str(getattr(image_infos[0], "latents_cache_root", "") or os.path.dirname(image_infos[0].absolute_path))
        context = {
            "cache_root": os.path.abspath(cache_root),
            "bucket_reso": tuple(bucket_reso),
            "flip_aug": bool(flip_aug),
            "alpha_mask": bool(alpha_mask),
        }

        if self._pending_safetensors_context is not None and self._pending_safetensors_context != context:
            self._flush_pending_safetensors_entries()

        if self._pending_safetensors_context is None:
            self._pending_safetensors_context = context

        if isinstance(latents_tensors, torch.Tensor):
            latents_items = [latents_tensors[i] for i in range(len(image_infos))]
        else:
            latents_items = list(latents_tensors)

        if isinstance(flipped_latents, torch.Tensor):
            flipped_items: List[Optional[torch.Tensor]] = [flipped_latents[i] for i in range(len(image_infos))]
        else:
            flipped_items = list(flipped_latents)

        for i, info in enumerate(image_infos):
            flipped_item = flipped_items[i] if i < len(flipped_items) else None
            alpha_mask_item = alpha_masks[i]
            if alpha_mask_item is not None and not isinstance(alpha_mask_item, torch.Tensor):
                alpha_mask_item = torch.from_numpy(alpha_mask_item)
            self._pending_safetensors_entries.append(
                PendingSafetensorsLatentsEntry(
                    info=info,
                    latents_tensor=latents_items[i],
                    original_size=original_sizes[i],
                    crop_ltrb=crop_ltrbs[i],
                    flipped_latents_tensor=flipped_item,
                    alpha_mask_tensor=alpha_mask_item,
                )
            )

        if len(self._pending_safetensors_entries) >= self._max_pending_safetensors_entries:
            self._flush_pending_safetensors_entries()

    def _default_is_disk_cached_latents_expected(
        self,
        latents_stride: int,
        bucket_reso: Tuple[int, int],
        npz_path: str,
        flip_aug: bool,
        apply_alpha_mask: bool,
        multi_resolution: bool = False,
    ) -> bool:
        """
        Args:
            latents_stride: stride of latents
            bucket_reso: resolution of the bucket
            npz_path: path to the npz file
            flip_aug: whether to flip images
            apply_alpha_mask: whether to apply alpha mask
            multi_resolution: whether to use multi-resolution latents

        Returns:
            bool
        """
        if not self.cache_to_disk:
            return False
        if not os.path.exists(npz_path):
            return False
        if self.skip_disk_cache_validity_check:
            return True

        expected_latents_size = (bucket_reso[1] // latents_stride, bucket_reso[0] // latents_stride)  # bucket_reso is (W, H)

        # e.g. "_32x64", HxW
        key_reso_suffix = f"_{expected_latents_size[0]}x{expected_latents_size[1]}" if multi_resolution else ""

        try:
            npz = self._load_npz_archive(npz_path)
            if "latents" + key_reso_suffix not in npz:
                return False
            latents = npz["latents" + key_reso_suffix]
            if latents.shape[1:3] != expected_latents_size:
                return False
            if flip_aug and "latents_flipped" + key_reso_suffix not in npz:
                return False
            if flip_aug:
                latents_flipped = npz["latents_flipped" + key_reso_suffix]
                if latents_flipped.shape[1:3] != expected_latents_size:
                    return False
            if apply_alpha_mask and "alpha_mask" + key_reso_suffix not in npz:
                return False
            if apply_alpha_mask:
                alpha_mask = npz["alpha_mask" + key_reso_suffix]
                if tuple(alpha_mask.shape[0:2]) != (bucket_reso[1], bucket_reso[0]):
                    return False
        except Exception as e:
            logger.error(f"Error loading file: {npz_path}")
            raise e

        return True

    # TODO remove circular dependency for ImageInfo
    def _default_cache_batch_latents(
        self,
        encode_by_vae: Callable,
        vae_device: torch.device,
        vae_dtype: torch.dtype,
        image_infos: List,
        flip_aug: bool,
        apply_alpha_mask: bool,
        random_crop: bool,
        multi_resolution: bool = False,
    ):
        """
        Default implementation for cache_batch_latents. Image loading, VAE, flipping, alpha mask handling are common.

        Args:
            encode_by_vae: function to encode images by VAE
            vae_device: device to use for VAE
            vae_dtype: dtype to use for VAE
            image_infos: list of ImageInfo
            flip_aug: whether to flip images
            apply_alpha_mask: whether to apply alpha mask
            random_crop: whether to random crop images
            multi_resolution: whether to use multi-resolution latents
        
        Returns: 
            None
        """
        prepared_batch = self.prepare_batch_latents(image_infos, apply_alpha_mask, random_crop)
        self._default_cache_batch_latents_prepared(
            encode_by_vae,
            vae_device,
            vae_dtype,
            image_infos,
            prepared_batch,
            flip_aug,
            multi_resolution=multi_resolution,
        )

    def _default_cache_batch_latents_prepared(
        self,
        encode_by_vae: Callable,
        vae_device: torch.device,
        vae_dtype: torch.dtype,
        image_infos: List,
        prepared_batch: PreparedLatentsBatch,
        flip_aug: bool,
        multi_resolution: bool = False,
    ):
        img_tensor = prepared_batch.img_tensor
        alpha_masks = prepared_batch.alpha_masks
        original_sizes = prepared_batch.original_sizes
        crop_ltrbs = prepared_batch.crop_ltrbs
        img_tensor = img_tensor.to(device=vae_device, dtype=vae_dtype)

        with torch.no_grad():
            latents_tensors = encode_by_vae(img_tensor).to("cpu")
        if flip_aug:
            img_tensor = torch.flip(img_tensor, dims=[3])
            with torch.no_grad():
                flipped_latents = encode_by_vae(img_tensor).to("cpu")
        else:
            flipped_latents = [None] * len(latents_tensors)

        if self.cache_to_disk and self._disk_cache_format == "npz" and isinstance(latents_tensors, torch.Tensor):
            latents_tensors = latents_tensors.float().numpy()
            if flip_aug and isinstance(flipped_latents, torch.Tensor):
                flipped_latents = flipped_latents.float().numpy()

        if self.cache_to_disk and self._disk_cache_format == "safetensors":
            self._queue_latents_safetensors_entries(
                image_infos,
                latents_tensors,
                flipped_latents,
                alpha_masks,
                original_sizes,
                crop_ltrbs,
                bucket_reso=tuple(image_infos[0].bucket_reso),
                flip_aug=flip_aug,
                alpha_mask=any(mask is not None for mask in alpha_masks),
            )
            return

        for i in range(len(image_infos)):
            info = image_infos[i]
            latents = latents_tensors[i]
            flipped_latent = flipped_latents[i]
            alpha_mask = alpha_masks[i]
            original_size = original_sizes[i]
            crop_ltrb = crop_ltrbs[i]

            latents_size = latents.shape[-2:]  # H, W (supports both 4D and 5D latents)
            key_reso_suffix = f"_{latents_size[0]}x{latents_size[1]}" if multi_resolution else ""  # e.g. "_32x64", HxW

            if self.cache_to_disk:
                self._queue_latents_npz_write(
                    info.latents_npz,
                    self._latents_to_numpy_array(latents),
                    original_size,
                    crop_ltrb,
                    self._latents_to_numpy_array(flipped_latent) if flipped_latent is not None else None,
                    self._optional_mask_to_numpy(alpha_mask),
                    key_reso_suffix,
                )
            else:
                info.latents_original_size = original_size
                info.latents_crop_ltrb = crop_ltrb
                info.latents = latents
                if flip_aug:
                    info.latents_flipped = flipped_latent
                info.alpha_mask = alpha_mask

    def load_latents_from_disk(
        self, cache_ref_or_path: Union[str, LatentsDiskCacheRef], bucket_reso: Tuple[int, int]
    ) -> Tuple[
        Optional[Union[np.ndarray, torch.Tensor]],
        Optional[List[int]],
        Optional[List[int]],
        Optional[Union[np.ndarray, torch.Tensor]],
        Optional[Union[np.ndarray, torch.Tensor]],
    ]:
        """
        for SD/SDXL

        Args:
            cache_ref_or_path (str | LatentsDiskCacheRef): Path or disk-cache reference.
            bucket_reso (Tuple[int, int]): The resolution of the bucket.
        
        Returns:
            Tuple[
                Optional[np.ndarray], 
                Optional[List[int]], 
                Optional[List[int]], 
                Optional[np.ndarray], 
                Optional[np.ndarray]
            ]: Latent np tensors, original size, crop (left top, right bottom), flipped latents, alpha mask
        """
        if isinstance(cache_ref_or_path, LatentsDiskCacheRef) and cache_ref_or_path.format == "safetensors":
            return self._load_safetensors_latents_from_disk(cache_ref_or_path)
        return self._default_load_latents_from_disk(None, str(cache_ref_or_path), bucket_reso)

    def _load_safetensors_latents_from_disk(
        self, cache_ref: LatentsDiskCacheRef
    ) -> Tuple[torch.Tensor, List[int], List[int], Optional[torch.Tensor], Optional[torch.Tensor]]:
        entry_key = str(cache_ref.entry_key or "")
        if not entry_key:
            raise ValueError(f"safetensors latent cache entry key is missing for {cache_ref.path}")

        with safe_open_torch_cpu(cache_ref.path) as handle:
            latents = handle.get_tensor(f"latents::{entry_key}")
            original_size = handle.get_tensor(f"original_size::{entry_key}").tolist()
            crop_ltrb = handle.get_tensor(f"crop_ltrb::{entry_key}").tolist()
            flipped_latents = (
                handle.get_tensor(f"latents_flipped::{entry_key}")
                if f"latents_flipped::{entry_key}" in handle.keys()
                else None
            )
            alpha_mask = handle.get_tensor(f"alpha_mask::{entry_key}") if f"alpha_mask::{entry_key}" in handle.keys() else None

        return latents, original_size, crop_ltrb, flipped_latents, alpha_mask

    def _default_load_latents_from_disk(
        self, latents_stride: Optional[int], npz_path: str, bucket_reso: Tuple[int, int]
    ) -> Tuple[Optional[np.ndarray], Optional[List[int]], Optional[List[int]], Optional[np.ndarray], Optional[np.ndarray]]:
        """
        Args:
            latents_stride (Optional[int]): Stride for latents. If None, load all latents.
            npz_path (str): Path to the npz file.
            bucket_reso (Tuple[int, int]): The resolution of the bucket.
       
        Returns:
            Tuple[
                Optional[np.ndarray], 
                Optional[List[int]], 
                Optional[List[int]], 
                Optional[np.ndarray], 
                Optional[np.ndarray]
            ]: Latent np tensors, original size, crop (left top, right bottom), flipped latents, alpha mask
        """
        if latents_stride is None:
            key_reso_suffix = ""
        else:
            latents_size = (bucket_reso[1] // latents_stride, bucket_reso[0] // latents_stride)  # bucket_reso is (W, H)
            key_reso_suffix = f"_{latents_size[0]}x{latents_size[1]}"  # e.g. "_32x64", HxW

        npz = self._load_npz_archive(npz_path)
        if "latents" + key_reso_suffix not in npz:
            raise ValueError(f"latents{key_reso_suffix} not found in {npz_path}")

        latents = npz["latents" + key_reso_suffix]
        original_size = npz["original_size" + key_reso_suffix].tolist()
        crop_ltrb = npz["crop_ltrb" + key_reso_suffix].tolist()
        flipped_latents = npz["latents_flipped" + key_reso_suffix] if "latents_flipped" + key_reso_suffix in npz else None
        alpha_mask = npz["alpha_mask" + key_reso_suffix] if "alpha_mask" + key_reso_suffix in npz else None
        return latents, original_size, crop_ltrb, flipped_latents, alpha_mask

    def save_latents_to_disk(
        self,
        npz_path,
        latents_tensor,
        original_size,
        crop_ltrb,
        flipped_latents_tensor=None,
        alpha_mask=None,
        key_reso_suffix="",
    ):
        """
        Args:
            npz_path (str): Path to the npz file.
            latents_tensor (torch.Tensor): Latent tensor
            original_size (List[int]): Original size of the image
            crop_ltrb (List[int]): Crop left top right bottom
            flipped_latents_tensor (Optional[torch.Tensor]): Flipped latent tensor
            alpha_mask (Optional[torch.Tensor]): Alpha mask
            key_reso_suffix (str): Key resolution suffix

        Returns:
            None
        """
        self._write_latents_npz(
            npz_path,
            self._latents_to_numpy_array(latents_tensor),
            original_size,
            crop_ltrb,
            self._latents_to_numpy_array(flipped_latents_tensor) if flipped_latents_tensor is not None else None,
            self._optional_mask_to_numpy(alpha_mask),
            key_reso_suffix,
        )
