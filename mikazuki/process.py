
import asyncio
import os
import sys
from pathlib import Path
from typing import Optional

from mikazuki.app.models import APIResponse
from mikazuki.log import log
from mikazuki.tasks import tm
from mikazuki.launch_utils import base_dir_path


def prepare_python_script(script_path, environ=None):
    resolved_path = Path(script_path)
    if not resolved_path.is_absolute():
        resolved_path = base_dir_path() / resolved_path
    resolved_path = resolved_path.resolve()

    customize_env = (environ or os.environ).copy()

    return resolved_path, customize_env


def get_script_runner_path():
    return base_dir_path() / "mikazuki" / "script_runner.py"


def run_train(toml_path: str,
              trainer_file: str = "./scripts/train_network.py",
              gpu_ids: Optional[list] = None,
              cpu_threads: Optional[int] = 2):
    log.info(f"Training started with config file / 训练开始，使用配置文件: {toml_path}")
    trainer_path, customize_env = prepare_python_script(trainer_file)
    script_runner = get_script_runner_path()
    args = [
        sys.executable, "-m", "accelerate.commands.launch",  # use -m to avoid python script executable error
        "--num_cpu_threads_per_process", str(cpu_threads),  # cpu threads
        "--quiet",  # silence accelerate error message
        str(script_runner),
        str(trainer_path),
        "--config_file", toml_path,
    ]

    customize_env["ACCELERATE_DISABLE_RICH"] = "1"
    customize_env["PYTHONUNBUFFERED"] = "1"
    customize_env["PYTHONWARNINGS"] = "ignore::FutureWarning,ignore::UserWarning"

    if gpu_ids:
        customize_env["CUDA_VISIBLE_DEVICES"] = ",".join(gpu_ids)
        log.info(f"Using GPU(s) / 使用 GPU: {gpu_ids}")

        if len(gpu_ids) > 1:
            args[3:3] = ["--multi_gpu", "--num_processes", str(len(gpu_ids))]
            if sys.platform == "win32":
                customize_env["USE_LIBUV"] = "0"
                args[3:3] = ["--rdzv_backend", "c10d"]

    if not (task := tm.create_task(args, customize_env)):
        return APIResponse(status="error", message="Failed to create task / 无法创建训练任务")

    def _run():
        try:
            task.execute()
            result = task.communicate()
            if result.returncode != 0:
                log.error(f"Training failed / 训练失败")
            else:
                log.info(f"Training finished / 训练完成")
        except Exception as e:
            log.error(f"An error occurred when training / 训练出现致命错误: {e}")

    coro = asyncio.to_thread(_run)
    asyncio.create_task(coro)

    return APIResponse(
        status="success",
        message=f"Training started / 训练开始 ID: {task.task_id}",
        data={"task_id": task.task_id},
    )
