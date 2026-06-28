from dataclasses import dataclass
from typing import List, Dict, Any, Optional
from app.utils.logger import get_logger

logger = get_logger(__name__)


@dataclass
class RuleMatch:
    rule_id: str
    root_cause: str
    confidence: float
    severity: str
    explanation: str
    suggested_fixes: List[str]


class Rule:
    rule_id: str
    root_cause: str
    confidence: float
    severity: str
    explanation: str
    suggested_fixes: List[str]

    def match(self, evidence: Dict[str, Any]) -> bool:
        raise NotImplementedError

    def to_match(self) -> RuleMatch:
        return RuleMatch(
            rule_id=self.rule_id,
            root_cause=self.root_cause,
            confidence=self.confidence,
            severity=self.severity,
            explanation=self.explanation,
            suggested_fixes=self.suggested_fixes,
        )


class DatabaseConnectionRule(Rule):
    rule_id = "db_connection_failure"
    root_cause = "Database connection failure"
    confidence = 0.90
    severity = "HIGH"
    explanation = (
        "Multiple log records contain database connectivity keywords (timeout, connection, pool) "
        "combined with ERROR-level anomalies. This pattern strongly indicates the database "
        "is unreachable or connection pool is exhausted."
    )
    suggested_fixes = [
        "Check database host reachability: ping or telnet to the DB host on its port",
        "Inspect connection pool settings — increase pool_size or reduce max_overflow",
        "Review database server logs for out-of-connections or OOM errors",
        "Check firewall/security group rules between the app and database",
        "Verify DATABASE_URL credentials and host are correct in environment config",
    ]

    def match(self, e: Dict[str, Any]) -> bool:
        kw = e.get("top_keywords", [])
        return (
            ("database" in kw or "db" in kw or "sql" in kw or "postgres" in kw or "mysql" in kw)
            and ("timeout" in kw or "connection" in kw or "refused" in kw or "pool" in kw)
            and e.get("error_rate", 0) > 0.1
        )


class AuthFailureRule(Rule):
    rule_id = "auth_failure_spike"
    root_cause = "Authentication / authorisation failure spike"
    confidence = 0.85
    severity = "HIGH"
    explanation = (
        "A high concentration of authentication-related keywords (token, unauthorized, "
        "invalid, expired) with elevated error rates suggests a widespread auth failure — "
        "likely an expired secret, misconfigured token validation, or credential rotation."
    )
    suggested_fixes = [
        "Check if JWT_SECRET or API keys were recently rotated without redeploying services",
        "Verify token expiry settings — tokens may be expiring too quickly",
        "Look for a spike in 401/403 HTTP responses in your access logs",
        "Confirm auth service is healthy and reachable from dependent services",
        "Check for clock skew between services (JWT validation is time-sensitive)",
    ]

    def match(self, e: Dict[str, Any]) -> bool:
        kw = e.get("top_keywords", [])
        auth_kw = {"authentication", "authorization", "token", "jwt", "unauthorized",
                   "forbidden", "invalid", "expired", "credential"}
        hits = sum(1 for k in kw if k in auth_kw)
        return hits >= 2 and e.get("error_rate", 0) > 0.05


class MemoryExhaustionRule(Rule):
    rule_id = "memory_exhaustion"
    root_cause = "Memory exhaustion / OOM"
    confidence = 0.88
    severity = "HIGH"
    explanation = (
        "Keywords related to memory pressure (memory, oom, heap, leak, overflow) are present "
        "with anomalous behaviour. This pattern indicates the process is running out of heap "
        "memory, potentially causing slowdowns, crashes, or restarts."
    )
    suggested_fixes = [
        "Increase container/pod memory limits if running in Kubernetes or Docker",
        "Profile heap usage — look for objects that are not being garbage collected",
        "Check for memory leaks: objects created in loops without being freed",
        "Review recent code changes that process large datasets in memory",
        "Enable GC logging and inspect GC pause frequency and duration",
    ]

    def match(self, e: Dict[str, Any]) -> bool:
        kw = e.get("top_keywords", [])
        mem_kw = {"memory", "oom", "heap", "leak", "overflow"}
        return any(k in mem_kw for k in kw) and e.get("anomaly_detected", False)


class NetworkTimeoutRule(Rule):
    rule_id = "network_timeout"
    root_cause = "Network / upstream service timeout"
    confidence = 0.80
    severity = "MEDIUM"
    explanation = (
        "Timeout and connection-related keywords without specific database indicators "
        "suggest upstream service or network timeouts. Services are failing to reach "
        "dependencies within their configured timeout window."
    )
    suggested_fixes = [
        "Identify which upstream service is timing out from the log service field",
        "Check network latency between services — run traceroute/mtr",
        "Review and increase timeout configuration if the upstream is legitimately slow",
        "Implement circuit breakers to fail fast and prevent cascading timeouts",
        "Check upstream service health dashboards or status pages",
    ]

    def match(self, e: Dict[str, Any]) -> bool:
        kw = e.get("top_keywords", [])
        has_timeout = "timeout" in kw or "connection" in kw or "latency" in kw
        no_db = not any(k in kw for k in ["database", "db", "sql", "postgres", "mysql"])
        return has_timeout and no_db and e.get("error_rate", 0) > 0.05


class HighErrorRateRule(Rule):
    rule_id = "high_error_rate"
    root_cause = "Elevated error rate — cause undetermined"
    confidence = 0.60
    severity = "MEDIUM"
    explanation = (
        "The log file contains a high proportion of ERROR-level entries but no single "
        "dominant keyword pattern was matched. This may indicate a multi-cause failure "
        "or a new error type not yet covered by inference rules."
    )
    suggested_fixes = [
        "Manually inspect the anomalous log entries highlighted in the cluster view",
        "Search for recent deployments, config changes, or dependency version bumps",
        "Check downstream dependencies one by one for health issues",
        "Enable more verbose logging temporarily to get additional context",
    ]

    def match(self, e: Dict[str, Any]) -> bool:
        return e.get("error_rate", 0) > 0.2 or e.get("anomaly_rate", 0) > 0.15


class NominalRule(Rule):
    rule_id = "nominal"
    root_cause = "No significant issues detected"
    confidence = 0.70
    severity = "INFO"
    explanation = (
        "The log file does not show significant error patterns, anomalies, or "
        "high-frequency problem keywords. The system appears to be operating normally."
    )
    suggested_fixes = [
        "Continue monitoring — consider setting up alerts for error rate thresholds",
        "Review INFO logs for any unusual patterns that could indicate early degradation",
    ]

    def match(self, e: Dict[str, Any]) -> bool:
        return True  # Always matches as fallback


# Rule registry — evaluated in priority order, first match wins
RULES: List[Rule] = [
    DatabaseConnectionRule(),
    AuthFailureRule(),
    MemoryExhaustionRule(),
    NetworkTimeoutRule(),
    HighErrorRateRule(),
    NominalRule(),
]


def run(evidence: Dict[str, Any]) -> Dict[str, Any]:
    """
    Evaluate rules against the aggregated evidence.
    Returns the highest-confidence match.
    """
    for rule in RULES:
        if rule.match(evidence):
            match = rule.to_match()
            logger.info(f"Inference: rule '{match.rule_id}' matched (confidence={match.confidence})")
            return {
                "rule_id": match.rule_id,
                "root_cause": match.root_cause,
                "confidence": match.confidence,
                "severity": match.severity,
                "explanation": match.explanation,
                "suggested_fixes": match.suggested_fixes,
            }

    # Should never reach here since NominalRule always matches
    return {
        "rule_id": "unknown",
        "root_cause": "Unable to determine root cause",
        "confidence": 0.0,
        "severity": "INFO",
        "explanation": "No rules matched the provided evidence.",
        "suggested_fixes": ["Inspect logs manually."],
    }