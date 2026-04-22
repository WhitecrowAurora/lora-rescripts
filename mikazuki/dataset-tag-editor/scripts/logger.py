import logging
import sys


class _MicrosecondFormatter(logging.Formatter):
    default_msec_format = "%s-%06d"

    def formatTime(self, record, datefmt=None):
        if datefmt:
            from datetime import datetime

            dt = datetime.fromtimestamp(record.created)
            return dt.strftime(datefmt)
        return super().formatTime(record, datefmt)


_logger = logging.getLogger("dataset-tag-editor")
_logger.setLevel(logging.INFO)
_logger.propagate = False

if not _logger.handlers:
    try:
        from rich.console import Console
        from rich.logging import RichHandler

        _console = Console(
            file=sys.stdout,
            log_time=True,
            log_time_format="%H:%M:%S-%f",
        )
        _handler = RichHandler(
            console=_console,
            show_time=True,
            omit_repeated_times=False,
            show_level=True,
            show_path=False,
            markup=False,
            rich_tracebacks=False,
            log_time_format="%H:%M:%S-%f",
            level=logging.INFO,
        )
    except ModuleNotFoundError:
        _handler = logging.StreamHandler(sys.stdout)
        _handler.setFormatter(_MicrosecondFormatter("%(asctime)s %(levelname)-8s %(message)s", "%H:%M:%S-%f"))
    _logger.addHandler(_handler)


def info(content):
    _logger.info(str(content))


def write(content):
    info(content)


def profile(content):
    _logger.info("PROF %s", str(content))


def warn(content):
    _logger.warning(str(content))


def error(content):
    _logger.error(str(content))
