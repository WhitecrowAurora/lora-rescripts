import base64
import io
import json
import re
import urllib.error
import urllib.request
from glob import glob
from pathlib import Path
from typing import Any, Iterable, Mapping

from PIL import Image

from mikazuki.log import log

LLM_INTERROGATORS = {
    "llm-openai": {
        "name": "llm-openai",
        "kind": "llm",
        "provider": "openai",
        "api_style": "openai-compatible",
        "default_api_base": "https://api.openai.com/v1",
        "label": "LLM (OpenAI compatible)",
    },
    "llm-claude": {
        "name": "llm-claude",
        "kind": "llm",
        "provider": "claude",
        "api_style": "claude-compatible",
        "default_api_base": "https://api.anthropic.com/v1",
        "label": "LLM (Claude compatible)",
    },
    "llm-custom": {
        "name": "llm-custom",
        "kind": "llm",
        "provider": "custom",
        "api_style": "openai-compatible",
        "default_api_base": "",
        "label": "LLM (Custom API)",
    },
}

LLM_TEMPLATE_PRESETS = {
    "anime-tags": {
        "id": "anime-tags",
        "label": "动漫标签 / Anime Tags",
        "output_mode": "tags",
        "system_prompt": (
            "You are an image tagging assistant for anime and illustration training datasets. "
            "Return concise, visually grounded captions that are useful for model training. "
            "Follow the user's requested format exactly. Do not add explanations unless the user template explicitly asks for them."
        ),
        "user_template": (
            "Analyze this image and return a concise comma-separated tag list only.\n"
            "Requirements:\n"
            "- Use short booru-style tags\n"
            "- Focus on subject, appearance, clothing, pose, composition, background, lighting, quality, and style\n"
            "- Include only visually supported details\n"
            "- No full sentences, no numbering, no markdown, no extra commentary\n"
            "- Do not invent artist / series names unless clearly visible in the image itself\n\n"
            "File: {relative_path}\n"
            "Existing caption (may be empty, use only as weak reference): {existing_caption}\n"
        ),
    },
    "natural-caption": {
        "id": "natural-caption",
        "label": "自然语言描述 / Natural Caption",
        "output_mode": "raw_text",
        "system_prompt": (
            "You are an image captioning assistant for anime and illustration datasets. "
            "Write compact, natural descriptions that stay faithful to the visible image content."
        ),
        "user_template": (
            "Describe this image in 1 to 3 concise natural-language sentences for training caption use.\n"
            "Requirements:\n"
            "- Mention the main subject, appearance, clothing, pose, framing, background, mood, and lighting when visible\n"
            "- Keep it visually grounded and avoid guessing hidden facts\n"
            "- Do not use markdown or bullet points\n"
            "- Do not mention camera metadata unless it is visually obvious\n\n"
            "File: {relative_path}\n"
            "Existing caption (may be empty, use only as weak reference): {existing_caption}\n"
        ),
    },
    "json-caption": {
        "id": "json-caption",
        "label": "JSON 打标 / JSON Caption",
        "output_mode": "raw_text",
        "system_prompt": (
            "You are an image annotation assistant for anime and illustration datasets. "
            "Return compact, valid JSON only."
        ),
        "user_template": (
            "Analyze this image and return valid JSON only.\n"
            "Use this schema exactly:\n"
            "{\n"
            '  "quality": string,\n'
            '  "count": string,\n'
            '  "character": [string],\n'
            '  "series": [string],\n'
            '  "artist": [string],\n'
            '  "appearance": [string],\n'
            '  "tags": [string],\n'
            '  "environment": [string],\n'
            '  "nl": string\n'
            "}\n"
            "Rules:\n"
            "- Return JSON only, no markdown, no explanation\n"
            "- Use empty arrays when unknown\n"
            "- Keep all fields visually grounded\n"
            "- `nl` should be a concise natural sentence summary\n\n"
            "File: {relative_path}\n"
            "Existing caption (may be empty, use only as weak reference): {existing_caption}\n"
        ),
    },
}

DEFAULT_LLM_SYSTEM_PROMPT = LLM_TEMPLATE_PRESETS["anime-tags"]["system_prompt"]
DEFAULT_LLM_USER_TEMPLATE = LLM_TEMPLATE_PRESETS["anime-tags"]["user_template"]

_PLACEHOLDER_PATTERN = re.compile(r"\{([a-zA-Z0-9_]+)\}")
_CODE_FENCE_PATTERN = re.compile(r"^```[a-zA-Z0-9_-]*\s*|\s*```$", re.DOTALL)
_TAG_PREFIX_PATTERN = re.compile(r"^(tags?|caption|output)\s*:\s*", re.IGNORECASE)
_SUPPORTED_IMAGE_EXTENSIONS = None
_RESAMPLING = Image.Resampling.LANCZOS if hasattr(Image, "Resampling") else Image.LANCZOS


def is_llm_interrogator(name: str) -> bool:
    return name in LLM_INTERROGATORS


def get_llm_interrogator_meta(name: str) -> dict[str, Any]:
    return dict(LLM_INTERROGATORS.get(name, {}))


def get_llm_template_preset(preset_id: str) -> dict[str, Any]:
    preset_key = str(preset_id or "").strip() or "anime-tags"
    preset = LLM_TEMPLATE_PRESETS.get(preset_key)
    if preset is None:
        preset = LLM_TEMPLATE_PRESETS["anime-tags"]
    return dict(preset)


def resolve_llm_template_bundle(config: Mapping[str, Any]) -> dict[str, str]:
    preset = get_llm_template_preset(str(config.get("llm_template_preset", "anime-tags") or "anime-tags"))
    system_prompt = str(config.get("llm_system_prompt", "") or "").strip() or str(preset["system_prompt"])
    user_template = str(config.get("llm_user_template", "") or "").strip() or str(preset["user_template"])
    output_mode = str(config.get("llm_output_mode", "auto") or "auto").strip()
    if output_mode == "auto":
        output_mode = str(preset.get("output_mode", "tags"))
    if output_mode not in {"tags", "raw_text"}:
        output_mode = "tags"
    return {
        "preset_id": str(preset["id"]),
        "system_prompt": system_prompt,
        "user_template": user_template,
        "output_mode": output_mode,
    }


def _split_csv(value: str) -> list[str]:
    return [item.strip() for item in str(value or "").split(",") if item.strip()]


def _supported_image_extensions() -> set[str]:
    global _SUPPORTED_IMAGE_EXTENSIONS
    if _SUPPORTED_IMAGE_EXTENSIONS is None:
        _SUPPORTED_IMAGE_EXTENSIONS = {
            ext.lower()
            for ext, fmt in Image.registered_extensions().items()
            if fmt in Image.OPEN
        }
    return _SUPPORTED_IMAGE_EXTENSIONS


def _collect_image_paths(batch_dir: Path, recursive: bool) -> list[Path]:
    pattern = str(batch_dir / "**" / "*") if recursive else str(batch_dir / "*")
    return [
        Path(path)
        for path in glob(pattern, recursive=recursive)
        if Path(path).suffix.lower() in _supported_image_extensions()
    ]


def _encode_image_for_llm(image_path: Path, max_side: int = 1536) -> tuple[str, str]:
    with Image.open(image_path) as image:
        image.load()
        has_alpha = image.mode in ("RGBA", "LA") or (
            image.mode == "P" and "transparency" in image.info
        )

        width, height = image.size
        if max(width, height) > max_side:
            image.thumbnail((max_side, max_side), _RESAMPLING)

        output = io.BytesIO()
        if has_alpha:
            image.save(output, format="PNG", optimize=True)
            media_type = "image/png"
        else:
            if image.mode not in ("RGB", "L"):
                image = image.convert("RGB")
            image.save(output, format="JPEG", quality=95, optimize=True)
            media_type = "image/jpeg"

        payload = base64.b64encode(output.getvalue()).decode("ascii")
        return payload, media_type


def _render_template(template: str, context: Mapping[str, str]) -> str:
    def replace(match: re.Match[str]) -> str:
        key = match.group(1)
        return str(context.get(key, match.group(0)))

    return _PLACEHOLDER_PATTERN.sub(replace, template)


def _strip_code_fences(text: str) -> str:
    stripped = str(text or "").strip()
    if stripped.startswith("```") and stripped.endswith("```"):
        stripped = _CODE_FENCE_PATTERN.sub("", stripped).strip()
    return stripped


def _extract_text_from_openai_response(payload: Mapping[str, Any]) -> str:
    choices = payload.get("choices") or []
    if not choices:
        return ""

    message = (choices[0] or {}).get("message") or {}
    content = message.get("content", "")
    if isinstance(content, str):
        return content.strip()
    if isinstance(content, list):
        parts: list[str] = []
        for item in content:
            if not isinstance(item, Mapping):
                continue
            if item.get("type") in {"text", "output_text"} and item.get("text"):
                parts.append(str(item["text"]).strip())
        return "\n".join(part for part in parts if part)
    return str(content).strip()


def _extract_text_from_claude_response(payload: Mapping[str, Any]) -> str:
    content = payload.get("content") or []
    if isinstance(content, str):
        return content.strip()

    parts: list[str] = []
    for item in content:
        if not isinstance(item, Mapping):
            continue
        if item.get("type") == "text" and item.get("text"):
            parts.append(str(item["text"]).strip())
    return "\n".join(part for part in parts if part)


def _extract_error_message(payload: Any) -> str:
    if isinstance(payload, Mapping):
        error = payload.get("error")
        if isinstance(error, Mapping):
            message = error.get("message")
            if message:
                return str(message)
        message = payload.get("message")
        if message:
            return str(message)
    return str(payload or "").strip()


def _post_json(url: str, headers: Mapping[str, str], payload: Mapping[str, Any], timeout: int) -> dict[str, Any]:
    body = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(url, data=body, headers=dict(headers), method="POST")
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            data = response.read().decode("utf-8", errors="ignore")
            if not data:
                return {}
            return json.loads(data)
    except urllib.error.HTTPError as exc:
        raw_body = exc.read().decode("utf-8", errors="ignore")
        try:
            payload = json.loads(raw_body) if raw_body else {}
        except json.JSONDecodeError:
            payload = raw_body
        message = _extract_error_message(payload) or f"HTTP {exc.code}"
        raise RuntimeError(message) from exc
    except urllib.error.URLError as exc:
        raise RuntimeError(f"Failed to connect to {url}: {exc.reason}") from exc


def _resolve_endpoint(base_url: str, suffix: str) -> str:
    normalized_base = str(base_url or "").strip().rstrip("/")
    normalized_suffix = suffix.lstrip("/")
    if not normalized_base:
        return normalized_suffix
    if normalized_base.endswith(normalized_suffix):
        return normalized_base
    return f"{normalized_base}/{normalized_suffix}"


def _call_openai_compatible(
    *,
    api_base: str,
    api_key: str,
    model: str,
    system_prompt: str,
    user_prompt: str,
    image_base64: str,
    media_type: str,
    temperature: float,
    max_tokens: int,
    timeout: int,
) -> str:
    payload = {
        "model": model,
        "messages": [
            {
                "role": "system",
                "content": system_prompt,
            },
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": user_prompt},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{media_type};base64,{image_base64}",
                        },
                    },
                ],
            },
        ],
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    response = _post_json(
        _resolve_endpoint(api_base, "chat/completions"),
        {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        payload,
        timeout,
    )
    return _extract_text_from_openai_response(response)


def _call_claude_compatible(
    *,
    api_base: str,
    api_key: str,
    model: str,
    system_prompt: str,
    user_prompt: str,
    image_base64: str,
    media_type: str,
    temperature: float,
    max_tokens: int,
    timeout: int,
) -> str:
    payload = {
        "model": model,
        "max_tokens": max_tokens,
        "temperature": temperature,
        "system": system_prompt,
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": user_prompt},
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": media_type,
                            "data": image_base64,
                        },
                    },
                ],
            }
        ],
    }
    response = _post_json(
        _resolve_endpoint(api_base, "messages"),
        {
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
        payload,
        timeout,
    )
    return _extract_text_from_claude_response(response)


def _sanitize_llm_raw_text(text: str) -> str:
    normalized = _strip_code_fences(text)
    normalized = _TAG_PREFIX_PATTERN.sub("", normalized).strip()
    if not normalized:
        return ""
    return normalized


def _normalize_llm_text(text: str) -> str:
    normalized = _sanitize_llm_raw_text(text)
    if not normalized:
        return ""

    if normalized.startswith("[") or normalized.startswith("{"):
        try:
            payload = json.loads(normalized)
        except json.JSONDecodeError:
            return normalized

        if isinstance(payload, list):
            return ", ".join(str(item).strip() for item in payload if str(item).strip())

        if isinstance(payload, Mapping):
            tags = payload.get("tags")
            if isinstance(tags, list):
                return ", ".join(str(item).strip() for item in tags if str(item).strip())
            caption = payload.get("caption")
            if caption:
                return str(caption).strip()

    return normalized


def _parse_text_as_tag_list(text: str) -> list[str]:
    normalized = _normalize_llm_text(text).replace("\r", "\n")
    parts = re.split(r"[,，;\n]+", normalized)
    tags: list[str] = []
    for part in parts:
        tag = part.strip().strip('"').strip("'")
        tag = re.sub(r"^[\-\*\u2022\d\.\)\s]+", "", tag).strip()
        if tag:
            tags.append(tag)
    return tags


def _unique_preserve_order(items: Iterable[str]) -> list[str]:
    result: list[str] = []
    seen: set[str] = set()
    for item in items:
        normalized = item.strip()
        if not normalized or normalized in seen:
            continue
        seen.add(normalized)
        result.append(normalized)
    return result


def _dedupe_join_tag_text(*chunks: str) -> str:
    tokens: list[str] = []
    for chunk in chunks:
        if chunk:
            tokens.extend(_parse_text_as_tag_list(chunk))
    return ", ".join(_unique_preserve_order(tokens))


def _format_generated_tag_text(config: Mapping[str, Any], response_text: str) -> str:
    generated_tags = _parse_text_as_tag_list(response_text)
    additional_tags = _split_csv(config.get("additional_tags", ""))
    exclude_tags = set(_split_csv(config.get("exclude_tags", "")))
    replace_underscore = bool(config.get("replace_underscore", True))
    escape_tag = bool(config.get("escape_tag", True))
    replace_underscore_excludes = set(_split_csv(config.get("replace_underscore_excludes", "")))

    formatted: list[str] = []
    for tag in list(generated_tags) + additional_tags:
        if not tag or tag in exclude_tags:
            continue
        final_tag = tag
        if replace_underscore and final_tag not in replace_underscore_excludes:
            final_tag = final_tag.replace("_", " ")
        if escape_tag:
            final_tag = re.sub(r"([\\()])", r"\\\1", final_tag)
        formatted.append(final_tag.strip())

    return ", ".join(_unique_preserve_order(formatted))


def _merge_output_text(config: Mapping[str, Any], existing_text: str, generated_response_text: str) -> str:
    conflict_mode = str(config.get("batch_output_action_on_conflict", "ignore") or "ignore")
    output_mode = str(config.get("resolved_llm_output_mode", config.get("llm_output_mode", "tags")) or "tags")

    if output_mode == "raw_text":
        generated_text = _sanitize_llm_raw_text(generated_response_text).strip()
        if conflict_mode == "prepend" and existing_text:
            return f"{generated_text}\n{existing_text}".strip()
        if conflict_mode == "append" and existing_text:
            return f"{existing_text}\n{generated_text}".strip()
        return generated_text

    generated_text = _format_generated_tag_text(config, generated_response_text)
    if conflict_mode == "prepend" and existing_text:
        return _dedupe_join_tag_text(generated_text, existing_text)
    if conflict_mode == "append" and existing_text:
        return _dedupe_join_tag_text(existing_text, generated_text)
    return generated_text


def run_llm_interrogate(config: Mapping[str, Any]) -> dict[str, int]:
    interrogator_name = str(config.get("interrogator_model", "") or "")
    meta = get_llm_interrogator_meta(interrogator_name)
    if not meta:
        raise ValueError(f"Unsupported LLM interrogator: {interrogator_name}")

    batch_dir = Path(str(config.get("path", "") or "").strip())
    if not batch_dir.is_dir():
        raise ValueError(f"Input path is not a valid folder: {batch_dir}")

    api_key = str(config.get("llm_api_key", "") or "").strip()
    model = str(config.get("llm_model", "") or "").strip()
    if not api_key:
        raise ValueError("LLM API key is empty / LLM API Key 不能为空。")
    if not model:
        raise ValueError("LLM model is empty / LLM 模型名称不能为空。")

    api_style = str(config.get("llm_api_style", "") or meta.get("api_style", "openai-compatible")).strip()
    api_base = str(config.get("llm_api_base", "") or "").strip() or str(meta["default_api_base"])
    template_bundle = resolve_llm_template_bundle(config)
    system_prompt = template_bundle["system_prompt"]
    user_template = template_bundle["user_template"]
    temperature = float(config.get("llm_temperature", 0.2) or 0.2)
    max_tokens = int(config.get("llm_max_tokens", 300) or 300)
    timeout = int(config.get("llm_timeout", 120) or 120)
    recursive = bool(config.get("batch_input_recursive", False))
    conflict_mode = str(config.get("batch_output_action_on_conflict", "ignore") or "ignore")
    provider = str(meta["provider"])
    if provider == "custom":
        if not api_base:
            raise ValueError("Custom API Base URL is empty / 自定义 API 地址不能为空。")
        provider = "claude" if api_style == "claude-compatible" else "openai"

    paths = _collect_image_paths(batch_dir, recursive)
    if not paths:
        log.warning(f"[LLM Tagger] no images found under {batch_dir}")
        return {"processed": 0, "skipped": 0, "failed": 0}

    processed = 0
    skipped = 0
    failed = 0

    log.info(
        f"[LLM Tagger] start provider={provider} api_style={api_style} model={model} "
        f"preset={template_bundle['preset_id']} output_mode={template_bundle['output_mode']} "
        f"images={len(paths)} recursive={recursive} conflict={conflict_mode}"
    )

    for index, image_path in enumerate(paths, start=1):
        output_path = image_path.with_suffix(".txt")
        existing_text = ""
        if output_path.is_file():
            existing_text = output_path.read_text(encoding="utf-8", errors="ignore").strip()
            if conflict_mode == "ignore":
                skipped += 1
                log.info(f"[LLM Tagger] skipping existing caption {output_path}")
                continue

        prompt_context = {
            "filename": image_path.name,
            "stem": image_path.stem,
            "relative_path": image_path.relative_to(batch_dir).as_posix(),
            "absolute_path": str(image_path),
            "existing_caption": existing_text,
        }

        try:
            image_base64, media_type = _encode_image_for_llm(image_path)
            user_prompt = _render_template(user_template, prompt_context)
            runtime_config = dict(config)
            runtime_config["resolved_llm_output_mode"] = template_bundle["output_mode"]
            if provider == "openai":
                generated_response_text = _call_openai_compatible(
                    api_base=api_base,
                    api_key=api_key,
                    model=model,
                    system_prompt=system_prompt,
                    user_prompt=user_prompt,
                    image_base64=image_base64,
                    media_type=media_type,
                    temperature=temperature,
                    max_tokens=max_tokens,
                    timeout=timeout,
                )
            else:
                generated_response_text = _call_claude_compatible(
                    api_base=api_base,
                    api_key=api_key,
                    model=model,
                    system_prompt=system_prompt,
                    user_prompt=user_prompt,
                    image_base64=image_base64,
                    media_type=media_type,
                    temperature=temperature,
                    max_tokens=max_tokens,
                    timeout=timeout,
                )

            final_text = _merge_output_text(runtime_config, existing_text, generated_response_text).strip()
            output_path.write_text(final_text, encoding="utf-8")
            processed += 1
            log.info(f"[LLM Tagger] [{index}/{len(paths)}] wrote {output_path}")
        except Exception as exc:
            failed += 1
            log.exception(f"[LLM Tagger] failed for {image_path}: {exc}")

    log.info(
        f"[LLM Tagger] finished provider={provider} api_style={api_style} "
        f"preset={template_bundle['preset_id']} output_mode={template_bundle['output_mode']} "
        f"processed={processed} skipped={skipped} failed={failed}"
    )
    return {"processed": processed, "skipped": skipped, "failed": failed}
