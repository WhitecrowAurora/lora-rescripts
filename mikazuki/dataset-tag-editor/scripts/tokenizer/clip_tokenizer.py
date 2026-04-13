import math
from pathlib import Path

from transformers import CLIPTokenizerFast


MODEL_REPO = "openai/clip-vit-large-patch14"
TAG_EDITOR_ROOT = Path(__file__).resolve().parents[2]
HF_CACHE_ROOT = TAG_EDITOR_ROOT / "huggingface"
HF_MODEL_CACHE_ROOT = (
    HF_CACHE_ROOT / "hub" / "models--openai--clip-vit-large-patch14"
)


def _resolve_local_snapshot_dir() -> Path | None:
    refs_main = HF_MODEL_CACHE_ROOT / "refs" / "main"
    if refs_main.is_file():
        snapshot_name = refs_main.read_text(encoding="utf-8").strip()
        if snapshot_name:
            snapshot_dir = HF_MODEL_CACHE_ROOT / "snapshots" / snapshot_name
            if snapshot_dir.is_dir():
                return snapshot_dir

    snapshots_dir = HF_MODEL_CACHE_ROOT / "snapshots"
    if not snapshots_dir.is_dir():
        return None

    snapshot_dirs = sorted(
        (path for path in snapshots_dir.iterdir() if path.is_dir()),
        key=lambda path: path.name,
        reverse=True,
    )
    return snapshot_dirs[0] if snapshot_dirs else None


def _load_tokenizer() -> CLIPTokenizerFast:
    local_snapshot_dir = _resolve_local_snapshot_dir()
    if local_snapshot_dir is not None:
        return CLIPTokenizerFast.from_pretrained(
            str(local_snapshot_dir),
            local_files_only=True,
        )

    try:
        return CLIPTokenizerFast.from_pretrained(
            MODEL_REPO,
            cache_dir=str(HF_CACHE_ROOT),
            local_files_only=True,
        )
    except Exception:
        return CLIPTokenizerFast.from_pretrained(
            MODEL_REPO,
            cache_dir=str(HF_CACHE_ROOT),
        )


tokenizer: CLIPTokenizerFast = _load_tokenizer()


def tokenize(text: str):
    try:
        tokens = tokenizer.tokenize(text)
    except:
        pass
    token_count = len(tokens)
    return tokens, token_count


def get_target_token_count(token_count: int):
    return (
        math.ceil(max(token_count, 1) / tokenizer.max_len_single_sentence)
        * tokenizer.max_len_single_sentence
    )
