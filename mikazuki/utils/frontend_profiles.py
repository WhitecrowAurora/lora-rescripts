from __future__ import annotations

import json
import re
import shutil
import tempfile
import urllib.parse
import urllib.request
import zipfile
from pathlib import Path, PurePosixPath


REPO_ROOT = Path(__file__).resolve().parents[2]
PLUGIN_ROOT = REPO_ROOT / "plugin"
BUILTIN_PROFILE_ID = "builtin-legacy"
DEFAULT_ENTRY_FILE = "index.html"
_GITHUB_OWNER_RE = re.compile(r"^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$")
_GITHUB_REPO_RE = re.compile(r"^[A-Za-z0-9._-]{1,100}$")
_WINDOWS_RESERVED_NAMES = {
    "CON",
    "PRN",
    "AUX",
    "NUL",
    *(f"COM{index}" for index in range(1, 10)),
    *(f"LPT{index}" for index in range(1, 10)),
}


def _read_json(path: Path) -> dict:
    try:
        with open(path, "r", encoding="utf-8") as handle:
            data = json.load(handle)
            return data if isinstance(data, dict) else {}
    except Exception:
        return {}


def _read_first_heading(path: Path) -> str:
    try:
        with open(path, "r", encoding="utf-8") as handle:
            for line in handle:
                stripped = line.strip()
                if stripped.startswith("# "):
                    return stripped[2:].strip()
    except Exception:
        return ""
    return ""


def _as_repo_relative(path: Path) -> str:
    try:
        return str(path.resolve().relative_to(REPO_ROOT.resolve())).replace("\\", "/")
    except Exception:
        return str(path.resolve())


def _detect_entry_dir(plugin_dir: Path, manifest: dict) -> Path | None:
    manifest_entry = str(manifest.get("entry", "")).strip()
    if manifest_entry:
        candidate = (plugin_dir / manifest_entry).resolve()
        if (candidate / DEFAULT_ENTRY_FILE).exists():
            return candidate
        if candidate.is_file() and candidate.name == DEFAULT_ENTRY_FILE:
            return candidate.parent

    candidates = [
        plugin_dir / "ui" / "dist",
        plugin_dir / "ui",
        plugin_dir / "dist",
        plugin_dir / "frontend" / "dist",
        plugin_dir / "frontend",
    ]
    for candidate in candidates:
        if (candidate / DEFAULT_ENTRY_FILE).exists():
            return candidate.resolve()
    return None


def _build_builtin_profile() -> dict:
    entry_dir = (REPO_ROOT / "frontend" / "dist").resolve()
    return {
        "id": BUILTIN_PROFILE_ID,
        "kind": "builtin",
        "name": "Built-in UI",
        "version": "",
        "entry_dir": str(entry_dir),
        "entry_file": DEFAULT_ENTRY_FILE,
        "source_path": _as_repo_relative(entry_dir),
        "plugin_path": "",
        "source_url": "",
        "available": (entry_dir / DEFAULT_ENTRY_FILE).exists(),
        "removable": False,
        "remove_block_reason": "Built-in UI cannot be removed.",
    }


def _build_plugin_profile(plugin_dir: Path) -> dict | None:
    manifest = _read_json(plugin_dir / "manifest.json")
    package_meta = _read_json(plugin_dir / "ui" / "package.json")
    if not package_meta:
        package_meta = _read_json(plugin_dir / "package.json")

    entry_dir = _detect_entry_dir(plugin_dir, manifest)
    if entry_dir is None:
        return None

    display_name = (
        str(manifest.get("name", "")).strip()
        or _read_first_heading(plugin_dir / "README.md")
        or str(package_meta.get("name", "")).strip()
        or plugin_dir.name
    )
    version = str(manifest.get("version", "")).strip() or str(package_meta.get("version", "")).strip()
    entry_file = str(manifest.get("entry_file", "")).strip() or DEFAULT_ENTRY_FILE
    source_url = str(manifest.get("source", "")).strip() or str(manifest.get("source_url", "")).strip()
    git_marker = plugin_dir / ".git"
    installed_via = str(manifest.get("installed_via", "")).strip().lower()
    removable = installed_via == "github-download" and not git_marker.exists()
    remove_block_reason = ""
    if not removable:
        remove_block_reason = "This community UI is part of the repository or not marked as launcher-installed, so it should be managed manually."

    return {
        "id": str(manifest.get("id", "")).strip() or f"community:{plugin_dir.name}",
        "kind": "community",
        "name": display_name,
        "version": version,
        "entry_dir": str(entry_dir),
        "entry_file": entry_file,
        "source_path": _as_repo_relative(entry_dir),
        "plugin_path": _as_repo_relative(plugin_dir),
        "source_url": source_url,
        "available": (entry_dir / entry_file).exists(),
        "removable": removable,
        "remove_block_reason": remove_block_reason,
    }


def list_frontend_profiles() -> list[dict]:
    profiles = [_build_builtin_profile()]

    if not PLUGIN_ROOT.exists():
        return profiles

    for plugin_dir in sorted((path for path in PLUGIN_ROOT.iterdir() if path.is_dir()), key=lambda item: item.name.lower()):
        profile = _build_plugin_profile(plugin_dir)
        if profile is not None:
            profiles.append(profile)

    return profiles


def get_frontend_profile(profile_id: str | None) -> dict | None:
    for profile in list_frontend_profiles():
        if profile["id"] == profile_id:
            return profile
    return None


def resolve_frontend_profile(profile_id: str | None) -> dict:
    profile = get_frontend_profile(profile_id)
    if profile is not None:
        return profile
    return _build_builtin_profile()


def resolve_frontend_profile_id(profile_id: str | None) -> str:
    return resolve_frontend_profile(profile_id)["id"]


def _is_reserved_windows_name(value: str) -> bool:
    stem = value.split(".", 1)[0].upper()
    return stem in _WINDOWS_RESERVED_NAMES


def _is_valid_github_owner(owner: str) -> bool:
    return bool(_GITHUB_OWNER_RE.fullmatch(owner)) and not _is_reserved_windows_name(owner)


def _is_valid_github_repo(repo: str) -> bool:
    if repo in {".", ".."} or _is_reserved_windows_name(repo):
        return False
    return bool(_GITHUB_REPO_RE.fullmatch(repo))


def _resolve_plugin_dir(repo_name: str) -> Path:
    plugin_root = PLUGIN_ROOT.resolve()
    plugin_dir = (PLUGIN_ROOT / repo_name).resolve()
    try:
        relative = plugin_dir.relative_to(plugin_root)
    except ValueError as exc:
        raise ValueError("Refusing to manage a plugin outside the plugin root directory.") from exc
    if plugin_dir == plugin_root or len(relative.parts) != 1:
        raise ValueError("Refusing to manage an invalid plugin directory.")
    return plugin_dir


def _is_launcher_installed_plugin_dir(plugin_dir: Path) -> bool:
    if not plugin_dir.is_dir() or (plugin_dir / ".git").exists():
        return False
    manifest = _read_json(plugin_dir / "manifest.json")
    installed_via = str(manifest.get("installed_via", "")).strip().lower()
    return installed_via == "github-download"


def parse_github_repo_url(repo_url: str) -> dict | None:
    normalized = (repo_url or "").strip()
    if not normalized:
        return None

    parsed = urllib.parse.urlparse(normalized)
    if parsed.scheme not in {"http", "https"}:
        return None
    if parsed.netloc.lower() not in {"github.com", "www.github.com"}:
        return None

    parts = [part for part in parsed.path.split("/") if part]
    if len(parts) < 2:
        return None

    owner = urllib.parse.unquote(parts[0]).strip()
    repo = urllib.parse.unquote(parts[1]).strip()
    if repo.endswith(".git"):
        repo = repo[:-4]
    if not _is_valid_github_owner(owner) or not _is_valid_github_repo(repo):
        return None

    return {
        "owner": owner,
        "repo": repo,
        "normalized_url": f"https://github.com/{owner}/{repo}",
    }


def _http_get_json(url: str) -> dict:
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": "SD-reScripts-PluginInstaller",
            "Accept": "application/vnd.github+json",
        },
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        payload = response.read().decode("utf-8")
    data = json.loads(payload)
    return data if isinstance(data, dict) else {}


def _download_file(url: str, destination: Path) -> None:
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": "SD-reScripts-PluginInstaller",
            "Accept": "application/octet-stream",
        },
    )
    with urllib.request.urlopen(request, timeout=60) as response, open(destination, "wb") as handle:
        shutil.copyfileobj(response, handle)


def _safe_extract_zip(archive: zipfile.ZipFile, destination: Path) -> None:
    destination_root = destination.resolve()
    for member in archive.infolist():
        member_name = str(member.filename or "").replace("\\", "/")
        if not member_name:
            continue

        member_path = PurePosixPath(member_name)
        if member_path.is_absolute() or ".." in member_path.parts:
            raise RuntimeError(f"Refusing to extract unsafe archive entry: {member.filename}")

        target_path = (destination_root / Path(*member_path.parts)).resolve()
        try:
            target_path.relative_to(destination_root)
        except ValueError as exc:
            raise RuntimeError(f"Refusing to extract archive entry outside destination: {member.filename}") from exc

        if member.is_dir():
            target_path.mkdir(parents=True, exist_ok=True)
            continue

        target_path.parent.mkdir(parents=True, exist_ok=True)
        with archive.open(member, "r") as source, open(target_path, "wb") as handle:
            shutil.copyfileobj(source, handle)


def install_github_frontend_plugin(repo_url: str, *, replace_existing: bool = False) -> dict:
    repo_info = parse_github_repo_url(repo_url)
    if repo_info is None:
        raise ValueError("Only standard GitHub repository URLs are supported right now.")

    plugin_dir = _resolve_plugin_dir(repo_info["repo"])
    if plugin_dir.exists():
        if not replace_existing:
            raise ValueError(f"Plugin directory already exists: {plugin_dir}")
        if not _is_launcher_installed_plugin_dir(plugin_dir):
            raise ValueError("Only launcher-installed GitHub community UIs can be replaced automatically.")

    repo_meta = _http_get_json(f"https://api.github.com/repos/{repo_info['owner']}/{repo_info['repo']}")
    default_branch = str(repo_meta.get("default_branch", "")).strip() or "main"
    archive_url = f"https://codeload.github.com/{repo_info['owner']}/{repo_info['repo']}/zip/refs/heads/{default_branch}"

    PLUGIN_ROOT.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory(prefix="mikazuki-plugin-") as temp_dir_str:
        temp_dir = Path(temp_dir_str)
        archive_path = temp_dir / f"{repo_info['repo']}.zip"
        extract_dir = temp_dir / "extract"
        extract_dir.mkdir(parents=True, exist_ok=True)

        _download_file(archive_url, archive_path)

        with zipfile.ZipFile(archive_path, "r") as archive:
            _safe_extract_zip(archive, extract_dir)

        extracted_roots = [path for path in extract_dir.iterdir() if path.is_dir()]
        if not extracted_roots:
            raise RuntimeError("Downloaded archive did not contain an extracted repository directory.")

        source_dir = extracted_roots[0]
        manifest_path = source_dir / "manifest.json"
        existing_manifest = _read_json(manifest_path)
        generated_manifest = {
            **existing_manifest,
            "id": existing_manifest.get("id") or f"community:{repo_info['repo']}",
            "name": existing_manifest.get("name") or repo_info["repo"],
            "version": existing_manifest.get("version") or str(repo_meta.get("default_branch", "")).strip(),
            "entry": existing_manifest.get("entry") or "ui/dist",
            "entry_file": existing_manifest.get("entry_file") or DEFAULT_ENTRY_FILE,
            "source": existing_manifest.get("source") or repo_info["normalized_url"],
            "installed_via": "github-download",
        }
        with open(manifest_path, "w", encoding="utf-8") as handle:
            json.dump(generated_manifest, handle, indent=2, ensure_ascii=False)

        prepared_profile = _build_plugin_profile(source_dir)
        if prepared_profile is None or not prepared_profile.get("available", False):
            raise RuntimeError(
                "The repository was downloaded, but no usable frontend entry was found. "
                "Expected ui/dist/index.html, dist/index.html, or frontend/dist/index.html."
            )

        if plugin_dir.exists():
            shutil.rmtree(plugin_dir, ignore_errors=False)
        shutil.move(str(source_dir), str(plugin_dir))

    profile = _build_plugin_profile(plugin_dir)
    if profile is None or not profile.get("available", False):
        raise RuntimeError(
            "The repository was downloaded, but no usable frontend entry was found. "
            "Expected ui/dist/index.html, dist/index.html, or frontend/dist/index.html."
        )

    return profile


def uninstall_frontend_plugin(profile_id: str) -> dict:
    profile = get_frontend_profile(profile_id)
    if profile is None:
        raise ValueError(f"UI not found: {profile_id}")
    if profile["kind"] != "community":
        raise ValueError("Only community UI packages can be removed.")
    if not profile.get("removable", False):
        raise ValueError(profile.get("remove_block_reason") or "This UI cannot be removed here.")

    plugin_path = _resolve_plugin_dir(Path(profile["plugin_path"]).name)
    if not plugin_path.exists():
        raise ValueError(f"Plugin directory does not exist: {plugin_path}")

    shutil.rmtree(plugin_path, ignore_errors=False)
    return profile
