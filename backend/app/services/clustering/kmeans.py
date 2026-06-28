from typing import List, Dict, Any
import numpy as np
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from app.utils.logger import get_logger

logger = get_logger(__name__)


def _optimal_k(vectors: np.ndarray, max_k: int = 8) -> int:
    """Pick k using silhouette score."""
    n = len(vectors)
    if n < 4:
        return 1
    best_k, best_score = 2, -1.0
    for k in range(2, min(max_k + 1, n)):
        try:
            km = KMeans(n_clusters=k, random_state=42, n_init=5)
            labels = km.fit_predict(vectors)
            score = silhouette_score(vectors, labels)
            if score > best_score:
                best_score, best_k = score, k
        except Exception:
            continue
    return best_k


def run(
    records: List[Dict[str, Any]],
    tfidf_result: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Cluster log records using K-Means on TF-IDF vectors.
    Returns cluster labels and per-cluster summaries.
    """
    vectors = tfidf_result.get("vectors", [])
    feature_names = tfidf_result.get("feature_names", [])

    if not vectors or len(vectors) < 2:
        logger.warning("Not enough vectors for clustering")
        return {"labels": [], "num_clusters": 0, "clusters": []}

    X = np.array(vectors)
    k = _optimal_k(X)
    km = KMeans(n_clusters=k, random_state=42, n_init=10)
    labels = km.fit_predict(X).tolist()

    # Build cluster summaries
    clusters = []
    for cid in range(k):
        indices = [i for i, l in enumerate(labels) if l == cid]
        cluster_records = [records[i] for i in indices]

        # Top TF-IDF terms for this cluster
        centroid = km.cluster_centers_[cid]
        top_idx = np.argsort(centroid)[::-1][:6].tolist()
        top_terms = [feature_names[i] for i in top_idx if i < len(feature_names)]

        # Level distribution within cluster
        level_dist: Dict[str, int] = {}
        for rec in cluster_records:
            lvl = rec.get("level", "UNKNOWN")
            level_dist[lvl] = level_dist.get(lvl, 0) + 1

        # Dominant severity
        severity = "INFO"
        if level_dist.get("ERROR", 0) > 0 or level_dist.get("FATAL", 0) > 0:
            severity = "ERROR"
        elif level_dist.get("WARN", 0) > 0:
            severity = "WARN"

        clusters.append({
            "cluster_id": cid,
            "size": len(indices),
            "top_terms": top_terms,
            "level_distribution": level_dist,
            "severity": severity,
            "sample_messages": [r.get("message", "")[:120] for r in cluster_records[:3]],
        })

    logger.info(f"Clustering: k={k}, sizes={[c['size'] for c in clusters]}")
    return {"labels": labels, "num_clusters": k, "clusters": clusters}