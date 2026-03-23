from __future__ import annotations

import re
from collections import Counter
from pathlib import Path
from typing import Iterable

from mikazuki.utils.dataset_analysis import normalize_caption_extension, read_text_file

WHITESPACE_PATTERN = re.compile(r"\s+")


def preview_caption_cleanup(
    path: str,
    caption_extension: str = ".txt",
    recursive: bool = True,
    collapse_whitespace: bool = True,
    replace_underscore: bool = False,
    dedupe_tags: bool = True,
    sort_tags: bool = False,
    remove_tags: str = "",
    prepend_tags: str = "",
    append_tags: str = "",
    search_text: str = "",
    replace_text: str = "",
    use_regex: bool = False,
    sample_limit: int = 8,
) -> dict:
    return run_caption_cleanup(
        path=path,
        caption_extension=caption_extension,
        recursive=recursive,
        collapse_whitespace=collapse_whitespace,
        replace_underscore=replace_underscore,
        dedupe_tags=dedupe_tags,
        sort_tags=sort_tags,
        remove_tags=remove_tags,
        prepend_tags=prepend_tags,
        append_tags=append_tags,
        search_text=search_text,
        replace_text=replace_text,
        use_regex=use_regex,
        sample_limit=sample_limit,
        apply_changes=False,
    )


def apply_caption_cleanup(
    path: str,
    caption_extension: str = ".txt",
    recursive: bool = True,
    collapse_whitespace: bool = True,
    replace_underscore: bool = False,
    dedupe_tags: bool = True,
    sort_tags: bool = False,
    remove_tags: str = "",
    prepend_tags: str = "",
    append_tags: str = "",
    search_text: str = "",
    replace_text: str = "",
    use_regex: bool = False,
    sample_limit: int = 8,
) -> dict:
    return run_caption_cleanup(
        path=path,
        caption_extension=caption_extension,
        recursive=recursive,
        collapse_whitespace=collapse_whitespace,
        replace_underscore=replace_underscore,
        dedupe_tags=dedupe_tags,
        sort_tags=sort_tags,
        remove_tags=remove_tags,
        prepend_tags=prepend_tags,
        append_tags=append_tags,
        search_text=search_text,
        replace_text=replace_text,
        use_regex=use_regex,
        sample_limit=sample_limit,
        apply_changes=True,
    )


def run_caption_cleanup(
    path: str,
    caption_extension: str,
    recursive: bool,
    collapse_whitespace: bool,
    replace_underscore: bool,
    dedupe_tags: bool,
    sort_tags: bool,
    remove_tags: str,
    prepend_tags: str,
    append_tags: str,
    search_text: str,
    replace_text: str,
    use_regex: bool,
    sample_limit: int,
    apply_changes: bool,
) -> dict:
    root = Path(path).expanduser()
    if not root.exists():
        raise ValueError("Caption folder does not exist / Caption 文件夹不存在。")
    if not root.is_dir():
        raise ValueError("Caption path must be a folder / Caption 路径必须是文件夹。")

    normalized_caption_extension = normalize_caption_extension(caption_extension)
    caption_files = list(iter_caption_files(root, normalized_caption_extension, recursive))
    if not caption_files:
        raise ValueError("No caption files were found for the selected extension / 没有找到对应扩展名的 caption 文件。")

    try:
        replacement_pattern = re.compile(search_text) if use_regex and search_text else None
    except re.error as exc:
        raise ValueError(f"Invalid regex pattern / 正则表达式无效: {exc}") from exc

    normalized_remove_tags = set(
        cleanup_inline_tags(
            parse_caption_text(remove_tags),
            collapse_whitespace=collapse_whitespace,
            replace_underscore=replace_underscore,
        )
    )
    normalized_prepend_tags = cleanup_inline_tags(
        parse_caption_text(prepend_tags),
        collapse_whitespace=collapse_whitespace,
        replace_underscore=replace_underscore,
    )
    normalized_append_tags = cleanup_inline_tags(
        parse_caption_text(append_tags),
        collapse_whitespace=collapse_whitespace,
        replace_underscore=replace_underscore,
    )

    summary = {
        "file_count": len(caption_files),
        "changed_file_count": 0,
        "unchanged_file_count": 0,
        "empty_result_count": 0,
        "total_tags_before": 0,
        "total_tags_after": 0,
        "removed_tag_instances": 0,
        "added_tag_instances": 0,
    }
    samples: list[dict] = []

    for caption_path in caption_files:
        original_text = read_text_file(caption_path)
        before_tags = parse_caption_text(original_text)
        after_tags = transform_tags(
            before_tags,
            collapse_whitespace=collapse_whitespace,
            replace_underscore=replace_underscore,
            dedupe_tags=dedupe_tags,
            sort_tags=sort_tags,
            remove_tags=normalized_remove_tags,
            prepend_tags=normalized_prepend_tags,
            append_tags=normalized_append_tags,
            search_text=search_text,
            replace_text=replace_text,
            replacement_pattern=replacement_pattern,
            use_regex=use_regex,
        )

        before_display = original_text.strip()
        after_serialized = serialize_tags(after_tags, collapse_whitespace=collapse_whitespace)
        changed = after_serialized != normalize_text_for_compare(original_text)

        summary["total_tags_before"] += len(before_tags)
        summary["total_tags_after"] += len(after_tags)
        if not after_tags:
            summary["empty_result_count"] += 1

        before_counter = Counter(before_tags)
        after_counter = Counter(after_tags)
        summary["removed_tag_instances"] += sum((before_counter - after_counter).values())
        summary["added_tag_instances"] += sum((after_counter - before_counter).values())

        if changed:
            summary["changed_file_count"] += 1
            if apply_changes:
                caption_path.write_text(after_serialized, encoding="utf-8")
            if len(samples) < sample_limit:
                samples.append({
                    "path": str(caption_path.resolve()),
                    "before": before_display,
                    "after": after_serialized,
                    "before_count": len(before_tags),
                    "after_count": len(after_tags),
                    "removed_tags": list((before_counter - after_counter).elements())[:12],
                    "added_tags": list((after_counter - before_counter).elements())[:12],
                })
        else:
            summary["unchanged_file_count"] += 1

    warnings = build_cleanup_warnings(summary, apply_changes)

    return {
        "mode": "apply" if apply_changes else "preview",
        "root_path": str(root.resolve()),
        "caption_extension": normalized_caption_extension,
        "recursive": recursive,
        "options": {
            "collapse_whitespace": collapse_whitespace,
            "replace_underscore": replace_underscore,
            "dedupe_tags": dedupe_tags,
            "sort_tags": sort_tags,
            "remove_tags": sorted(normalized_remove_tags),
            "prepend_tags": normalized_prepend_tags,
            "append_tags": normalized_append_tags,
            "search_text": search_text,
            "replace_text": replace_text,
            "use_regex": use_regex,
        },
        "summary": summary,
        "samples": samples,
        "warnings": warnings,
    }


def iter_caption_files(base: Path, caption_extension: str, recursive: bool) -> Iterable[Path]:
    iterator = base.rglob("*") if recursive else base.glob("*")
    for path in iterator:
        if path.is_file() and path.suffix.lower() == caption_extension:
            yield path


def parse_caption_text(text: str) -> list[str]:
    if not text:
        return []

    tags = []
    for part in re.split(r"[\r\n,]+", text):
        tag = part.strip()
        if tag:
            tags.append(tag)
    return tags


def cleanup_inline_tags(
    tags: list[str],
    collapse_whitespace: bool,
    replace_underscore: bool,
) -> list[str]:
    cleaned = []
    for tag in tags:
        normalized_tag = normalize_tag(tag, collapse_whitespace=collapse_whitespace, replace_underscore=replace_underscore)
        if normalized_tag:
            cleaned.append(normalized_tag)
    return cleaned


def transform_tags(
    tags: list[str],
    collapse_whitespace: bool,
    replace_underscore: bool,
    dedupe_tags: bool,
    sort_tags: bool,
    remove_tags: set[str],
    prepend_tags: list[str],
    append_tags: list[str],
    search_text: str,
    replace_text: str,
    replacement_pattern: re.Pattern[str] | None,
    use_regex: bool,
) -> list[str]:
    cleaned = []
    for tag in tags:
        transformed = tag
        if search_text:
            if use_regex and replacement_pattern is not None:
                transformed = replacement_pattern.sub(replace_text, transformed)
            else:
                transformed = transformed.replace(search_text, replace_text)

        for split_tag in re.split(r"[\r\n,]+", transformed):
            normalized_tag = normalize_tag(
                split_tag,
                collapse_whitespace=collapse_whitespace,
                replace_underscore=replace_underscore,
            )
            if normalized_tag and normalized_tag not in remove_tags:
                cleaned.append(normalized_tag)

    result = [*prepend_tags, *cleaned, *append_tags]
    if dedupe_tags:
        result = dedupe_preserve_order(result)
    if sort_tags:
        result = sorted(result, key=lambda item: item.lower())
    return result


def normalize_tag(tag: str, collapse_whitespace: bool, replace_underscore: bool) -> str:
    normalized = tag.strip()
    if replace_underscore:
        normalized = normalized.replace("_", " ")
    if collapse_whitespace:
        normalized = WHITESPACE_PATTERN.sub(" ", normalized)
    return normalized.strip()


def dedupe_preserve_order(tags: list[str]) -> list[str]:
    result: list[str] = []
    seen: set[str] = set()
    for tag in tags:
        if tag in seen:
            continue
        seen.add(tag)
        result.append(tag)
    return result


def serialize_tags(tags: list[str], collapse_whitespace: bool) -> str:
    if not tags:
        return ""
    if collapse_whitespace:
        tags = [WHITESPACE_PATTERN.sub(" ", tag).strip() for tag in tags]
    return ", ".join(tag for tag in tags if tag)


def build_cleanup_warnings(summary: dict, apply_changes: bool) -> list[str]:
    warnings: list[str] = []

    if summary["changed_file_count"] == 0:
        warnings.append("No caption files would change with the current rules.")

    if summary["empty_result_count"] > 0:
        warnings.append(
            f"{summary['empty_result_count']} caption files end up empty after cleanup."
        )

    if apply_changes and summary["changed_file_count"] > 0:
        warnings.append(
            f"Applied cleanup to {summary['changed_file_count']} caption files."
        )

    return warnings


def normalize_text_for_compare(text: str) -> str:
    return text.replace("\r\n", "\n").strip()
