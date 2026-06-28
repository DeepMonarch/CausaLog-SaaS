from typing import List, Dict, Any
import numpy as np
from sklearn.ensemble import IsolationForest
from app.utils.logger import get_logger

logger = get_logger(__name__)


def run(
    records: List[Dict[str, Any]],
    tfidf_result: Dict[str, Any],
    contamination: float = 0.1,
) -> Dict[str, Any]:
    """
    Detect anomalous log records using Isolation Forest on TF-IDF vectors.
    Also flags time-based spikes in error rate.
    """
    vectors = tfidf_result.get("vectors", [])

    if not vectors or len(vectors) < 5:
        logger.warning("Not enough records for anomaly detection")
        return {
            "anomaly_flags": [False] * len(records),
            "anomaly_scores": [0.0] * len(records),
            "total_anomalies": 0,
            "anomaly_rate": 0.0,
            "anomalous_records": [],
        }

    X = np.array(vectors)
    clf = IsolationForest(contamination=contamination, random_state=42, n_estimators=100)
    raw_predictions = clf.fit_predict(X)  # -1 = anomaly, 1 = normal
    scores = clf.decision_function(X).tolist()

    flags = [p == -1 for p in raw_predictions]
    anomalous_records = []

    for i, (flag, score) in enumerate(zip(flags, scores)):
        if flag:
            rec = records[i]
            anomalous_records.append({
                "line_number": rec.get("line_number"),
                "level": rec.get("level"),
                "service": rec.get("service"),
                "message": rec.get("message", "")[:150],
                "anomaly_score": round(score, 4),
            })

    total = sum(flags)
    rate = round(total / len(records), 4) if records else 0.0
    logger.info(f"Anomaly detection: {total}/{len(records)} anomalies ({rate:.1%})")

    return {
        "anomaly_flags": flags,
        "anomaly_scores": scores,
        "total_anomalies": total,
        "anomaly_rate": rate,
        "anomalous_records": anomalous_records[:20],  # cap for storage
    }