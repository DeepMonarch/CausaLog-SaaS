# Model — implemented in Phase 1
import uuid
from datetime import datetime

from sqlalchemy import String, DateTime, Float, ForeignKey, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.config.database import Base


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )
    analysis_id: Mapped[str] = mapped_column(
        String, ForeignKey("analyses.id"), nullable=False, unique=True, index=True
    )
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)

    root_cause: Mapped[str] = mapped_column(String(500), nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    severity: Mapped[str] = mapped_column(String(20), nullable=False)  # HIGH | MEDIUM | LOW | INFO
    summary: Mapped[str] = mapped_column(String(2000), nullable=True)
    suggested_fixes: Mapped[dict] = mapped_column(JSONB, nullable=True)  # list of strings
    evidence_summary: Mapped[dict] = mapped_column(JSONB, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    analysis = relationship("Analysis", back_populates="report")