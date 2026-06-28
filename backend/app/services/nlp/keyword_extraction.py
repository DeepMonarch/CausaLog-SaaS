import re
from collections import Counter
from typing import List, Dict, Any

from app.utils.logger import get_logger

logger = get_logger(__name__)

# Domain vocabulary — terms meaningful for RCA
DOMAIN_TERMS = {
    # Connectivity
    "timeout", "connection", "refused", "reset", "unreachable", "disconnect",
    "socket", "network", "latency", "retry", "reconnect",
    # Database
    "database", "db", "query", "deadlock", "transaction", "sql", "postgres",
    "mysql", "mongo", "redis", "pool", "migration",
    # Auth
    "authentication", "authorization", "token", "jwt", "unauthorized",
    "forbidden", "invalid", "expired", "permission", "credential",
    # Memory / Resources
    "memory", "oom", "heap", "leak", "cpu", "disk", "storage", "quota",
    "overflow", "limit", "throttle", "rate",
    # Services
    "service", "api", "gateway", "proxy", "upstream", "downstream",
    "microservice", "container", "pod", "node", "cluster",
    # Errors
    "exception", "error", "failure", "crash", "panic", "fatal",
    "traceback", "stacktrace", "null", "undefined", "404", "500", "503",
}

_TOKEN_RE = re.compile(r"[a-zA-Z][a-zA-Z0-9_]{2,}")


def extract_keywords(records: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Extract domain-relevant keywords from a list of preprocessed log records.
    Returns keyword frequencies and per-record keyword lists.
    """
    global_counter: Counter = Counter()
    record_keywords: List[List[str]] = []

    for rec in records:
        message = (rec.get("message") or "").lower()
        tokens = _TOKEN_RE.findall(message)
        matched = [t for t in tokens if t in DOMAIN_TERMS]
        # Also catch multi-word patterns
        if "connection refused" in message:
            matched.append("connection_refused")
        if "out of memory" in message or "oom" in message:
            matched.append("oom")
        if "timed out" in message or "timeout" in message:
            matched.append("timeout")

        unique = list(set(matched))
        record_keywords.append(unique)
        global_counter.update(unique)

    top_keywords = [kw for kw, _ in global_counter.most_common(20)]
    logger.info(f"Keyword extraction: {len(global_counter)} unique terms found")

    return {
        "top_keywords": top_keywords,
        "keyword_frequencies": dict(global_counter.most_common(50)),
        "record_keywords": record_keywords,
    }