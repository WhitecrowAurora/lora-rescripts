#!/usr/bin/env bash

set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"

export HF_HOME="${HF_HOME:-huggingface}"
export HF_ENDPOINT="${HF_ENDPOINT:-https://hf-mirror.com}"
export PIP_INDEX_URL="${PIP_INDEX_URL:-https://pypi.tuna.tsinghua.edu.cn/simple}"
export PIP_FIND_LINKS="${PIP_FIND_LINKS:-https://mirror.sjtu.edu.cn/pytorch-wheels/torch_stable.html}"
export GIT_CONFIG_GLOBAL="${GIT_CONFIG_GLOBAL:-$script_dir/assets/gitconfig-cn}"
export GIT_TERMINAL_PROMPT="${GIT_TERMINAL_PROMPT:-false}"
export MIKAZUKI_CN_MIRROR=1
export PYTHONUTF8=1

exec bash "$script_dir/run_gui.sh" "$@"
