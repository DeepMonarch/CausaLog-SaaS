"""
AI Assistant Service — Phase 2 stub.

This module is the boundary between the deterministic pipeline and the LLM.
It receives structured evidence + inference output and produces natural language.

Currently returns rule-based explanations.
When ANTHROPIC_API_KEY is set in .env, it will call the LLM instead.
"""

from typing import Dict, Any, Optional
from app.utils.logger import get_logger

logger = get_logger(__name__)


def explain_report(
    inference: Dict[str, Any],
    evidence: Dict[str, Any],
    preprocessing: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Generate an AI explanation for a completed analysis.

    In Phase 2 this will call an LLM with a structured prompt.
    For now, it returns an enhanced rule-based explanation.

    Returns:
        {
            "ai_summary": str,
            "ai_fixes": list[str],
            "ai_confidence_note": str,
            "model_used": str,
        }
    """
    root_cause = inference.get("root_cause", "Unknown issue")
    confidence = inference.get("confidence", 0.0)
    severity = inference.get("severity", "INFO")
    explanation = inference.get("explanation", "")
    suggested_fixes = inference.get("suggested_fixes", [])

    total_records = preprocessing.get("parsed_records", 0)
    error_rate = evidence.get("error_rate", 0.0)
    top_keywords = evidence.get("top_keywords", [])
    num_anomalies = evidence.get("total_anomalies", 0)

    # Build a concise AI-style summary
    kw_str = ", ".join(top_keywords[:5]) if top_keywords else "no dominant keywords"

    ai_summary = (
        f"Analysis of {total_records} log records identified '{root_cause}' as the "
        f"primary issue with {confidence:.0%} confidence. "
        f"The error rate was {error_rate:.1%}, with {num_anomalies} anomalous records detected. "
        f"Key signals: {kw_str}. "
        f"{explanation}"
    )

    confidence_note = _confidence_note(confidence)

    logger.info(f"AI assistant: generated explanation for '{root_cause}'")

    return {
        "ai_summary": ai_summary,
        "ai_fixes": suggested_fixes,
        "ai_confidence_note": confidence_note,
        "model_used": "rule-based (Phase 1)",
    }


def _confidence_note(confidence: float) -> str:
    if confidence >= 0.85:
        return "High confidence — the evidence strongly supports this root cause."
    if confidence >= 0.65:
        return "Moderate confidence — consider verifying with additional log context."
    return "Low confidence — this is the best match available; manual investigation recommended."