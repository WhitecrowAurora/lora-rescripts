#!/usr/bin/env bash

set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
disable_venv=0
allow_external_python="${MIKAZUKI_ALLOW_SYSTEM_PYTHON:-0}"

while (($#)); do
    case "$1" in
        --disable-venv)
            disable_venv=1
            ;;
    esac
    shift
done

export HF_HOME="${HF_HOME:-huggingface}"
export PYTHONUTF8=1
export PIP_DISABLE_PIP_VERSION_CHECK=1

portable_python="$script_dir/python/bin/python"
venv_python="$script_dir/venv/bin/python"
portable_marker="$script_dir/python/.deps_installed"
venv_marker="$script_dir/venv/.deps_installed"
main_required_modules=(accelerate torch fastapi toml transformers diffusers lion_pytorch dadaptation schedulefree prodigyopt prodigyplus pytorch_optimizer)

python_exe=""
deps_marker=""

find_system_python() {
    if [[ -n "${PYTHON:-}" ]]; then
        if [[ -x "${PYTHON}" ]]; then
            printf '%s\n' "${PYTHON}"
            return 0
        fi
        if command -v "${PYTHON}" >/dev/null 2>&1; then
            command -v "${PYTHON}"
            return 0
        fi
    fi

    if command -v python3 >/dev/null 2>&1; then
        command -v python3
        return 0
    fi

    if command -v python >/dev/null 2>&1; then
        command -v python
        return 0
    fi

    echo "No usable system Python was found. Install python3 or set \$PYTHON first." >&2
    exit 1
}

test_pip_ready() {
    local python_bin="$1"
    "$python_bin" -m pip --version >/dev/null 2>&1
}

test_modules_ready() {
    local python_bin="$1"
    shift

    if [[ "$#" -eq 0 ]]; then
        return 0
    fi

    "$python_bin" -c "import importlib, sys; failed=[]
for name in sys.argv[1:]:
    try:
        importlib.import_module(name)
    except Exception:
        failed.append(name)
raise SystemExit(1 if failed else 0)" "$@" >/dev/null 2>&1
}

invoke_step() {
    local message="$1"
    shift
    echo "$message"
    "$@"
}

invoke_optional_step() {
    local message="$1"
    local warning_message="$2"
    shift 2
    echo "$message"
    if ! "$@"; then
        echo "$warning_message"
    fi
}

select_python() {
    if [[ -x "$portable_python" ]]; then
        echo "Using portable Python..."
        if ! test_pip_ready "$portable_python"; then
            cat <<'EOF'
Portable Python is incomplete: pip is not available.

This project now assumes the bundled python folder is already a ready-to-run environment for packaging and distribution.
Normal installation will not auto-bootstrap embedded Python anymore.

Recommended fix:
1. Replace the bundled python folder with a prepared portable Python environment.
2. If you are repairing a raw embeddable Python manually, run setup_embeddable_python.bat yourself.
EOF
            exit 1
        fi
        python_exe="$portable_python"
        deps_marker="$portable_marker"
        return 0
    fi

    if [[ -x "$venv_python" ]]; then
        echo "Using existing project virtual environment..."
        if ! test_pip_ready "$venv_python"; then
            echo "Project virtual environment is incomplete: pip is not available. Repair or recreate ./venv first." >&2
            exit 1
        fi
        python_exe="$venv_python"
        deps_marker="$venv_marker"
        return 0
    fi

    if [[ "$allow_external_python" != "1" ]]; then
        cat >&2 <<EOF
No project-local Python environment was found.

This installer is locked to project-local Python by default to avoid leaking packages into the host machine.

Expected one of:
- $portable_python
- $venv_python

Recommended fix:
1. Bundle a ready-to-run portable Python in ./python
2. Or set MIKAZUKI_ALLOW_SYSTEM_PYTHON=1 once to bootstrap a project-local ./venv for development
EOF
        exit 1
    fi

    if [[ "$disable_venv" -eq 1 ]]; then
        echo "install.bash no longer installs into the system Python by default. Remove --disable-venv and rerun with MIKAZUKI_ALLOW_SYSTEM_PYTHON=1 to bootstrap a project-local ./venv." >&2
        exit 1
    fi

    local system_python
    system_python="$(find_system_python)"
    echo "No project-local Python found. MIKAZUKI_ALLOW_SYSTEM_PYTHON=1 is set, creating a project-local venv from system Python..."
    "$system_python" -m venv "$script_dir/venv"
    python_exe="$venv_python"
    deps_marker="$venv_marker"
}

select_python

cd "$script_dir"

invoke_step "Upgrading pip tooling..." \
    "$python_exe" -m pip install --upgrade --no-warn-script-location pip "setuptools<81" wheel

invoke_step "Installing PyTorch and torchvision (CUDA 12.8 channel)..." \
    "$python_exe" -m pip install --upgrade --no-warn-script-location --prefer-binary \
    torch==2.10.0+cu128 torchvision==0.25.0+cu128 \
    --extra-index-url https://download.pytorch.org/whl/cu128

invoke_optional_step \
    "Installing xformers (optional)..." \
    "Optional xformers installation failed. The GUI will still work and training can fall back to SDPA." \
    "$python_exe" -m pip install --upgrade --no-warn-script-location --only-binary xformers --index-url https://download.pytorch.org/whl/cu128 "xformers>=0.0.34"

invoke_step "Installing project dependencies..." \
    "$python_exe" -m pip install --upgrade --no-warn-script-location --prefer-binary -r requirements.txt

if ! test_modules_ready "$python_exe" "${main_required_modules[@]}"; then
    echo "Project dependencies did not finish installing correctly. One or more required runtime modules are still missing." >&2
    exit 1
fi

if [[ -n "$deps_marker" ]]; then
    : > "$deps_marker"
fi

echo "Install completed"
