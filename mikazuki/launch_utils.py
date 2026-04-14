import locale
import os
import platform
import re
import shutil
import subprocess
import sys
import socket
import sysconfig
from pathlib import Path
from typing import List, Optional

from importlib import metadata

from packaging.requirements import InvalidRequirement, Requirement
from packaging.version import Version

from mikazuki.log import log
from mikazuki.utils.runtime_mode import infer_runtime_environment_name, is_amd_rocm_runtime, is_intel_xpu_runtime

python_bin = sys.executable


def base_dir_path():
    return Path(__file__).parents[1].absolute()


def find_windows_git():
    possible_paths = ["git\\bin\\git.exe", "git\\cmd\\git.exe", "Git\\mingw64\\libexec\\git-core\\git.exe", "C:\\Program Files\\Git\\cmd\\git.exe"]
    for path in possible_paths:
        if os.path.exists(path):
            return path


def prepare_git():
    if shutil.which("git"):
        return True

    log.info("Finding git...")

    if sys.platform == "win32":
        git_path = find_windows_git()

        if git_path is not None:
            log.info(f"Git not found, but found git in {git_path}, add it to PATH")
            os.environ["PATH"] += os.pathsep + os.path.dirname(git_path)
            return True
        else:
            return False
    else:
        log.error("git not found, please install git first")
        return False


def prepare_submodules():
    frontend_path = base_dir_path() / "frontend" / "dist"
    tag_editor_path = base_dir_path() / "mikazuki" / "dataset-tag-editor" / "scripts"

    if not os.path.exists(frontend_path) or not os.path.exists(tag_editor_path):
        log.info("submodule not found, try clone...")
        log.info("checking git installation...")
        if not prepare_git():
            log.error("git not found, please install git first")
            sys.exit(1)
        subprocess.run(["git", "submodule", "update", "--init", "--recursive"], check=False, cwd=base_dir_path())


def git_tag(path: str) -> str:
    try:
        return (
            subprocess.check_output(
                ["git", "-C", path, "describe", "--tags"],
                stderr=subprocess.DEVNULL,
            )
            .strip()
            .decode("utf-8")
        )
    except Exception as e:
        return "<none>"


def check_dirs(dirs: List):
    for d in dirs:
        target = Path(d)
        if not target.is_absolute():
            target = base_dir_path() / target
        if not target.exists():
            target.mkdir(parents=True, exist_ok=True)


def run(command,
        desc: Optional[str] = None,
        errdesc: Optional[str] = None,
        custom_env: Optional[list] = None,
        live: Optional[bool] = True,
        shell: Optional[bool] = None,
        cwd: Optional[str] = None):

    if shell is None:
        shell = False if sys.platform == "win32" else True

    if desc is not None:
        print(desc)

    if live:
        result = subprocess.run(command, shell=shell, env=os.environ if custom_env is None else custom_env, cwd=cwd)
        if result.returncode != 0:
            raise RuntimeError(f"""{errdesc or 'Error running command'}.
Command: {command}
Error code: {result.returncode}""")

        return ""

    result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                            shell=shell, env=os.environ if custom_env is None else custom_env, cwd=cwd)

    if result.returncode != 0:
        message = f"""{errdesc or 'Error running command'}.
Command: {command}
Error code: {result.returncode}
stdout: {result.stdout.decode(encoding="utf8", errors="ignore") if len(result.stdout) > 0 else '<empty>'}
stderr: {result.stderr.decode(encoding="utf8", errors="ignore") if len(result.stderr) > 0 else '<empty>'}
"""
        raise RuntimeError(message)

    return result.stdout.decode(encoding="utf8", errors="ignore")


def is_installed(package, friendly: str = None):
    requirement_text = package.split("#", 1)[0].strip()
    if requirement_text == "":
        return True

    package_names = friendly.split() if friendly else []
    requirement = None
    try:
        requirement = Requirement(requirement_text)
        package_names = [requirement.name]
    except InvalidRequirement:
        if not package_names:
            package_names = [re.sub(r'\[.*?\]', '', requirement_text).split()[0]]

    installed_version = None
    matched_name = None
    for pkg_name in package_names:
        normalized_names = [
            pkg_name,
            pkg_name.lower(),
            pkg_name.replace("_", "-"),
        ]
        for candidate in normalized_names:
            try:
                installed_version = metadata.version(candidate)
                matched_name = candidate
                break
            except metadata.PackageNotFoundError:
                continue
        if installed_version is not None:
            break

    if installed_version is None:
        log.warning(f'Package version not found: {" ".join(package_names)}')
        return False

    if requirement and requirement.specifier and Version(installed_version) not in requirement.specifier:
        log.info(
            f'Package wrong version: {matched_name or requirement.name} {installed_version} required {requirement.specifier}'
        )
        return False

    return True


def validate_requirements(requirements_file: str):
    with open(requirements_file, 'r', encoding='utf8') as f:
        lines = [
            line.split("#", 1)[0].strip()
            for line in f.readlines()
            if line.split("#", 1)[0].strip() != ''
            and not line.startswith("#")
            and not (line.startswith("-") and not line.startswith("--index-url "))
            and line is not None
            and "# skip_verify" not in line
        ]

        index_url = ""
        for line in lines:
            if line.startswith("--index-url "):
                index_url = line.replace("--index-url ", "")
                continue

            if not is_installed(line):
                if index_url != "":
                    run_pip(f"install {line} --index-url {index_url}", line, live=True)
                else:
                    run_pip(f"install {line}", line, live=True)


def setup_windows_bitsandbytes():
    if sys.platform != "win32":
        return

    runtime_name = infer_runtime_environment_name()
    if is_amd_rocm_runtime(runtime_name) or is_intel_xpu_runtime(runtime_name):
        log.info(f"Skipping Windows bitsandbytes bootstrap for experimental runtime: {runtime_name}")
        return

    min_bnb_version = Version("0.46.0")
    bnb_path = os.path.join(sysconfig.get_paths()["purelib"], "bitsandbytes")

    try:
        installed_version = Version(metadata.version("bitsandbytes"))
    except metadata.PackageNotFoundError:
        installed_version = None

    bnb_cuda_setup = os.path.isdir(bnb_path) and len(
        [f for f in os.listdir(bnb_path) if re.findall(r"libbitsandbytes_cuda.+?\.dll", f)]
    ) != 0

    if installed_version is None or installed_version < min_bnb_version or not bnb_cuda_setup:
        log.error("detected wrong install of bitsandbytes, reinstall it")
        run_pip(f"uninstall bitsandbytes -y", "bitsandbytes", live=True)
        run_pip("install bitsandbytes", "bitsandbytes", live=True)


def setup_onnxruntime(
        onnx_version: Optional[str] = None,
        index_url: Optional[str] = None
):
    if sys.platform == "linux":
        libc_ver = platform.libc_ver()
        if libc_ver[0] == "glibc" and libc_ver[1] <= "2.27":
            onnx_version = "1.16.3"

    onnx_version = os.environ.get("ONNXRUNTIME_VERSION", onnx_version)

    if onnx_version and not is_installed(f"onnxruntime-gpu=={onnx_version}"):
        log.info("uninstalling wrong onnxruntime version")
        run_pip(f"uninstall onnxruntime -y", "onnxruntime", live=True)
        run_pip(f"uninstall onnxruntime-gpu -y", "onnxruntime", live=True)

    if not is_installed(f"onnxruntime-gpu"):
        log.info(f"installing onnxruntime")
        pip_install("onnxruntime", onnx_version, index_url=index_url, live=True)
        pip_install("onnxruntime-gpu", onnx_version, index_url=index_url, live=True)


def run_pip(command, desc=None, live=False):
    normalized = command.lstrip()
    if normalized.startswith("install ") and "--no-warn-script-location" not in normalized:
        command = normalized.replace("install ", "install --no-warn-script-location ", 1)
    return run(f'"{python_bin}" -m pip {command}', desc=f"Installing {desc}", errdesc=f"Couldn't install {desc}", live=live)


def pip_install(package: str, version: Optional[str] = None, index_url: Optional[str] = None, live: bool = True):
    """
    Install a package using pip.
    :param package: The name of the package to install.
    :param version: The version of the package to install (optional).
    :param index_url: The index URL to use for installing the package (optional).
    """
    if version:
        package = f"{package}=={version}"

    command = f"install {package}"

    if index_url:
        command = f"{command} -i {index_url}"

    run_pip(command, desc=f"Installing {package}", live=live)


def check_run(file: str) -> bool:
    target_path = Path(file)
    if not target_path.is_absolute():
        target_path = base_dir_path() / target_path
    result = subprocess.run([python_bin, str(target_path.resolve())], capture_output=True, shell=False, cwd=base_dir_path())
    log.info(result.stdout.decode("utf-8").strip())
    return result.returncode == 0


def network_gfw_test(timeout=3):
    try:
        import requests
        # requests will auto detect system proxies
        response = requests.get("https://www.google.com", timeout=timeout)
        if response.status_code == 200:
            log.info("Network test passed")
            return True
        else:
            log.error(f"Network test failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        log.error(f"Network test failed: {e}")
        return False


def prepare_environment(disable_auto_mirror: bool = True, prepare_onnxruntime: bool = True):
    if sys.platform == "win32":
        # disable triton on windows
        os.environ["XFORMERS_FORCE_DISABLE_TRITON"] = "1"

    os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
    os.environ["BITSANDBYTES_NOWELCOME"] = "1"
    os.environ["PYTHONWARNINGS"] = "ignore::UserWarning"
    os.environ["PIP_DISABLE_PIP_VERSION_CHECK"] = "1"

    if not disable_auto_mirror and not network_gfw_test():
        log.info("use pip & huggingface mirrors")
        os.environ.setdefault("MIKAZUKI_CN_MIRROR", "1")
        os.environ.setdefault("HF_HOME", "huggingface")
        os.environ.setdefault("PIP_FIND_LINKS", "https://mirror.sjtu.edu.cn/pytorch-wheels/torch_stable.html")
        os.environ.setdefault("PIP_INDEX_URL", "https://pypi.tuna.tsinghua.edu.cn/simple")
        os.environ.setdefault("HF_ENDPOINT", "https://hf-mirror.com")
        os.environ.setdefault("GIT_TERMINAL_PROMPT", "false")
        gitconfig_cn = base_dir_path() / "assets" / "gitconfig-cn"
        if gitconfig_cn.exists():
            os.environ.setdefault("GIT_CONFIG_GLOBAL", str(gitconfig_cn))

    if not os.environ.get("PATH"):
        os.environ["PATH"] = os.path.dirname(sys.executable)

    prepare_submodules()

    check_dirs(["config/autosave", "logs"])

    # if not check_run("mikazuki/scripts/torch_check.py"):
    #     sys.exit(1)
    skip_requirements_validation = os.environ.get("MIKAZUKI_SKIP_REQUIREMENTS_VALIDATION", "") == "1"
    if skip_requirements_validation:
        log.info("Launcher already validated the main runtime. Skipping redundant requirements revalidation.")
    else:
        validate_requirements(str(base_dir_path() / "requirements.txt"))
    setup_windows_bitsandbytes()

    if prepare_onnxruntime:
        setup_onnxruntime()


def catch_exception(f):
    def wrapper(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except Exception as e:
            log.error(f"An error occurred: {e}")
    return wrapper


def check_port_avaliable(port: int):
    try:
        s = socket.socket()
        s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        s.bind(("127.0.0.1", port))
        s.close()
        return True
    except:
        return False


def find_avaliable_ports(port_init: int, port_range: int):
    server_ports = range(port_init, port_range)

    for p in server_ports:
        if check_port_avaliable(p):
            return p

    log.error(f"error finding avaliable ports in range: {port_init} -> {port_range}")
    return None
