# Placeholder — implemented in Phase 1
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

from app.auth.dependencies import get_current_user
from app.config.database import get_db
from app.models.user import User
from app.models.upload import Upload

router = APIRouter(prefix="/history", tags=["history"])


class HistoryItem(BaseModel):
    upload_id: str
    original_filename: str
    file_size: int
    status: str
    created_at: datetime
    report_id: Optional[str] = None
    root_cause: Optional[str] = None
    severity: Optional[str] = None

    model_config = {"from_attributes": True}


@router.get("", response_model=list[HistoryItem])
async def get_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[HistoryItem]:
    result = await db.execute(
        select(Upload)
        .where(Upload.user_id == current_user.id)
        .order_by(Upload.created_at.desc())
        .limit(100)
    )
    uploads = result.scalars().all()

    items = []
    for upload in uploads:
        item = HistoryItem(
            upload_id=upload.id,
            original_filename=upload.original_filename,
            file_size=upload.file_size,
            status=upload.status,
            created_at=upload.created_at,
        )
        # Attach report info if analysis completed
        if upload.analysis and upload.analysis.report:
            item.report_id = upload.analysis.report.id
            item.root_cause = upload.analysis.report.root_cause
            item.severity = upload.analysis.report.severity
        items.append(item)

    return items