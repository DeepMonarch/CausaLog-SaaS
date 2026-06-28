from dataclasses import dataclass, asdict
from typing import List, Dict, Any
from app.utils.file_parser import parse_log_lines, LogRecord
from app.utils.logger import get_logger

logger = get_logger(__name__)


@dataclass
class PreprocessingResult:
    total_lines: int
    parsed_records: int
    skipped_lines: int
    level_counts: Dict[str, int]
    service_counts: Dict[str, int]
    records: List[Dict[str, Any]]  # serialisable form of LogRecord list

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


def run(raw_content: str) -> PreprocessingResult:
    """
    Parse raw log text into structured records.
    Returns a PreprocessingResult with counts and the cleaned record list.
    """
    all_lines = [l for l in raw_content.splitlines() if l.strip()]
    records: List[LogRecord] = parse_log_lines(raw_content)

    level_counts: Dict[str, int] = {}
    service_counts: Dict[str, int] = {}
    serialised: List[Dict[str, Any]] = []

    for r in records:
        level_counts[r.level] = level_counts.get(r.level, 0) + 1
        service_counts[r.service] = service_counts.get(r.service, 0) + 1
        serialised.append({
            "line_number": r.line_number,
            "timestamp": r.timestamp.isoformat() if r.timestamp else None,
            "level": r.level,
            "service": r.service,
            "message": r.message,
            "raw": r.raw,
        })

    skipped = len(all_lines) - len(records)
    logger.info(f"Preprocessing: {len(records)} records parsed, {skipped} skipped")

    return PreprocessingResult(
        total_lines=len(all_lines),
        parsed_records=len(records),
        skipped_lines=skipped,
        level_counts=level_counts,
        service_counts=service_counts,
        records=serialised,
    )