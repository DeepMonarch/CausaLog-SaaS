# Model — implemented in Phase 1
import uuid
from datetime import datetime

from sqlalchemy import String, DateTime, Integer, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.config.database import Base


class Upload(Base):
    __tablename__ = "uploads"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False, index=True)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_size: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="pending")
    # pending | processing | completed | failed
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    user = relationship("User", backref="uploads")
    analysis = relationship("Analysis", back_populates="upload", uselist=False)