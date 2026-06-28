# Schema — implemented in Phase 1
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class ReportResponse(BaseModel):
    id: str
    analysis_id: str
    root_cause: str
    confidence: float
    severity: str
    summary: Optional[str] = None
    suggested_fixes: Optional[List[str]] = None
    evidence_summary: Optional[Dict[str, Any]] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ReportListItem(BaseModel):
    id: str
    analysis_id: str
    root_cause: str
    confidence: float
    severity: str
    created_at: datetime

    model_config = {"from_attributes": True}