import os
import subprocess
import threading
import uuid
from enum import Enum
from pathlib import Path
from subprocess import PIPE, CompletedProcess, TimeoutExpired
from typing import Dict, List

import psutil

from mikazuki.launch_utils import base_dir_path
from mikazuki.log import log


def kill_proc_tree(pid, including_parent=True):
    parent = psutil.Process(pid)
    children = parent.children(recursive=True)
    for child in children:
        child.kill()
    psutil.wait_procs(children, timeout=5)
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
        self.output_lines: list[str] = []
        self.live_line = ""
        self.max_output_lines = 5000
        self.command = command
        self.status = TaskStatus.CREATED
        self.environ = environ or os.environ
        self.cwd = str(Path(cwd).resolve()) if cwd else str(base_dir_path())
        self._output_thread = None
        self.process = None
        self._console_live_width = 0

    def _append_output_line(self, line: str):
        with self.lock:
            self.output_lines.append(line)
            if len(self.output_lines) > self.max_output_lines:
                self.output_lines = self.output_lines[-self.max_output_lines :]

    def _set_live_line(self, line: str):
        with self.lock:
            self.live_line = line

    def _get_live_line(self):
        with self.lock:
            return self.live_line

    def _clear_live_line(self):
        self._set_live_line("")

    def get_output_snapshot(self, tail: int | None = None):
        with self.lock:
            total = len(self.output_lines)
            lines = list(self.output_lines if tail is None else self.output_lines[-tail:])
            live_line = self.live_line
        return lines, total, live_line

    def _emit_console_output(self, line: str, transient: bool = False):
        if not line:
            return

        prefix = "\r" if transient or self._console_live_width else ""
        padding = ""
        if self._console_live_width > len(line):
            padding = " " * (self._console_live_width - len(line))

        if transient:
            print(prefix + line + padding, end="", flush=True)
            self._console_live_width = len(line)
            return

        print(prefix + line + padding, flush=True)
        self._console_live_width = 0

    def _consume_output_record(self, raw_line: bytes, sep: bytes):
        line = self._decode_output(raw_line).rstrip()
        if not line:
            if sep == b"\n":
                self._clear_live_line()
            return

        if sep == b"\n":
            self._emit_console_output(line, transient=False)
            self._append_output_line(line)
            self._clear_live_line()
            return

        if line == self._get_live_line():
            return

        self._emit_console_output(line, transient=True)
        self._set_live_line(line)

    def _sync_live_tail(self, buf: bytes):
        if not buf:
            return

        line = self._decode_output(buf).rstrip()
        if not line or line == self._get_live_line():
            return

        self._emit_console_output(line, transient=True)
        self._set_live_line(line)

    def _process_output_buffer(self, buf: bytes, eof: bool = False) -> bytes:
        while True:
            cr_idx = buf.find(b"\r")
            lf_idx = buf.find(b"\n")
            candidates = [idx for idx in (cr_idx, lf_idx) if idx != -1]
            if not candidates:
                break

            idx = min(candidates)
            sep = buf[idx : idx + 1]
            sep_len = 1
            if sep == b"\r":
                if idx + 1 >= len(buf):
                    if not eof:
                        break
                elif buf[idx + 1 : idx + 2] == b"\n":
                    sep = b"\n"
                    sep_len = 2

            raw_line = buf[:idx]
            buf = buf[idx + sep_len :]
            self._consume_output_record(raw_line, sep)

        return buf

    def _decode_output(self, raw: bytes) -> str:
        try:
            return raw.decode("utf-8")
        except UnicodeDecodeError:
            return raw.decode("gbk", errors="replace")

    def _read_output(self):
        if self.process is None or self.process.stdout is None:
            return

        fd = self.process.stdout.fileno()
        buf = b""
        while True:
            try:
                chunk = os.read(fd, 8192)
            except OSError:
                break
            if not chunk:
                break
            buf += chunk
            buf = self._process_output_buffer(buf)
            self._sync_live_tail(buf)

        buf = self._process_output_buffer(buf, eof=True)
        if buf:
            line = self._decode_output(buf).rstrip()
            if line:
                self._emit_console_output(line, transient=False)
                self._append_output_line(line)
                self._clear_live_line()

        lines, _, live_line = self.get_output_snapshot(tail=1)
        last_output_line = lines[-1] if lines else ""
        if live_line:
            if live_line != last_output_line:
                self._emit_console_output(live_line, transient=False)
                self._append_output_line(live_line)
            elif self._console_live_width:
                print("", flush=True)
                self._console_live_width = 0
            self._clear_live_line()

    def _join_output_thread(self):
        if self._output_thread is not None:
            self._output_thread.join(timeout=2)
            self._output_thread = None

    def communicate(self, input=None, timeout=None):
        del input
        if self.process is None:
            raise RuntimeError("Task process has not been started.")

        try:
            self.process.wait(timeout=timeout)
        except TimeoutExpired as exc:
            try:
                kill_proc_tree(self.process.pid, True)
            except Exception:
                self.process.kill()
            self._join_output_thread()
            raise exc
        except Exception:
            try:
                self.process.kill()
            except Exception:
                pass
            self._join_output_thread()
            raise

        self._join_output_thread()
        retcode = self.process.poll()
        if self.status == TaskStatus.RUNNING:
            self.status = TaskStatus.FINISHED
        output_lines, _, _ = self.get_output_snapshot()
        stdout = "\n".join(output_lines)
        return CompletedProcess(self.process.args, retcode, stdout, None)

    def wait(self):
        if self.process is None:
            return
        self.process.wait()
        self._join_output_thread()
        if self.status == TaskStatus.RUNNING:
            self.status = TaskStatus.FINISHED

    def execute(self):
        self.status = TaskStatus.RUNNING
        self.process = subprocess.Popen(
            self.command,
            env=self.environ,
            cwd=self.cwd,
            stdout=PIPE,
            stderr=subprocess.STDOUT,
        )
        self._output_thread = threading.Thread(target=self._read_output, daemon=True)
        self._output_thread.start()

    def terminate(self):
        if self.process is None:
            self.status = TaskStatus.TERMINATED
            return
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
        self.tasks: Dict[str, Task] = {}

    def create_task(self, command: List[str], environ, cwd=None):
        running_tasks = [t for _, t in self.tasks.items() if t.status == TaskStatus.RUNNING]
        if len(running_tasks) >= self.max_concurrent:
            log.error(
                "Unable to create a task because there are already "
                f"{len(running_tasks)} tasks running, reaching the maximum concurrent limit. / "
                f"无法创建任务，因为已经有 {len(running_tasks)} 个任务正在运行，已达到最大并发限制。"
            )
            return None
        task_id = str(uuid.uuid4())
        task = Task(task_id=task_id, command=command, environ=environ, cwd=cwd)
        self.tasks[task_id] = task
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
                "returncode": task.process.returncode
                if hasattr(task, "process") and task.process and task.process.poll() is not None
                else None,
            }
            for task in self.tasks.values()
        ]


tm = TaskManager()
