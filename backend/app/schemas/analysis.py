from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class AnalysisStatusResponse(BaseModel):
    id: str
    upload_id: str
    status: str
    created_at: datetime
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None

    model_config = {"from_attributes": True}


class ClusterSummary(BaseModel):
    cluster_id: int
    size: int
    top_keywords: List[str]
    sample_messages: List[str]
    severity: str


class AnomalySummary(BaseModel):
    total_anomalies: int
    anomaly_rate: float
    anomalous_records: List[Dict[str, Any]]


class InferenceResult(BaseModel):
    root_cause: str
    confidence: float
    severity: str
    matched_rule: str
    explanation: str


class AnalysisDetailResponse(BaseModel):
    id: str
    upload_id: str
    status: str
    keywords: Optional[Dict[str, Any]] = None
    clusters: Optional[Dict[str, Any]] = None
    anomalies: Optional[Dict[str, Any]] = None
    evidence: Optional[Dict[str, Any]] = None
    inference_result: Optional[Dict[str, Any]] = None
    ai_explanation: Optional[Dict[str, Any]] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    model_config = {"from_attributes": True}