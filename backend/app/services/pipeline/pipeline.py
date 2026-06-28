from typing import Dict, Any
from app.utils.logger import get_logger
from app.services.preprocessing import preprocessing
from app.services.nlp import keyword_extraction
from app.services.feature_extraction import tfidf
from app.services.clustering import kmeans
from app.services.anomaly_detection import isolation_forest
from app.services.evidence import aggregator
from app.services.inference import inference_engine
from app.services.reports import report_generator

logger = get_logger(__name__)


def run_pipeline(raw_log_content: str) -> Dict[str, Any]:
    """
    Execute the full RCA pipeline on raw log text.
    Each stage is isolated — failure in one stage is caught and recorded.
    Returns a dict with all stage outputs and the final report.
    """
    result: Dict[str, Any] = {
        "preprocessing": None,
        "keywords": None,
        "tfidf": None,
        "clusters": None,
        "anomalies": None,
        "evidence": None,
        "inference": None,
        "report": None,
        "error": None,
    }

    try:
        logger.info("Pipeline: starting preprocessing")
        prep = preprocessing.run(raw_log_content)
        result["preprocessing"] = prep.to_dict()

        logger.info("Pipeline: keyword extraction")
        kw = keyword_extraction.extract_keywords(prep.records)
        result["keywords"] = kw

        logger.info("Pipeline: TF-IDF")
        tfidf_out = tfidf.run(prep.records)
        result["tfidf"] = {"feature_names": tfidf_out["feature_names"], "vocabulary_size": len(tfidf_out["vocabulary"])}
        # Keep vectors separate — too large to store in result dict directly

        logger.info("Pipeline: clustering")
        cluster_out = kmeans.run(prep.records, tfidf_out)
        result["clusters"] = cluster_out

        logger.info("Pipeline: anomaly detection")
        anomaly_out = isolation_forest.run(prep.records, tfidf_out)
        result["anomalies"] = anomaly_out

        logger.info("Pipeline: evidence aggregation")
        evidence = aggregator.run(prep.to_dict(), kw, cluster_out, anomaly_out)
        result["evidence"] = evidence

        logger.info("Pipeline: inference")
        inference = inference_engine.run(evidence)
        result["inference"] = inference

        logger.info("Pipeline: report generation")
        report = report_generator.run(inference, evidence, prep.to_dict())
        result["report"] = report

        logger.info("Pipeline: complete")

    except Exception as e:
        logger.error(f"Pipeline failed: {e}", exc_info=True)
        result["error"] = str(e)

    return result