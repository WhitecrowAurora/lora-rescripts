from pathlib import Path

from PIL import Image
import torch
import numpy as np
import math

from transformers import CLIPModel, CLIPProcessor

from scripts import model_loader, devices, settings
from scripts import logger
from scripts.paths import paths
from scripts.tagger import Tagger

# brought from https://github.com/waifu-diffusion/aesthetic/blob/main/aesthetic.py
class Classifier(torch.nn.Module):
    def __init__(self, input_size, hidden_size, output_size):
        super(Classifier, self).__init__()
        self.fc1 = torch.nn.Linear(input_size, hidden_size)
        self.fc2 = torch.nn.Linear(hidden_size, hidden_size//2)
        self.fc3 = torch.nn.Linear(hidden_size//2, output_size)
        self.relu = torch.nn.ReLU()
        self.sigmoid = torch.nn.Sigmoid()

    def forward(self, x:torch.Tensor):
        x = self.fc1(x)
        x = self.relu(x)
        x = self.fc2(x)
        x = self.relu(x)
        x = self.fc3(x)
        x = self.sigmoid(x)
        return x

# brought and modified from https://github.com/waifu-diffusion/aesthetic/blob/main/aesthetic.py
def image_embeddings(image:Image, model:CLIPModel, processor:CLIPProcessor):
    inputs = processor(images=image, return_tensors='pt')['pixel_values']
    inputs = inputs.to(devices.device)
    result:np.ndarray = model.get_image_features(pixel_values=inputs).cpu().detach().numpy()
    return (result / np.linalg.norm(result)).squeeze(axis=0)


HF_CACHE_ROOT = paths.base_path / "huggingface"


def _resolve_local_snapshot_dir(model_repo: str) -> Path | None:
    repo_dir = HF_CACHE_ROOT / "hub" / f"models--{model_repo.replace('/', '--')}"
    refs_main = repo_dir / "refs" / "main"
    if refs_main.is_file():
        snapshot_name = refs_main.read_text(encoding="utf-8").strip()
        if snapshot_name:
            snapshot_dir = repo_dir / "snapshots" / snapshot_name
            if snapshot_dir.is_dir():
                return snapshot_dir

    snapshots_dir = repo_dir / "snapshots"
    if not snapshots_dir.is_dir():
        return None

    snapshot_dirs = sorted(
        (path for path in snapshots_dir.iterdir() if path.is_dir()),
        key=lambda path: path.name,
        reverse=True,
    )
    return snapshot_dirs[0] if snapshot_dirs else None


def _load_local_clip_bundle(model_repo: str) -> tuple[CLIPProcessor | None, CLIPModel | None]:
    local_snapshot_dir = _resolve_local_snapshot_dir(model_repo)
    local_source = str(local_snapshot_dir) if local_snapshot_dir is not None else model_repo
    try:
        processor = CLIPProcessor.from_pretrained(
            local_source,
            cache_dir=str(HF_CACHE_ROOT),
            local_files_only=True,
        )
        model = CLIPModel.from_pretrained(
            local_source,
            cache_dir=str(HF_CACHE_ROOT),
            local_files_only=True,
        )
        return processor, model
    except Exception as exc:
        logger.warn(
            f"wd aesthetic classifier disabled: local CLIP cache for {model_repo} is unavailable. "
            f"Please cache it first if you want to use this tagger. Details: {exc}"
        )
        return None, None


class WaifuAesthetic(Tagger):
    def __init__(self):
        self.model = None
        self.clip_processor = None
        self.clip_model = None
        self._load_failed = False

    def load(self):
        if self._load_failed:
            return
        if self.model is not None and self.clip_processor is not None and self.clip_model is not None:
            return

        CLIP_REPOS = 'openai/clip-vit-base-patch32'
        try:
            file = model_loader.load(
                model_path=paths.models_path / "aesthetic" / "aes-B32-v0.pth",
                model_url='https://huggingface.co/hakurei/waifu-diffusion-v1-4/resolve/main/models/aes-B32-v0.pth'
            )
            model = Classifier(512, 256, 1)
            model.load_state_dict(torch.load(file, map_location="cpu"))
            clip_processor, clip_model = _load_local_clip_bundle(CLIP_REPOS)
            if clip_processor is None or clip_model is None:
                self._load_failed = True
                self.model = None
                self.clip_processor = None
                self.clip_model = None
                return

            self.model = model.to(devices.device).eval()
            self.clip_processor = clip_processor
            self.clip_model = clip_model.to(devices.device).eval()
        except Exception as exc:
            self._load_failed = True
            self.model = None
            self.clip_processor = None
            self.clip_model = None
            logger.warn(f"wd aesthetic classifier disabled: {exc}")
    
    def unload(self):
        if not settings.current.interrogator_keep_in_memory:
            self.model = None
            self.clip_processor = None
            self.clip_model = None
            devices.torch_gc()

    def start(self):
        self.load()
        return self

    def stop(self):
        self.unload()

    def predict(self, image: Image.Image, threshold=None):
        if self.model is None or self.clip_model is None or self.clip_processor is None:
            return []
        image_embeds = image_embeddings(image, self.clip_model, self.clip_processor)
        prediction:torch.Tensor = self.model(torch.from_numpy(image_embeds).float().to(devices.device))
        # edit here to change tag
        return [f"[WD]score_{math.floor(prediction.item()*10)}"]

    def name(self):
        return "wd aesthetic classifier"
