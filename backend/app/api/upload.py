# Placeholder — implemented in Phase 1
import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from datetime import datetime

from app.auth.dependencies import get_current_user
from app.config.database import get_db
from app.models.user import User
from app.models.upload import Upload
from app.utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/uploads", tags=["uploads"])

UPLOAD_DIR = "uploads"
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_EXTENSIONS = {".log", ".txt", ".csv"}


class UploadResponse(BaseModel):
    id: str
    filename: str
    original_filename: str
    file_size: int
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


@router.post("", response_model=UploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_log(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Upload:
    # Validate extension
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type '{ext}' not allowed. Use .log, .txt, or .csv",
        )

    content = await file.read()

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File exceeds the 10 MB limit",
        )

    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty",
        )

    # Save to disk
    user_dir = os.path.join(UPLOAD_DIR, current_user.id)
    os.makedirs(user_dir, exist_ok=True)
    stored_filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(user_dir, stored_filename)

    with open(file_path, "wb") as f:
        f.write(content)

    upload = Upload(
        user_id=current_user.id,
        filename=stored_filename,
        original_filename=file.filename or stored_filename,
        file_size=len(content),
        status="pending",
    )
    db.add(upload)
    await db.flush()
    await db.refresh(upload)

    logger.info(f"Upload {upload.id} saved: {upload.original_filename} ({upload.file_size} bytes)")
    return upload


@router.get("", response_model=list[UploadResponse])
async def list_uploads(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Upload]:
    result = await db.execute(
        select(Upload)
        .where(Upload.user_id == current_user.id)
        .order_by(Upload.created_at.desc())
        .limit(50)
    )
    return list(result.scalars().all())