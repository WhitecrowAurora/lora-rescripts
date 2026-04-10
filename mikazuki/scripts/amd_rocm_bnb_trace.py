from __future__ import annotations

import importlib.metadata as md
import json
import os
import subprocess
import sys
import sysconfig
import time
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from mikazuki.utils.runtime_mode import infer_attention_runtime_mode


KEYWORDS = ("bitsandbytes", "pytorch_optimizer")
LOG_DIR = REPO_ROOT / "logs" / "diagnostics"
STATIC_SCAN_DIRS = (
    REPO_ROOT / "mikazuki",
    REPO_ROOT / "scripts" / "stable" / "library",
    REPO_ROOT / "scripts" / "stable" / "networks",
    REPO_ROOT / "scripts" / "stable" / "lulynx_amd",
    REPO_ROOT / "scripts" / "stable" / "lulynx_intel",
)
STATIC_SCAN_SUFFIXES = {".py", ".ps1", ".bat", ".ts", ".js"}
CHILD_IMPORT_TARGETS = (
    {
        "label": "bootstrap_inherited_env",
        "kind": "noop",
        "force_repo_pythonpath": False,
        "prepend_project_paths": False,
        "manual_bootstrap_if_missing": False,
    },
    {
        "label": "bootstrap_forced_repo_pythonpath",
        "kind": "noop",
        "force_repo_pythonpath": True,
        "prepend_project_paths": False,
        "manual_bootstrap_if_missing": False,
    },
    {
        "label": "import_diffusers_core",
        "kind": "exec",
        "payload": "from diffusers import AutoencoderKL, EulerDiscreteScheduler, UNet2DConditionModel",
        "force_repo_pythonpath": True,
        "prepend_project_paths": True,
        "manual_bootstrap_if_missing": True,
    },
    {
        "label": "import_library_train_util",
        "kind": "exec",
        "payload": "import library.train_util",
        "force_repo_pythonpath": True,
        "prepend_project_paths": True,
        "manual_bootstrap_if_missing": True,
    },
    {
        "label": "import_library_sdxl_model_util",
        "kind": "exec",
        "payload": "import library.sdxl_model_util",
        "force_repo_pythonpath": True,
        "prepend_project_paths": True,
        "manual_bootstrap_if_missing": True,
    },
    {
        "label": "direct_import_bitsandbytes",
        "kind": "exec",
        "payload": "import bitsandbytes",
        "force_repo_pythonpath": True,
        "prepend_project_paths": True,
        "manual_bootstrap_if_missing": True,
    },
    {
        "label": "direct_import_pytorch_optimizer",
        "kind": "exec",
        "payload": "import pytorch_optimizer",
        "force_repo_pythonpath": True,
        "prepend_project_paths": True,
        "manual_bootstrap_if_missing": True,
    },
)

CHILD_PROBE_CODE = r"""
from __future__ import annotations

import builtins
import importlib
import importlib.metadata
import importlib.util
import json
import os
import sys
import traceback
from pathlib import Path


KEYWORDS = ("bitsandbytes", "pytorch_optimizer")
spec = json.loads(sys.argv[1])
repo_root = Path(spec["repo_root"])

report = {
    "label": spec["label"],
    "success": False,
    "runtime_mode": "",
    "sys_executable": sys.executable,
    "cwd": os.getcwd(),
    "sitecustomize_preloaded": "sitecustomize" in sys.modules,
    "sitecustomize_loaded_after_probe": False,
    "auto_bootstrap_detected": False,
    "manual_bootstrap_attempted": False,
    "guard_env_before": {
        "MIKAZUKI_EXPERIMENTAL_IMPORT_GUARDS": os.environ.get("MIKAZUKI_EXPERIMENTAL_IMPORT_GUARDS", ""),
        "MIKAZUKI_EXPERIMENTAL_IMPORT_GUARDS_PATCHED": os.environ.get("MIKAZUKI_EXPERIMENTAL_IMPORT_GUARDS_PATCHED", ""),
    },
    "guard_env_after": {},
    "pythonpath": os.environ.get("PYTHONPATH", ""),
    "sys_path_head": [str(item) for item in sys.path[:8]],
    "events": [],
    "event_count": 0,
    "error": "",
    "traceback_tail": "",
}


def short_exc(exc: Exception) -> str:
    text = str(exc).strip()
    return text.splitlines()[0] if text else exc.__class__.__name__


def normalize_name(name) -> str:
    return str(name or "").strip()


def is_interesting(name) -> bool:
    lowered = normalize_name(name).lower()
    return any(keyword in lowered for keyword in KEYWORDS)


def compact_callers() -> list[str]:
    callers = []
    for frame in traceback.extract_stack(limit=12)[:-2]:
        filename = str(frame.filename or "").replace("\\", "/")
        lowered = filename.lower()
        if not filename:
            continue
        if "<frozen importlib" in lowered or "importlib" in lowered or "traceback" in lowered:
            continue
        callers.append(f"{Path(filename).name}:{frame.lineno}")
    return callers[-4:]


_events = []
_event_index = {}


def add_event(kind: str, name: str) -> None:
    normalized = normalize_name(name)
    if not is_interesting(normalized):
        return
    callers = compact_callers()
    key = (kind, normalized, tuple(callers))
    event = _event_index.get(key)
    if event is None:
        event = {
            "kind": kind,
            "name": normalized,
            "callers": callers,
            "count": 1,
        }
        _event_index[key] = event
        _events.append(event)
    else:
        event["count"] += 1


if spec.get("prepend_project_paths"):
    for path in (
        repo_root / "scripts" / "stable",
        repo_root / "scripts",
        repo_root,
    ):
        path_str = str(path)
        if path.exists() and path_str not in sys.path:
            sys.path.insert(0, path_str)


report["sys_path_head"] = [str(item) for item in sys.path[:8]]
report["auto_bootstrap_detected"] = bool(
    report["sitecustomize_preloaded"]
    or report["guard_env_before"]["MIKAZUKI_EXPERIMENTAL_IMPORT_GUARDS"]
    or report["guard_env_before"]["MIKAZUKI_EXPERIMENTAL_IMPORT_GUARDS_PATCHED"]
)

if spec.get("manual_bootstrap_if_missing") and "sitecustomize" not in sys.modules:
    report["manual_bootstrap_attempted"] = True
    try:
        import sitecustomize  # noqa: F401
    except Exception as exc:
        add_event("manual_sitecustomize_error", exc.__class__.__name__)
        report["error"] = f"manual sitecustomize import failed: {short_exc(exc)}"


report["sitecustomize_loaded_after_probe"] = "sitecustomize" in sys.modules

try:
    from mikazuki.utils.runtime_mode import infer_attention_runtime_mode

    report["runtime_mode"] = infer_attention_runtime_mode()
except Exception:
    report["runtime_mode"] = ""


original_import = builtins.__import__
original_import_module = importlib.import_module
original_find_spec = importlib.util.find_spec
original_metadata_version = importlib.metadata.version


def traced_import(name, globals=None, locals=None, fromlist=(), level=0):
    add_event("__import__", name)
    return original_import(name, globals, locals, fromlist, level)


def traced_import_module(name, package=None):
    add_event("import_module", name)
    return original_import_module(name, package)


def traced_find_spec(name, package=None):
    add_event("find_spec", name)
    return original_find_spec(name, package)


def traced_metadata_version(name):
    add_event("metadata.version", name)
    return original_metadata_version(name)


builtins.__import__ = traced_import
importlib.import_module = traced_import_module
importlib.util.find_spec = traced_find_spec
importlib.metadata.version = traced_metadata_version

try:
    kind = spec["kind"]
    payload = spec.get("payload", "")
    if kind == "noop":
        pass
    elif kind == "exec":
        exec(payload, {"__name__": "__amd_rocm_bnb_trace__"})
    else:
        raise RuntimeError(f"Unsupported probe kind: {kind}")

    report["success"] = not bool(report["error"])
except Exception as exc:
    report["success"] = False
    report["error"] = short_exc(exc)
    report["traceback_tail"] = traceback.format_exc(limit=8).strip()
finally:
    builtins.__import__ = original_import
    importlib.import_module = original_import_module
    importlib.util.find_spec = original_find_spec
    importlib.metadata.version = original_metadata_version

report["events"] = _events
report["event_count"] = sum(int(event.get("count", 1)) for event in _events)
report["guard_env_after"] = {
    "MIKAZUKI_EXPERIMENTAL_IMPORT_GUARDS": os.environ.get("MIKAZUKI_EXPERIMENTAL_IMPORT_GUARDS", ""),
    "MIKAZUKI_EXPERIMENTAL_IMPORT_GUARDS_PATCHED": os.environ.get("MIKAZUKI_EXPERIMENTAL_IMPORT_GUARDS_PATCHED", ""),
}
print(json.dumps(report, ensure_ascii=False))
"""


def metadata_version(*names: str) -> str:
    for name in names:
        try:
            return md.version(name)
        except Exception:
            continue
    return ""


def inspect_embedded_python_pth() -> dict[str, object]:
    python_dir = Path(sys.executable).resolve().parent
    pth_file = next(iter(sorted(python_dir.glob("python*._pth"))), None)
    if pth_file is None:
        return {
            "exists": False,
            "path": "",
            "entries": [],
            "has_repo_root_entry": False,
        }

    lines = read_text_lines(pth_file)
    normalized_entries = [line.strip() for line in lines if line.strip() and not line.strip().startswith("#")]
    return {
        "exists": True,
        "path": str(pth_file),
        "entries": normalized_entries,
        "has_repo_root_entry": ".." in normalized_entries or str(REPO_ROOT) in normalized_entries,
    }


def short_exc(exc: Exception) -> str:
    text = str(exc).strip()
    return text.splitlines()[0] if text else exc.__class__.__name__


def read_text_lines(path: Path) -> list[str]:
    try:
        return path.read_text(encoding="utf-8", errors="replace").splitlines()
    except Exception:
        return []


def collect_static_hits() -> dict[str, object]:
    results: list[dict[str, object]] = []

    def scan_file(path: Path) -> None:
        lines = read_text_lines(path)
        if not lines:
            return

        hits = []
        for index, line in enumerate(lines, start=1):
            lowered = line.lower()
            if any(keyword in lowered for keyword in KEYWORDS):
                stripped = line.strip()
                if stripped:
                    hits.append({"line": index, "text": stripped[:240]})

        if hits:
            results.append(
                {
                    "path": str(path.relative_to(REPO_ROOT)),
                    "hit_count": len(hits),
                    "hits": hits[:20],
                }
            )

    for root in STATIC_SCAN_DIRS:
        if not root.exists():
            continue
        for path in root.rglob("*"):
            if not path.is_file():
                continue
            if path.suffix.lower() not in STATIC_SCAN_SUFFIXES:
                continue
            scan_file(path)

    purelib = Path(sysconfig.get_paths().get("purelib", "") or "")
    extra_files = (
        purelib / "transformers" / "utils" / "import_utils.py",
        purelib / "transformers" / "integrations" / "bitsandbytes.py",
        purelib / "transformers" / "modeling_utils.py",
        purelib / "diffusers" / "utils" / "import_utils.py",
        purelib / "pytorch_optimizer" / "optimizer" / "__init__.py",
    )
    for file_path in extra_files:
        if file_path.exists():
            scan_file(file_path)

    results.sort(key=lambda item: (item["path"], item["hit_count"]))
    return {
        "file_count": len(results),
        "results": results,
    }


def run_child_probe(spec: dict[str, object]) -> dict[str, object]:
    env = os.environ.copy()
    if bool(spec.get("force_repo_pythonpath")):
        repo_root_str = str(REPO_ROOT)
        existing = env.get("PYTHONPATH", "")
        parts = [part for part in existing.split(os.pathsep) if part]
        if repo_root_str not in parts:
            env["PYTHONPATH"] = os.pathsep.join([repo_root_str, *parts]) if parts else repo_root_str

    payload = dict(spec)
    payload["repo_root"] = str(REPO_ROOT)
    command = [sys.executable, "-c", CHILD_PROBE_CODE, json.dumps(payload, ensure_ascii=False)]

    started = time.time()
    completed = subprocess.run(
        command,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        env=env,
        cwd=str(REPO_ROOT),
    )
    duration = round(time.time() - started, 3)

    stdout_text = (completed.stdout or "").strip()
    stderr_text = (completed.stderr or "").strip()

    result: dict[str, object] = {
        "label": str(spec.get("label", "") or ""),
        "returncode": int(completed.returncode),
        "duration_sec": duration,
        "stdout": stdout_text.splitlines()[-20:],
        "stderr": stderr_text.splitlines()[-20:],
        "parse_error": "",
    }

    if stdout_text:
        last_line = stdout_text.splitlines()[-1]
        try:
            parsed = json.loads(last_line)
            if isinstance(parsed, dict):
                result.update(parsed)
        except Exception as exc:
            result["parse_error"] = short_exc(exc)

    return result


def build_report() -> dict[str, object]:
    report: dict[str, object] = {
        "success": True,
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "repo_root": str(REPO_ROOT),
        "python_executable": sys.executable,
        "python_version": sys.version.split()[0],
        "runtime_mode": infer_attention_runtime_mode(),
        "sitecustomize_preloaded": "sitecustomize" in sys.modules,
        "pythonpath": os.environ.get("PYTHONPATH", ""),
        "embedded_python_pth": inspect_embedded_python_pth(),
        "guard_env": {
            "MIKAZUKI_ROCM_AMD_STARTUP": os.environ.get("MIKAZUKI_ROCM_AMD_STARTUP", ""),
            "MIKAZUKI_PREFERRED_RUNTIME": os.environ.get("MIKAZUKI_PREFERRED_RUNTIME", ""),
            "MIKAZUKI_EXPERIMENTAL_IMPORT_GUARDS": os.environ.get("MIKAZUKI_EXPERIMENTAL_IMPORT_GUARDS", ""),
            "MIKAZUKI_EXPERIMENTAL_IMPORT_GUARDS_PATCHED": os.environ.get("MIKAZUKI_EXPERIMENTAL_IMPORT_GUARDS_PATCHED", ""),
        },
        "package_versions": {
            "torch": metadata_version("torch"),
            "torchvision": metadata_version("torchvision"),
            "diffusers": metadata_version("diffusers"),
            "transformers": metadata_version("transformers"),
            "accelerate": metadata_version("accelerate"),
            "bitsandbytes": metadata_version("bitsandbytes"),
            "pytorch_optimizer": metadata_version("pytorch_optimizer"),
        },
        "static_scan": collect_static_hits(),
        "child_probes": [],
    }

    for spec in CHILD_IMPORT_TARGETS:
        probe_result = run_child_probe(spec)
        report["child_probes"].append(probe_result)
        if not probe_result.get("success", False) and str(spec.get("label", "")).startswith("import_"):
            report["success"] = False

    return report


def main() -> int:
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    report = build_report()
    output_path = LOG_DIR / f"amd-rocm-bnb-trace-{time.strftime('%Y%m%d-%H%M%S')}.json"
    output_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    print("========================================")
    print("AMD ROCm bitsandbytes trace diagnostics")
    print("========================================")
    print(f"Runtime mode: {report['runtime_mode']}")
    print(f"Python: {report['python_executable']}")
    print(f"Report: {output_path}")
    print("")
    print("Child probes:")
    for probe in report["child_probes"]:
        label = probe.get("label", "")
        success = probe.get("success", False)
        error = probe.get("error", "") or probe.get("parse_error", "")
        event_count = probe.get("event_count", 0)
        print(f"- {label}: {'OK' if success else 'FAIL'} | events={event_count}" + (f" | {error}" if error else ""))

    print("")
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0 if report.get("success", False) else 1


if __name__ == "__main__":
    raise SystemExit(main())
