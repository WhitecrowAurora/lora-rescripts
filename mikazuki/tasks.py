import subprocess
import sys
import os
import threading
import uuid
from pathlib import Path
from enum import Enum
from typing import Dict, List
from subprocess import Popen, PIPE
import psutil

from mikazuki.launch_utils import base_dir_path
from mikazuki.log import log




def kill_proc_tree(pid, including_parent=True):
    parent = psutil.Process(pid)
    children = parent.children(recursive=True)
    for child in children:
        child.kill()
    gone, still_alive = psutil.wait_procs(children, timeout=5)
    if including_parent:
        parent.kill()
        parent.wait(5)


class TaskStatus(Enum):
    CREATED = 0
    RUNNING = 1
    FINISHED = 2
    TERMINATED = 3


class Task:
    def __init__(self, task_id, command, environ=None, cwd=None):
        self.task_id = task_id
        self.lock = threading.Lock()
        self.output_lines = []
        self.max_output_lines = 5000
        self.command = command
        self.status = TaskStatus.CREATED
        self.environ = environ or os.environ
        self.cwd = str(Path(cwd).resolve()) if cwd else str(base_dir_path())

    def wait(self):
        self.process.wait()
        self.status = TaskStatus.FINISHED

    def execute(self):
        self.status = TaskStatus.RUNNING
        self.process = subprocess.Popen(
            self.command, env=self.environ, cwd=self.cwd,
            stdout=PIPE, stderr=subprocess.STDOUT,
        )
        reader_thread = threading.Thread(target=self._read_output, daemon=True)
        reader_thread.start()

    def _read_output(self):
        fd = self.process.stdout.fileno()
        buf = b''

        def _decode(raw):
            try:
                return raw.decode('utf-8')
            except UnicodeDecodeError:
                pass
            return raw.decode('gbk', errors='replace')

        while True:
            try:
                chunk = os.read(fd, 8192)
            except OSError:
                break
            if not chunk:
                break
            buf += chunk
            # Process all complete lines (delimited by \n)
            while b'\n' in buf:
                idx = buf.find(b'\n')
                raw_line = buf[:idx]
                buf = buf[idx + 1:]
                # Strip trailing \r (handles \r\n on Windows)
                if raw_line.endswith(b'\r'):
                    raw_line = raw_line[:-1]
                # For bare \r within a line (progress bars), keep only the last segment
                if b'\r' in raw_line:
                    raw_line = raw_line.rsplit(b'\r', 1)[-1]
                line = _decode(raw_line).rstrip()
                if line:  # skip blank lines from rich padding
                    print(line, flush=True)
                    self.output_lines.append(line)
            if len(self.output_lines) > self.max_output_lines:
                self.output_lines = self.output_lines[-self.max_output_lines:]
        # flush remaining
        if buf:
            if b'\r' in buf:
                buf = buf.rsplit(b'\r', 1)[-1]
            line = _decode(buf)
            print(line, end='', flush=True)
            self.output_lines.append(line)


    def terminate(self):
        try:
            kill_proc_tree(self.process.pid, True)
        except Exception as e:
            log.error(f"Error when killing process: {e}")
            return
        finally:
            self.status = TaskStatus.TERMINATED


class TaskManager:
    def __init__(self, max_concurrent=1) -> None:
        self.max_concurrent = max_concurrent
        self.tasks: Dict[Task] = {}

    def create_task(self, command: List[str], environ, cwd=None):
        running_tasks = [t for _, t in self.tasks.items() if t.status == TaskStatus.RUNNING]
        if len(running_tasks) >= self.max_concurrent:
            log.error(
                f"Unable to create a task because there are already {len(running_tasks)} tasks running, reaching the maximum concurrent limit. / \u65e0\u6cd5\u521b\u5efa\u4efb\u52a1\uff0c\u56e0\u4e3a\u5df2\u7ecf\u6709 {len(running_tasks)} \u4e2a\u4efb\u52a1\u6b63\u5728\u8fd0\u884c\uff0c\u5df2\u8fbe\u5230\u6700\u5927\u5e76\u53d1\u9650\u5236\u3002")
            return None
        task_id = str(uuid.uuid4())
        task = Task(task_id=task_id, command=command, environ=environ, cwd=cwd)
        self.tasks[task_id] = task
        # task.execute() # breaking change
        log.info(f"Task {task_id} created")
        return task

    def add_task(self, task_id: str, task: Task):
        self.tasks[task_id] = task

    def terminate_task(self, task_id: str):
        if task_id in self.tasks:
            task = self.tasks[task_id]
            task.terminate()

    def wait_for_process(self, task_id: str):
        if task_id in self.tasks:
            task: Task = self.tasks[task_id]
            task.wait()

    def dump(self) -> List[Dict]:
        return [
            {
                "id": task.task_id,
                "status": task.status.name,
                "returncode": task.process.returncode if hasattr(task, 'process') and task.process and task.process.poll() is not None else None,
            }
            for task in self.tasks.values()
        ]


tm = TaskManager()
