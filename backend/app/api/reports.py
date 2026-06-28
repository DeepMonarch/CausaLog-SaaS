# Placeholder — implemented in Phase 1
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.auth.dependencies import get_current_user
from app.config.database import get_db
from app.models.user import User
from app.models.report import Report
from app.schemas.report import ReportResponse, ReportListItem

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("", response_model=list[ReportListItem])
async def list_reports(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Report]:
    result = await db.execute(
        select(Report)
        .where(Report.user_id == current_user.id)
        .order_by(Report.created_at.desc())
        .limit(50)
    )
    return list(result.scalars().all())


@router.get("/{report_id}", response_model=ReportResponse)
async def get_report(
    report_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Report:
    result = await db.execute(
        select(Report).where(Report.id == report_id, Report.user_id == current_user.id)
    )
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    return report