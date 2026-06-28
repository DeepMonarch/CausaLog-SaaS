# Utility — implemented in Phase 1
from datetime import datetime, timezone


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def truncate(text: str, max_length: int = 200) -> str:
    return text if len(text) <= max_length else text[:max_length] + "…"


def safe_divide(numerator: float, denominator: float, default: float = 0.0) -> float:
    return numerator / denominator if denominator != 0 else default