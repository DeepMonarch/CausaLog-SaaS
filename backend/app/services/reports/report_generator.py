from typing import Dict, Any
from app.utils.logger import get_logger

logger = get_logger(__name__)


def run(
    inference: Dict[str, Any],
    evidence: Dict[str, Any],
    preprocessing: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Combine inference result and evidence into a final structured report.
    """
    top_kw = evidence.get("top_keywords", [])[:8]
    error_rate = evidence.get("error_rate", 0)
    total = preprocessing.get("parsed_records", 0)
    anomalies = evidence.get("total_anomalies", 0)

    summary = (
        f"Analyzed {total} log records. "
        f"Error rate: {error_rate:.1%}. "
        f"Anomalies detected: {anomalies}. "
        f"Root cause identified as: {inference['root_cause']} "
        f"(confidence: {inference['confidence']:.0%})."
    )

    evidence_summary = {
        "top_keywords": top_kw,
        "error_rate": error_rate,
        "total_records": total,
        "total_anomalies": anomalies,
        "num_clusters": evidence.get("num_clusters", 0),
        "services_affected": evidence.get("services", []),
        "level_counts": evidence.get("level_counts", {}),
    }

    logger.info(f"Report generated: {inference['root_cause']} @ {inference['confidence']:.0%}")

    return {
        "root_cause": inference["root_cause"],
        "confidence": inference["confidence"],
        "severity": inference["severity"],
        "summary": summary,
        "suggested_fixes": inference["suggested_fixes"],
        "evidence_summary": evidence_summary,
        "explanation": inference["explanation"],
    }