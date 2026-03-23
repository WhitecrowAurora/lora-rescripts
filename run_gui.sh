#!/usr/bin/env bash

set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"

export HF_HOME="${HF_HOME:-huggingface}"
export PYTHONUTF8=1
export PIP_DISABLE_PIP_VERSION_CHECK=1

portable_python="$script_dir/python/bin/python"
venv_python="$script_dir/venv/bin/python"
portable_marker="$script_dir/python/.deps_installed"
venv_marker="$script_dir/venv/.deps_installed"
tageditor_portable_python="$script_dir/python_tageditor/bin/python"
tageditor_venv_python="$script_dir/venv-tageditor/bin/python"
allow_external_python="${MIKAZUKI_ALLOW_SYSTEM_PYTHON:-0}"
main_modules=(accelerate torch fastapi toml transformers diffusers lion_pytorch dadaptation schedulefree prodigyopt prodigyplus pytorch_optimizer)

python_exe=""
deps_marker=""
tageditor_python=""
tageditor_marker=""
disable_tageditor=0

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

test_package_constraints() {
    local python_bin="$1"
    shift

    if [[ "$#" -eq 0 ]]; then
        return 0
    fi

    "$python_bin" -c "import sys, importlib.metadata as md; from packaging.specifiers import SpecifierSet; from packaging.version import Version; ok=True
for item in sys.argv[1:]:
    name, spec = item.split(chr(31), 1)
    try:
        version = md.version(name)
    except md.PackageNotFoundError:
        ok = False
        continue
    if spec and Version(version) not in SpecifierSet(spec):
        ok = False
raise SystemExit(0 if ok else 1)" "$@" >/dev/null 2>&1
}

get_python_minor_version() {
    local python_bin="$1"
    "$python_bin" -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')" 2>/dev/null
}

select_main_python() {
    if [[ -x "$portable_python" ]]; then
        echo "Using portable Python..."
        if ! test_pip_ready "$portable_python"; then
            echo "Portable Python is incomplete: pip is not available. Repair or replace the bundled python folder first." >&2
            exit 1
        fi
        python_exe="$portable_python"
        deps_marker="$portable_marker"
        return 0
    fi

    if [[ -x "$venv_python" ]]; then
        echo "Using virtual environment..."
        python_exe="$venv_python"
        deps_marker="$venv_marker"
        return 0
    fi

    if [[ "$allow_external_python" == "1" ]]; then
        echo "No project-local Python found. MIKAZUKI_ALLOW_SYSTEM_PYTHON=1 is set, bootstrapping a project-local venv via install.bash..."
        bash "$script_dir/install.bash"
        if [[ -x "$portable_python" ]]; then
            python_exe="$portable_python"
            deps_marker="$portable_marker"
            return 0
        fi
        if [[ -x "$venv_python" ]]; then
            python_exe="$venv_python"
            deps_marker="$venv_marker"
            return 0
        fi
        echo "install.bash finished, but no project-local Python environment was created." >&2
        exit 1
    fi

    cat >&2 <<EOF
No project-local Python environment was found.

This build is locked to project-local Python by default to avoid leaking installs into the host machine.

Expected one of:
- $portable_python
- $venv_python

Recommended fix:
1. Bundle a ready-to-run portable Python in ./python
2. Or set MIKAZUKI_ALLOW_SYSTEM_PYTHON=1 and rerun to bootstrap a project-local ./venv for development
EOF
    exit 1
}

select_tageditor_python() {
    tageditor_python=""
    tageditor_marker=""

    if [[ -x "$tageditor_portable_python" ]]; then
        tageditor_python="$tageditor_portable_python"
        tageditor_marker="$script_dir/python_tageditor/.tageditor_installed"
        return 0
    fi

    if [[ -x "$tageditor_venv_python" ]]; then
        tageditor_python="$tageditor_venv_python"
        tageditor_marker="$script_dir/venv-tageditor/.tageditor_installed"
        return 0
    fi

    local main_python_version
    main_python_version="$(get_python_minor_version "$python_exe" || true)"
    if [[ -n "$main_python_version" && "$main_python_version" != "3.13" ]]; then
        tageditor_python="$python_exe"
        if [[ "$python_exe" == "$portable_python" ]]; then
            tageditor_marker="$script_dir/python/.tageditor_installed"
        elif [[ "$python_exe" == "$venv_python" ]]; then
            tageditor_marker="$script_dir/venv/.tageditor_installed"
        fi
    fi
}

for arg in "$@"; do
    if [[ "$arg" == "--disable-tageditor" ]]; then
        disable_tageditor=1
        break
    fi
done

select_main_python

main_install_needed=0

if ! test_modules_ready "$python_exe" "${main_modules[@]}"; then
    main_install_needed=1
fi

if [[ "$main_install_needed" -eq 0 && -n "$deps_marker" && ! -f "$deps_marker" ]]; then
    main_install_needed=1
fi

if [[ "$main_install_needed" -eq 1 ]]; then
    echo "Dependencies are not installed yet. Running install.bash..."
    bash "$script_dir/install.bash"
    select_main_python
    if ! test_modules_ready "$python_exe" "${main_modules[@]}"; then
        echo "Dependency installation failed." >&2
        exit 1
    fi
    if [[ -n "$deps_marker" && ! -f "$deps_marker" ]]; then
        echo "Dependency installation failed." >&2
        exit 1
    fi
fi

if [[ "$disable_tageditor" -eq 0 ]]; then
    select_tageditor_python
    if [[ -n "$tageditor_python" ]]; then
        tageditor_modules=(gradio transformers timm print_color)
        tageditor_constraints=(
            $'gradio\x1f==4.28.3'
            $'gradio-client\x1f==0.16.0'
            $'fastapi\x1f<0.113'
            $'starlette\x1f<0.39'
            $'pydantic\x1f<2.11'
            $'huggingface-hub\x1f<1'
        )
        tageditor_install_needed=0

        if ! test_modules_ready "$tageditor_python" "${tageditor_modules[@]}"; then
            tageditor_install_needed=1
        fi

        if [[ "$tageditor_install_needed" -eq 0 && -n "$tageditor_marker" && ! -f "$tageditor_marker" ]]; then
            tageditor_install_needed=1
        fi

        if [[ "$tageditor_install_needed" -eq 0 ]] && ! test_package_constraints "$tageditor_python" "${tageditor_constraints[@]}"; then
            tageditor_install_needed=1
        fi

        if [[ "$tageditor_install_needed" -eq 1 ]]; then
            if ! test_pip_ready "$tageditor_python"; then
                echo "Tag editor Python is incomplete: pip is not available." >&2
                exit 1
            fi

            echo "Tag editor dependencies are missing or incompatible. Running install_tageditor.sh..."
            bash "$script_dir/install_tageditor.sh"
            select_tageditor_python
            if [[ -z "$tageditor_python" ]] || ! test_modules_ready "$tageditor_python" "${tageditor_modules[@]}" || ! test_package_constraints "$tageditor_python" "${tageditor_constraints[@]}"; then
                echo "Tag editor dependency installation failed." >&2
                exit 1
            fi
            if [[ -n "$tageditor_marker" && ! -f "$tageditor_marker" ]]; then
                echo "Tag editor dependency installation failed." >&2
                exit 1
            fi
        fi
    fi
fi

cd "$script_dir"
exec "$python_exe" gui.py "$@"
