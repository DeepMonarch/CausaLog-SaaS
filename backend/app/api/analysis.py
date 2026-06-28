from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone

from app.auth.dependencies import get_current_user
from app.config.database import get_db, AsyncSessionLocal
from app.models.user import User
from app.models.upload import Upload
from app.models.analysis import Analysis
from app.models.report import Report
from app.schemas.analysis import AnalysisStatusResponse, AnalysisDetailResponse
from app.services.pipeline.pipeline import run_pipeline
from app.utils.logger import get_logger

import os

logger = get_logger(__name__)
router = APIRouter(prefix="/analysis", tags=["analysis"])


async def _run_analysis_task(upload_id: str, user_id: str, file_path: str) -> None:
    async with AsyncSessionLocal() as db:
        try:
            result = await db.execute(select(Analysis).where(Analysis.upload_id == upload_id))
            analysis = result.scalar_one_or_none()
            if not analysis:
                return

            with open(file_path, "r", encoding="utf-8", errors="replace") as f:
                raw_content = f.read()

            pipeline_output = run_pipeline(raw_content)

            analysis.preprocessing_result = pipeline_output.get("preprocessing")
            analysis.keywords = pipeline_output.get("keywords")
            analysis.clusters = pipeline_output.get("clusters")
            analysis.anomalies = pipeline_output.get("anomalies")
            analysis.evidence = pipeline_output.get("evidence")
            analysis.inference_result = pipeline_output.get("inference")
            analysis.ai_explanation = pipeline_output.get("ai_explanation")
            analysis.completed_at = datetime.now(timezone.utc)

            if pipeline_output.get("error"):
                analysis.status = "failed"
                analysis.error_message = pipeline_output["error"]
            else:
                analysis.status = "completed"
                report_data = pipeline_output.get("report", {})
                report = Report(
                    analysis_id=analysis.id,
                    user_id=user_id,
                    root_cause=report_data.get("root_cause", "Unknown"),
                    confidence=report_data.get("confidence", 0.0),
                    severity=report_data.get("severity", "INFO"),
                    summary=report_data.get("summary"),
                    suggested_fixes=report_data.get("suggested_fixes", []),
                    evidence_summary=report_data.get("evidence_summary", {}),
                )
                db.add(report)

            upload_res = await db.execute(select(Upload).where(Upload.id == upload_id))
            upload = upload_res.scalar_one_or_none()
            if upload:
                upload.status = analysis.status

            await db.commit()
            logger.info(f"Analysis {analysis.id} completed with status: {analysis.status}")

        except Exception as e:
            logger.error(f"Analysis task failed for upload {upload_id}: {e}", exc_info=True)
            try:
                result = await db.execute(select(Analysis).where(Analysis.upload_id == upload_id))
                analysis = result.scalar_one_or_none()
                if analysis:
                    analysis.status = "failed"
                    analysis.error_message = str(e)
                    await db.commit()
            except Exception:
                pass


@router.post("/{upload_id}", response_model=AnalysisStatusResponse, status_code=status.HTTP_202_ACCEPTED)
async def start_analysis(
    upload_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Analysis:
    upload_res = await db.execute(
        select(Upload).where(Upload.id == upload_id, Upload.user_id == current_user.id)
    )
    upload = upload_res.scalar_one_or_none()
    if not upload:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Upload not found")

    existing = await db.execute(select(Analysis).where(Analysis.upload_id == upload_id))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Analysis already exists for this upload",
        )

    file_path = os.path.join("uploads", current_user.id, upload.filename)
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Upload file not found on disk",
        )

    analysis = Analysis(upload_id=upload_id, user_id=current_user.id, status="running")
    db.add(analysis)
    upload.status = "processing"
    await db.flush()
    await db.refresh(analysis)

    background_tasks.add_task(_run_analysis_task, upload_id, current_user.id, file_path)
    logger.info(f"Analysis {analysis.id} queued for upload {upload_id}")
    return analysis


@router.get("/{upload_id}", response_model=AnalysisDetailResponse)
async def get_analysis(
    upload_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Analysis:
    result = await db.execute(
        select(Analysis).where(
            Analysis.upload_id == upload_id,
            Analysis.user_id == current_user.id,
        )
    )
    analysis = result.scalar_one_or_none()
    if not analysis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found")
    return analysis


@router.delete("/{upload_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_analysis(
    upload_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    result = await db.execute(
        select(Analysis).where(
            Analysis.upload_id == upload_id,
            Analysis.user_id == current_user.id,
        )
    )
    analysis = result.scalar_one_or_none()
    if not analysis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found")
    await db.delete(analysis)