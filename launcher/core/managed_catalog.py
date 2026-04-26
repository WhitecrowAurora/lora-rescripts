"""Managed training preset catalog, cache, and local import helpers."""

from __future__ import annotations

import json
import hashlib
import mimetypes
import re
import shutil
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Callable, Dict, Iterable, Optional
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode, urljoin, urlparse
from urllib.request import Request, urlopen


def _now_utc() -> datetime:
    return datetime.now(timezone.utc)


def _now_iso() -> str:
    return _now_utc().isoformat()


def _safe_stem(raw_name: str, fallback: str = "preset") -> str:
    cleaned = re.sub(r"[^\w\-\u4e00-\u9fff]+", "_", str(raw_name or "")).strip("._ ")
    return cleaned[:80] or fallback


def _string_list(values: Any) -> list[str]:
    if isinstance(values, str):
        return [item.strip() for item in values.split(",") if item.strip()]
    if isinstance(values, Iterable) and not isinstance(values, (dict, bytes, bytearray)):
        result: list[str] = []
        for item in values:
            text = str(item or "").strip()
            if text:
                result.append(text)
        return result
    return []


class ManagedCatalogService:
    """Fetch remote training presets and expose a launcher-friendly cache."""

    _CACHE_TTL = timedelta(hours=24)

    def __init__(
        self,
        repo_root: Path,
        config_dir: Path,
        settings_provider: Callable[[], Dict[str, Any]],
    ) -> None:
        self._repo_root = repo_root
        self._settings_provider = settings_provider
        self._state_dir = config_dir / "managed"
        self._cache_file = self._state_dir / "catalog_cache.json"
        self._import_state_file = self._state_dir / "import_state.json"
        self._cover_cache_dir = self._state_dir / "covers"
        self._ui_state_root = repo_root / "assets" / "ui_state"
        self._saved_configs_dir = self._ui_state_root / "saved_configs"
        self._pending_import_file = self._ui_state_root / "managed_import_pending.json"

    def get_catalog(self, force_refresh: bool = False) -> Dict[str, Any]:
        settings = self._settings_provider() or {}
        server_url = self._normalize_server_url(settings.get("managed_server_url"))
        api_key = str(settings.get("managed_api_key") or "").strip()
        cache = self._read_json(self._cache_file, default={})

        if not server_url:
            return self._build_public_catalog(
                cache,
                configured=False,
                using_cache=bool(cache.get("items")),
                stale=bool(cache.get("items")),
                error="托管服务器未配置。",
            )

        if not force_refresh and self._is_cache_fresh(cache, server_url):
            return self._build_public_catalog(
                cache,
                configured=True,
                using_cache=True,
                stale=False,
                error=None,
            )

        try:
            fetched = self._fetch_catalog(server_url, api_key)
            self._write_json(self._cache_file, fetched)
            return self._build_public_catalog(
                fetched,
                configured=True,
                using_cache=False,
                stale=False,
                error=None,
            )
        except RuntimeError as exc:
            if cache.get("items") and cache.get("server_url") == server_url:
                return self._build_public_catalog(
                    cache,
                    configured=True,
                    using_cache=True,
                    stale=True,
                    error=str(exc),
                )
            return self._build_public_catalog(
                {
                    "server_url": server_url,
                    "items": [],
                    "fetched_at": None,
                    "expires_at": None,
                },
                configured=True,
                using_cache=False,
                stale=True,
                error=str(exc),
            )

    def test_connection(self) -> Dict[str, Any]:
        settings = self._settings_provider() or {}
        server_url = self._normalize_server_url(settings.get("managed_server_url"))
        api_key = str(settings.get("managed_api_key") or "").strip()
        if not server_url:
            return {
                "ok": False,
                "server_url": "",
                "message": "请先填写托管服务器地址。",
            }
        if not api_key:
            return {
                "ok": False,
                "server_url": server_url,
                "message": "请先填写 API Key 或访问令牌。",
            }

        try:
            payload = self._request_json(server_url, "/api/auth/verify", api_key)
            user = payload.get("user") if isinstance(payload, dict) else None
            username = ""
            if isinstance(user, dict):
                username = str(user.get("username") or user.get("name") or "").strip()
            return {
                "ok": True,
                "server_url": server_url,
                "message": "连接成功。",
                "username": username,
            }
        except RuntimeError as exc:
            return {
                "ok": False,
                "server_url": server_url,
                "message": str(exc),
            }

    def get_import_state(self) -> Dict[str, Any]:
        state = self._read_json(self._import_state_file, default={})
        return {
            "current_name": state.get("current_name"),
            "backup_name": state.get("backup_name"),
            "snapshot_name": state.get("snapshot_name"),
            "preset_id": state.get("preset_id"),
            "preset_title": state.get("preset_title"),
            "imported_at": state.get("imported_at"),
            "reverted_at": state.get("reverted_at"),
        }

    def import_preset(self, preset_id: str) -> Dict[str, Any]:
        item = self._resolve_preset_for_import(str(preset_id or "").strip())
        if not item:
            raise RuntimeError("未找到要导入的托管参数。")

        payload = self._extract_config_payload(item)
        if not isinstance(payload, dict):
            raise RuntimeError("该托管参数没有可导入的配置内容。")

        self._saved_configs_dir.mkdir(parents=True, exist_ok=True)
        self._state_dir.mkdir(parents=True, exist_ok=True)
        self._ui_state_root.mkdir(parents=True, exist_ok=True)

        current_name = "launcher-managed-current"
        current_path = self._saved_configs_dir / f"{current_name}.json"
        backup_name = None

        if current_path.exists():
            backup_name = f"launcher-managed-rollback-{_now_utc().strftime('%Y%m%d-%H%M%S')}"
            backup_path = self._saved_configs_dir / f"{backup_name}.json"
            shutil.copyfile(current_path, backup_path)

        title = str(item.get("title") or item.get("name") or item.get("preset_id") or "preset")
        snapshot_name = f"launcher-managed-import-{_safe_stem(title)}-{_now_utc().strftime('%Y%m%d-%H%M%S')}"
        snapshot_path = self._saved_configs_dir / f"{snapshot_name}.json"

        serialized = json.dumps(payload, ensure_ascii=False, indent=2)
        current_path.write_text(serialized, encoding="utf-8")
        snapshot_path.write_text(serialized, encoding="utf-8")

        import_state = {
            "current_name": current_name,
            "backup_name": backup_name,
            "snapshot_name": snapshot_name,
            "preset_id": str(item.get("preset_id") or preset_id),
            "preset_title": title,
            "imported_at": _now_iso(),
            "reverted_at": None,
        }
        self._write_json(self._import_state_file, import_state)
        self._write_json(
            self._pending_import_file,
            {
                "saved_config_name": current_name,
                "snapshot_name": snapshot_name,
                "preset_id": import_state["preset_id"],
                "preset_title": title,
                "imported_at": import_state["imported_at"],
            },
        )

        return dict(import_state)

    def revert_last_import(self) -> Dict[str, Any]:
        state = self._read_json(self._import_state_file, default={})
        backup_name = str(state.get("backup_name") or "").strip()
        if not backup_name:
            raise RuntimeError("没有可回滚的上一次导入。")

        backup_path = self._saved_configs_dir / f"{backup_name}.json"
        current_name = str(state.get("current_name") or "launcher-managed-current")
        current_path = self._saved_configs_dir / f"{current_name}.json"
        if not backup_path.exists():
            raise RuntimeError("回滚备份文件不存在，无法恢复。")

        self._saved_configs_dir.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(backup_path, current_path)
        state["reverted_at"] = _now_iso()
        self._write_json(self._import_state_file, state)
        self._write_json(
            self._pending_import_file,
            {
                "saved_config_name": current_name,
                "snapshot_name": backup_name,
                "preset_id": state.get("preset_id"),
                "preset_title": state.get("preset_title"),
                "imported_at": state.get("imported_at"),
                "reverted_at": state["reverted_at"],
            },
        )
        return self.get_import_state()

    def _resolve_preset_for_import(self, preset_id: str) -> Optional[Dict[str, Any]]:
        if not preset_id:
            return None
        cache = self._read_json(self._cache_file, default={})
        items = cache.get("items") if isinstance(cache, dict) else None
        if isinstance(items, list):
            for item in items:
                if str(item.get("preset_id") or "") == preset_id:
                    return item

        settings = self._settings_provider() or {}
        server_url = self._normalize_server_url(settings.get("managed_server_url"))
        api_key = str(settings.get("managed_api_key") or "").strip()
        if not server_url:
            return None
        detail = self._fetch_detail(server_url, api_key, preset_id)
        if detail:
            return detail
        return None

    def _fetch_catalog(self, server_url: str, api_key: str) -> Dict[str, Any]:
        last_error = "服务器未提供训练参数托管接口。"
        for endpoint in ("/api/training-presets", "/api/training_presets"):
            path = f"{endpoint}?{urlencode({'limit': 120})}"
            try:
                payload = self._request_json(server_url, path, api_key)
                items = self._extract_items(payload)
                normalized = [self._normalize_item(item, server_url, api_key) for item in items]
                return {
                    "server_url": server_url,
                    "source": "remote",
                    "endpoint": endpoint,
                    "fetched_at": _now_iso(),
                    "expires_at": (_now_utc() + self._CACHE_TTL).isoformat(),
                    "items": normalized,
                }
            except RuntimeError as exc:
                last_error = str(exc)
        raise RuntimeError(last_error)

    def _fetch_detail(self, server_url: str, api_key: str, preset_id: str) -> Optional[Dict[str, Any]]:
        for endpoint in (f"/api/training-presets/{preset_id}", f"/api/training_presets/{preset_id}"):
            try:
                payload = self._request_json(server_url, endpoint, api_key)
                item = self._extract_single_item(payload)
                if item:
                    return self._normalize_item(item, server_url, api_key)
            except RuntimeError:
                continue
        return None

    def _request_json(self, server_url: str, path: str, api_key: str) -> Dict[str, Any]:
        url = urljoin(f"{server_url}/", path.lstrip("/"))
        headers = self._build_request_headers(
            accept="application/json, text/plain, */*",
            server_url=server_url,
            remote_url=url,
            api_key=api_key,
        )
        request = Request(url, headers=headers, method="GET")
        try:
            with urlopen(request, timeout=12) as response:
                body = response.read().decode("utf-8", errors="replace")
                if not body.strip():
                    return {}
                data = json.loads(body)
                if isinstance(data, dict):
                    return data
                if isinstance(data, list):
                    return {"items": data}
                raise RuntimeError("服务器返回了无法识别的数据格式。")
        except HTTPError as exc:
            message = self._extract_http_error_message(exc)
            if exc.code == 401:
                raise RuntimeError(message or "API Key 无效，或服务器拒绝了当前凭证。") from exc
            if exc.code == 404:
                raise RuntimeError("服务器未提供训练参数托管接口。") from exc
            if exc.code in (403, 406):
                raise RuntimeError(message or "托管服务器的站点防护拦截了启动器请求。请检查 Cloudflare / WAF 规则，或为 API 路径放行。") from exc
            raise RuntimeError(message or f"服务器返回 HTTP {exc.code}。") from exc
        except URLError as exc:
            raise RuntimeError(f"无法连接到托管服务器：{exc.reason}") from exc
        except json.JSONDecodeError as exc:
            raise RuntimeError("服务器返回的不是合法 JSON。") from exc

    def _extract_http_error_message(self, exc: HTTPError) -> str:
        try:
            raw = exc.read().decode("utf-8", errors="replace")
        except Exception:
            raw = ""
        if not raw:
            return ""
        try:
            payload = json.loads(raw)
            if isinstance(payload, dict):
                for key in ("error", "message", "detail"):
                    value = payload.get(key)
                    if isinstance(value, str) and value.strip():
                        return value.strip()
        except json.JSONDecodeError:
            pass
        return raw.strip()

    def _cache_cover_asset(self, server_url: str, value: Any, api_key: str) -> Optional[str]:
        remote_url = self._absolutize_url(server_url, value)
        if not remote_url:
            return None
        if remote_url.startswith("data:") or remote_url.startswith("file://"):
            return remote_url

        cache_key = hashlib.sha1(remote_url.encode("utf-8")).hexdigest()
        cached_path = self._find_cached_cover(cache_key)
        if cached_path is not None:
            return cached_path.resolve().as_uri()

        headers = self._build_request_headers(
            accept="image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
            server_url=server_url,
            remote_url=remote_url,
            api_key=api_key if self._is_same_origin(server_url, remote_url) else "",
        )
        request = Request(remote_url, headers=headers, method="GET")
        try:
            with urlopen(request, timeout=12) as response:
                content_type = str(response.headers.get("Content-Type") or "").split(";", 1)[0].strip().lower()
                body = response.read()
        except Exception:
            return None

        if not body or len(body) > 8 * 1024 * 1024:
            return None
        if not self._is_image_payload(remote_url, content_type, body):
            return None

        suffix = self._guess_cover_suffix(remote_url, content_type, body)
        target_path = self._cover_cache_dir / f"{cache_key}{suffix}"
        try:
            self._cover_cache_dir.mkdir(parents=True, exist_ok=True)
            target_path.write_bytes(body)
        except OSError:
            return None
        return target_path.resolve().as_uri()

    def _find_cached_cover(self, cache_key: str) -> Optional[Path]:
        if not self._cover_cache_dir.exists():
            return None
        matches = sorted(self._cover_cache_dir.glob(f"{cache_key}.*"))
        return matches[0] if matches else None

    def _is_same_origin(self, server_url: str, remote_url: str) -> bool:
        try:
            left = urlparse(server_url)
            right = urlparse(remote_url)
        except Exception:
            return False
        return (left.scheme, left.netloc) == (right.scheme, right.netloc)

    def _is_image_payload(self, remote_url: str, content_type: str, body: bytes) -> bool:
        if content_type.startswith("image/"):
            return True
        if self._looks_like_image_bytes(body):
            return True
        suffix = Path(urlparse(remote_url).path).suffix.lower()
        return suffix in {".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp", ".svg", ".avif"}

    def _looks_like_image_bytes(self, body: bytes) -> bool:
        return (
            body.startswith(b"\x89PNG\r\n\x1a\n")
            or body.startswith(b"\xff\xd8\xff")
            or body.startswith(b"GIF87a")
            or body.startswith(b"GIF89a")
            or (body.startswith(b"RIFF") and body[8:12] == b"WEBP")
            or body.startswith(b"BM")
            or body.lstrip().startswith(b"<svg")
            or body.lstrip().startswith(b"<?xml")
        )

    def _guess_cover_suffix(self, remote_url: str, content_type: str, body: bytes) -> str:
        content_map = {
            "image/jpeg": ".jpg",
            "image/png": ".png",
            "image/webp": ".webp",
            "image/gif": ".gif",
            "image/bmp": ".bmp",
            "image/svg+xml": ".svg",
            "image/avif": ".avif",
        }
        if content_type in content_map:
            return content_map[content_type]
        suffix = Path(urlparse(remote_url).path).suffix.lower()
        if suffix in {".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp", ".svg", ".avif"}:
            return suffix
        if body.startswith(b"\x89PNG\r\n\x1a\n"):
            return ".png"
        if body.startswith(b"\xff\xd8\xff"):
            return ".jpg"
        if body.startswith(b"GIF87a") or body.startswith(b"GIF89a"):
            return ".gif"
        if body.startswith(b"RIFF") and body[8:12] == b"WEBP":
            return ".webp"
        guessed = mimetypes.guess_extension(content_type or "")
        return guessed or ".img"

    def _build_request_headers(
        self,
        *,
        accept: str,
        server_url: str,
        remote_url: str,
        api_key: str = "",
    ) -> Dict[str, str]:
        parsed_server = urlparse(server_url)
        origin = f"{parsed_server.scheme}://{parsed_server.netloc}" if parsed_server.scheme and parsed_server.netloc else server_url
        headers = {
            "Accept": accept,
            "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
            "Cache-Control": "no-cache",
            "Pragma": "no-cache",
            "Referer": origin.rstrip("/") + "/",
            "Origin": origin,
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin" if self._is_same_origin(server_url, remote_url) else "cross-site",
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/135.0.0.0 Safari/537.36"
            ),
        }
        if api_key:
            headers["Authorization"] = f"Bearer {api_key}"
        return headers

    def _extract_items(self, payload: Any) -> list[Dict[str, Any]]:
        if isinstance(payload, list):
            return [item for item in payload if isinstance(item, dict)]
        if not isinstance(payload, dict):
            return []

        for key in ("items", "presets", "results"):
            value = payload.get(key)
            if isinstance(value, list):
                return [item for item in value if isinstance(item, dict)]

        data = payload.get("data")
        if isinstance(data, list):
            return [item for item in data if isinstance(item, dict)]
        if isinstance(data, dict):
            return self._extract_items(data)

        if any(key in payload for key in ("id", "preset_id", "title", "name")):
            return [payload]
        return []

    def _extract_single_item(self, payload: Any) -> Optional[Dict[str, Any]]:
        items = self._extract_items(payload)
        return items[0] if items else None

    def _normalize_item(self, item: Dict[str, Any], server_url: str, api_key: str = "") -> Dict[str, Any]:
        payload = self._extract_config_payload(item)
        raw_id = item.get("preset_id") or item.get("id") or item.get("slug") or item.get("uuid")
        preset_id = str(raw_id or _safe_stem(item.get("title") or item.get("name") or "preset"))
        title = str(item.get("title") or item.get("name") or preset_id)
        summary = str(item.get("summary") or item.get("description") or item.get("excerpt") or "").strip()
        trainer_type = str(
            item.get("trainer_type")
            or item.get("model_train_type")
            or item.get("training_type")
            or item.get("train_type")
            or ""
        ).strip()
        base_model = str(item.get("base_model") or item.get("model") or item.get("base") or "").strip()
        author = str(
            item.get("author")
            or item.get("username")
            or item.get("uploader_username")
            or item.get("owner")
            or ""
        ).strip()
        tags = _string_list(item.get("tags"))
        cover_url = self._cache_cover_asset(
            server_url,
            item.get("cover_url") or item.get("cover") or item.get("preview_image") or item.get("thumbnail"),
            api_key,
        )
        updated_at = str(item.get("updated_at") or item.get("created_at") or "").strip() or None

        config_preview: Dict[str, Any] = {}
        if isinstance(payload, dict):
            for key in (
                "model_train_type",
                "pretrained_model_name_or_path",
                "train_data_dir",
                "learning_rate",
                "optimizer_type",
                "max_train_epochs",
                "network_dim",
            ):
                if key in payload:
                    config_preview[key] = payload[key]

        return {
            "preset_id": preset_id,
            "title": title,
            "summary": summary,
            "trainer_type": trainer_type,
            "base_model": base_model,
            "author": author,
            "tags": tags,
            "updated_at": updated_at,
            "cover_url": cover_url,
            "detail_url": self._absolutize_url(server_url, item.get("detail_url")),
            "has_payload": isinstance(payload, dict),
            "config_preview": config_preview,
            "payload": payload,
        }

    def _extract_config_payload(self, item: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        candidates = [
            item.get("config"),
            item.get("parameters"),
            item.get("config_payload"),
            item.get("payload"),
            item.get("preset"),
        ]
        data = item.get("data")
        if isinstance(data, dict):
            candidates.extend([
                data.get("config"),
                data.get("parameters"),
                data.get("config_payload"),
                data.get("payload"),
            ])

        for candidate in candidates:
            if isinstance(candidate, dict):
                return candidate
            if isinstance(candidate, str) and candidate.strip():
                try:
                    decoded = json.loads(candidate)
                except json.JSONDecodeError:
                    continue
                if isinstance(decoded, dict):
                    return decoded
        return None

    def _build_public_catalog(
        self,
        cache: Dict[str, Any],
        *,
        configured: bool,
        using_cache: bool,
        stale: bool,
        error: Optional[str],
    ) -> Dict[str, Any]:
        items = cache.get("items") if isinstance(cache, dict) else []
        public_items = []
        if isinstance(items, list):
            for item in items:
                if not isinstance(item, dict):
                    continue
                public_items.append({key: value for key, value in item.items() if key != "payload"})
        return {
            "configured": configured,
            "server_url": cache.get("server_url") if isinstance(cache, dict) else None,
            "source": cache.get("source") if isinstance(cache, dict) else None,
            "endpoint": cache.get("endpoint") if isinstance(cache, dict) else None,
            "fetched_at": cache.get("fetched_at") if isinstance(cache, dict) else None,
            "expires_at": cache.get("expires_at") if isinstance(cache, dict) else None,
            "using_cache": using_cache,
            "stale": stale,
            "error": error,
            "items": public_items,
        }

    def _is_cache_fresh(self, cache: Dict[str, Any], server_url: str) -> bool:
        if not isinstance(cache, dict):
            return False
        if cache.get("server_url") != server_url:
            return False
        expires_at = cache.get("expires_at")
        if not isinstance(expires_at, str) or not expires_at:
            return False
        try:
            return datetime.fromisoformat(expires_at) > _now_utc()
        except ValueError:
            return False

    def _normalize_server_url(self, raw_url: Any) -> str:
        url = str(raw_url or "").strip()
        return url.rstrip("/")

    def _absolutize_url(self, server_url: str, value: Any) -> Optional[str]:
        text = str(value or "").strip()
        if not text:
            return None
        if text.startswith("http://") or text.startswith("https://"):
            return text
        return urljoin(f"{server_url}/", text.lstrip("/"))

    def _read_json(self, path: Path, *, default: Dict[str, Any]) -> Dict[str, Any]:
        if not path.exists():
            return dict(default)
        try:
            payload = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            return dict(default)
        if isinstance(payload, dict):
            return payload
        return dict(default)

    def _write_json(self, path: Path, payload: Dict[str, Any]) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
