# Utility — implemented in Phase 1
import re
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional


@dataclass
class LogRecord:
    raw: str
    timestamp: Optional[datetime] = None
    level: str = "UNKNOWN"
    service: str = "unknown"
    message: str = ""
    line_number: int = 0


# Common log format patterns
_PATTERNS = [
    # ISO timestamp + level: 2024-01-15T14:02:15.123Z ERROR api-gw connection timeout
    re.compile(
        r"(?P<ts>\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)\s+"
        r"(?P<level>DEBUG|INFO|WARN(?:ING)?|ERROR|CRITICAL|FATAL)\s+"
        r"(?P<service>\S+)\s+(?P<message>.+)",
        re.IGNORECASE,
    ),
    # Syslog: Jan 15 14:02:15 hostname service[pid]: message
    re.compile(
        r"(?P<ts>[A-Za-z]{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})\s+\S+\s+"
        r"(?P<service>\S+?)(?:\[\d+\])?:\s+(?P<message>.+)"
    ),
    # level first: ERROR 2024-01-15 14:02:15 message
    re.compile(
        r"(?P<level>DEBUG|INFO|WARN(?:ING)?|ERROR|CRITICAL|FATAL)\s+"
        r"(?P<ts>\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\s+(?P<message>.+)",
        re.IGNORECASE,
    ),
    # Bare: just level + message
    re.compile(
        r"(?P<level>DEBUG|INFO|WARN(?:ING)?|ERROR|CRITICAL|FATAL)[:\s]+(?P<message>.+)",
        re.IGNORECASE,
    ),
]

_TS_FORMATS = [
    "%Y-%m-%dT%H:%M:%S.%fZ",
    "%Y-%m-%dT%H:%M:%SZ",
    "%Y-%m-%dT%H:%M:%S",
    "%Y-%m-%d %H:%M:%S",
    "%b %d %H:%M:%S",
]


def _parse_timestamp(ts_str: str) -> Optional[datetime]:
    ts_str = ts_str.strip().rstrip("Z").replace("T", " ")
    for fmt in _TS_FORMATS:
        try:
            return datetime.strptime(ts_str, fmt)
        except ValueError:
            continue
    return None


def _normalize_level(raw: str) -> str:
    mapping = {"WARNING": "WARN", "FATAL": "ERROR", "CRITICAL": "ERROR"}
    upper = raw.upper()
    return mapping.get(upper, upper)


def parse_log_lines(content: str) -> list[LogRecord]:
    records: list[LogRecord] = []
    for i, line in enumerate(content.splitlines(), start=1):
        line = line.strip()
        if not line:
            continue
        record = LogRecord(raw=line, line_number=i)
        for pattern in _PATTERNS:
            m = pattern.match(line)
            if m:
                groups = m.groupdict()
                if "ts" in groups:
                    record.timestamp = _parse_timestamp(groups["ts"])
                if "level" in groups:
                    record.level = _normalize_level(groups["level"])
                if "service" in groups:
                    record.service = groups.get("service", "unknown") or "unknown"
                record.message = groups.get("message", line)
                break
        else:
            record.message = line
        records.append(record)
    return records