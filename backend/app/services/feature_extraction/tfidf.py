from typing import List, Dict, Any
import json

from sklearn.feature_extraction.text import TfidfVectorizer
from app.utils.logger import get_logger

logger = get_logger(__name__)


def run(records: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Fit TF-IDF on log messages and return vectors + vocabulary.
    Vectors are returned as a dense list for JSON serialisation.
    """
    messages = [rec.get("message", "") or "" for rec in records]

    if len(messages) < 2:
        logger.warning("Too few records for TF-IDF — skipping")
        return {"vectors": [], "vocabulary": {}, "feature_names": []}

    vectorizer = TfidfVectorizer(
        max_features=200,
        stop_words="english",
        ngram_range=(1, 2),
        min_df=1,
    )
    matrix = vectorizer.fit_transform(messages)
    feature_names = vectorizer.get_feature_names_out().tolist()
    vectors = matrix.toarray().tolist()

    logger.info(f"TF-IDF: {len(vectors)} vectors, {len(feature_names)} features")

    return {
        "vectors": vectors,
        "vocabulary": vectorizer.vocabulary_,
        "feature_names": feature_names,
    }