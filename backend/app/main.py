from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, users, upload, analysis, reports, history
from app.config.settings import settings


from app.config.database import engine, Base
import app.models  # noqa: F401 — registers all models with Baseexit

app = FastAPI(
    title="Causalog API",
    description="Root Cause Analysis platform API",
    version="0.1.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(upload.router, prefix="/api")
app.include_router(analysis.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(history.router, prefix="/api")


@app.get("/api/health", tags=["health"])
async def health():
    return {"status": "ok", "service": "causalog-api"}


@app.on_event("startup")
async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)