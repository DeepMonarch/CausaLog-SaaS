# Model — implemented in Phase 1
import uuid
from datetime import datetime

from sqlalchemy import String, DateTime, Float, ForeignKey, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.config.database import Base


class Analysis(Base):
    __tablename__ = "analyses"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )
    upload_id: Mapped[str] = mapped_column(
        String, ForeignKey("uploads.id"), nullable=False, unique=True, index=True
    )
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="running")
    # running | completed | failed

    # Pipeline outputs stored as JSONB — queryable, no re-running needed
    preprocessing_result: Mapped[dict] = mapped_column(JSONB, nullable=True)
    keywords: Mapped[dict] = mapped_column(JSONB, nullable=True)
    clusters: Mapped[dict] = mapped_column(JSONB, nullable=True)
    anomalies: Mapped[dict] = mapped_column(JSONB, nullable=True)
    evidence: Mapped[dict] = mapped_column(JSONB, nullable=True)
    inference_result: Mapped[dict] = mapped_column(JSONB, nullable=True)

    error_message: Mapped[str] = mapped_column(String(1000), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    completed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)

    upload = relationship("Upload", back_populates="analysis")
    report = relationship("Report", back_populates="analysis", uselist=False)