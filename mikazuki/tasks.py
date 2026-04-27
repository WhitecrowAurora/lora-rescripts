import os
import signal
import subprocess
import sys
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
    if os.name == "nt" and including_parent:
        try:
            completed = subprocess.run(
                ["taskkill", "/PID", str(pid), "/T", "/F"],
                stdout=PIPE,
                stderr=PIPE,
                timeout=15,
                check=False,
            )
            if completed.returncode == 0:
                return
            stderr = completed.stderr.decode("utf-8", errors="ignore").strip()
            if stderr:
                log.warning(f"taskkill /T /F failed for PID {pid}, falling back to psutil kill tree: {stderr}")
        except Exception as exc:
            log.warning(f"taskkill /T /F failed for PID {pid}, falling back to psutil kill tree: {exc}")

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
        self._state_lock = threading.Lock()
        self.output_lines: list[str] = []
        self.output_total = 0
        self.max_output_lines = 5000
        self.command = command
        self.status = TaskStatus.CREATED
        self.environ = environ or os.environ
        self.cwd = str(Path(cwd).resolve()) if cwd else str(base_dir_path())
        self._output_thread = None
        self.process = None
        self._last_output_was_progress = False
        self._console_progress_active = False
        self._console_progress_width = 0
        self._last_console_progress_line = ""
        self._termination_requested = False
        self._terminate_thread = None

    def _append_output_line(self, line: str, *, progress: bool = False):
        with self.lock:
            # tqdm and similar tools redraw the same console line via carriage returns.
            # Keep the latest progress snapshot visible without appending thousands of lines.
            if progress and self._last_output_was_progress and self.output_lines:
                self.output_lines[-1] = line
            elif not progress and self._last_output_was_progress and self.output_lines and self.output_lines[-1] == line:
                pass
            else:
                self.output_lines.append(line)
            if len(self.output_lines) > self.max_output_lines:
                self.output_lines = self.output_lines[-self.max_output_lines :]
            self.output_total += 1
            self._last_output_was_progress = progress

    def _decode_output(self, raw: bytes) -> str:
        try:
            return raw.decode("utf-8")
        except UnicodeDecodeError:
            return raw.decode("gbk", errors="replace")

    def _emit_console_line(self, line: str, *, progress: bool = False):
        stdout = sys.stdout
        is_tty = bool(stdout and hasattr(stdout, "isatty") and stdout.isatty())

        if progress:
            if is_tty:
                clear_padding = ""
                if self._console_progress_width > len(line):
                    clear_padding = " " * (self._console_progress_width - len(line))
                stdout.write("\r" + line + clear_padding)
                stdout.flush()
                self._console_progress_width = max(self._console_progress_width, len(line))
            else:
                if line != self._last_console_progress_line:
                    print(line, flush=True)
                    self._last_console_progress_line = line
            self._console_progress_active = True
            return

        if self._console_progress_active and is_tty:
            stdout.write("\n")
            stdout.flush()

        print(line, flush=True)
        self._console_progress_active = False
        self._console_progress_width = 0
        self._last_console_progress_line = ""

    def _finalize_console_progress(self):
        stdout = sys.stdout
        is_tty = bool(stdout and hasattr(stdout, "isatty") and stdout.isatty())
        if self._console_progress_active and is_tty:
            stdout.write("\n")
            stdout.flush()
        self._console_progress_active = False
        self._console_progress_width = 0
        self._last_console_progress_line = ""

    def _consume_output_buffer(self, buf: bytes) -> bytes:
        while True:
            cr_idx = buf.find(b"\r")
            lf_idx = buf.find(b"\n")
            if cr_idx == -1 and lf_idx == -1:
                return buf

            if cr_idx == -1:
                idx = lf_idx
            elif lf_idx == -1:
                idx = cr_idx
            else:
                idx = min(cr_idx, lf_idx)

            is_progress = buf[idx : idx + 1] == b"\r"
            delimiter_length = 1
            if is_progress and idx + 1 < len(buf) and buf[idx + 1 : idx + 2] == b"\n":
                is_progress = False
                delimiter_length = 2

            raw_line = buf[:idx]
            buf = buf[idx + delimiter_length :]

            line = self._decode_output(raw_line).rstrip()
            if not line:
                continue
            self._emit_console_line(line, progress=is_progress)
            self._append_output_line(line, progress=is_progress)

    def get_output_snapshot(self, tail: int | None = None) -> tuple[list[str], int]:
        with self.lock:
            if tail is None:
                lines = list(self.output_lines)
            else:
                lines = list(self.output_lines[-tail:])
            return lines, self.output_total

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
            buf = self._consume_output_buffer(buf)

        if buf:
            line = self._decode_output(buf).rstrip()
            if line:
                self._emit_console_line(line)
                self._append_output_line(line)
        self._finalize_console_progress()

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
        stdout_lines, _ = self.get_output_snapshot()
        stdout = "\n".join(stdout_lines)
        return CompletedProcess(self.process.args, retcode, stdout, None)

    def wait(self):
        if self.process is None:
            return
        self.process.wait()
        self._join_output_thread()
        if self.status == TaskStatus.RUNNING:
            self.status = TaskStatus.FINISHED

    def is_termination_requested(self) -> bool:
        with self._state_lock:
            return bool(self._termination_requested)

    def is_termination_in_progress(self) -> bool:
        with self._state_lock:
            thread = self._terminate_thread
            return bool(self._termination_requested and thread is not None and thread.is_alive())

    def request_terminate(self) -> str:
        process = self.process
        if process is None:
            self.status = TaskStatus.TERMINATED
            return "already-stopped"
        if process.poll() is not None:
            self._join_output_thread()
            if self.status == TaskStatus.RUNNING:
                self.status = TaskStatus.FINISHED
            return "already-stopped"

        with self._state_lock:
            if self._terminate_thread is not None and self._terminate_thread.is_alive():
                return "already-requested"
            self._termination_requested = True
            terminate_thread = threading.Thread(
                target=self.terminate,
                name=f"task-terminate-{self.task_id}",
                daemon=True,
            )
            self._terminate_thread = terminate_thread

        self._append_output_line("[task-stop] Stop requested; attempting graceful shutdown.")
        terminate_thread.start()
        return "requested"

    def execute(self):
        popen_kwargs = {
            "args": self.command,
            "env": self.environ,
            "cwd": self.cwd,
            "stdout": PIPE,
            "stderr": subprocess.STDOUT,
        }
        if os.name == "nt":
            create_new_process_group = getattr(subprocess, "CREATE_NEW_PROCESS_GROUP", 0)
            if create_new_process_group:
                popen_kwargs["creationflags"] = create_new_process_group
        else:
            popen_kwargs["start_new_session"] = True
        try:
            self.process = subprocess.Popen(**popen_kwargs)
        except Exception as exc:
            self.status = TaskStatus.TERMINATED
            self._append_output_line(f"[task-startup-error] {exc}")
            raise
        self.status = TaskStatus.RUNNING
        self._output_thread = threading.Thread(target=self._read_output, daemon=True)
        self._output_thread.start()

    def _try_graceful_terminate(self, timeout: float = 120.0) -> bool:
        if self.process is None:
            return True
        if self.process.poll() is not None:
            self._join_output_thread()
            return True
        if os.name == "nt":
            ctrl_break_event = getattr(signal, "CTRL_BREAK_EVENT", None)
            if ctrl_break_event is None:
                return False
            try:
                self.process.send_signal(ctrl_break_event)
            except Exception as exc:
                log.warning(f"Graceful CTRL_BREAK termination failed, falling back to force kill: {exc}")
                return False
            try:
                self.process.wait(timeout=timeout)
                self._join_output_thread()
                return True
            except TimeoutExpired:
                log.warning(
                    f"Graceful task termination timed out after {timeout:.0f}s for task {self.task_id}; falling back to force kill."
                )
                return False

        try:
            pgid = os.getpgid(self.process.pid)
            os.killpg(pgid, signal.SIGINT)
        except Exception as exc:
            log.warning(f"Graceful SIGINT termination failed, falling back to force kill: {exc}")
            return False

        try:
            self.process.wait(timeout=timeout)
            self._join_output_thread()
            return True
        except TimeoutExpired:
            log.warning(
                f"Graceful task termination timed out after {timeout:.0f}s for task {self.task_id}; falling back to force kill."
            )
            return False

    def terminate(self):
        requested_stop = self.is_termination_requested()
        if self.process is None:
            self.status = TaskStatus.TERMINATED
            return
        try:
            if requested_stop:
                self._append_output_line("[task-stop] Sending interrupt signal to the training process.")
            if self._try_graceful_terminate():
                if requested_stop:
                    self._append_output_line("[task-stop] Task stopped gracefully.")
                return
            if requested_stop:
                self._append_output_line("[task-stop] Graceful shutdown timed out; forcing process tree termination.")
            kill_proc_tree(self.process.pid, True)
        except Exception as e:
            self._append_output_line(f"[task-stop-error] {e}")
            log.error(f"Error when killing process: {e}")
            return
        finally:
            with self._state_lock:
                self._termination_requested = False
                if self._terminate_thread is not None and self._terminate_thread is threading.current_thread():
                    self._terminate_thread = None
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

    def request_terminate_task(self, task_id: str) -> str:
        task = self.tasks.get(task_id)
        if task is None:
            return "not-found"
        return task.request_terminate()

    def wait_for_process(self, task_id: str):
        if task_id in self.tasks:
            task: Task = self.tasks[task_id]
            task.wait()

    def dump(self) -> List[Dict]:
        return [
            {
                "id": task.task_id,
                "status": task.status.name,
                "termination_requested": task.is_termination_requested(),
                "termination_in_progress": task.is_termination_in_progress(),
                "returncode": task.process.returncode
                if hasattr(task, "process") and task.process and task.process.poll() is not None
                else None,
            }
            for task in self.tasks.values()
        ]


tm = TaskManager()
