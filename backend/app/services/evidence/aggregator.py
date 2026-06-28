from typing import List, Dict, Any


def run(
    preprocessing: Dict[str, Any],
    keywords: Dict[str, Any],
    clusters: Dict[str, Any],
    anomalies: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Aggregate outputs from all pipeline stages into a single evidence object.
    This is the input to the inference engine.
    """
    level_counts = preprocessing.get("level_counts", {})
    total = preprocessing.get("parsed_records", 1) or 1

    error_rate = round(
        (level_counts.get("ERROR", 0) + level_counts.get("FATAL", 0)) / total, 4
    )
    warn_rate = round(level_counts.get("WARN", 0) / total, 4)

    # Dominant severity across all clusters
    cluster_list = clusters.get("clusters", [])
    has_error_cluster = any(c.get("severity") == "ERROR" for c in cluster_list)

    return {
        # Keywords
        "top_keywords": keywords.get("top_keywords", []),
        "keyword_frequencies": keywords.get("keyword_frequencies", {}),
        # Clustering
        "num_clusters": clusters.get("num_clusters", 0),
        "cluster_summaries": cluster_list,
        "has_error_cluster": has_error_cluster,
        # Anomalies
        "anomaly_detected": anomalies.get("total_anomalies", 0) > 0,
        "anomaly_rate": anomalies.get("anomaly_rate", 0.0),
        "total_anomalies": anomalies.get("total_anomalies", 0),
        # Log volume and severity
        "total_records": preprocessing.get("parsed_records", 0),
        "level_counts": level_counts,
        "error_rate": error_rate,
        "warn_rate": warn_rate,
        "services": list(preprocessing.get("service_counts", {}).keys()),
    }