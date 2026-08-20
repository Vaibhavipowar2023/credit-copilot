"""Entry point: uvicorn app.main:app"""
import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import engine
from app.models import Base
from app.routers import health, auth, borrowers, loans, covenants, documents, risk

# Path to the frontend production build (set by Dockerfile or local dev)
FRONTEND_DIR = Path(os.getenv("FRONTEND_DIR", "../frontend/dist"))


@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"Starting {settings.app_name}")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    print("Shutting down")


app = FastAPI(title=settings.app_name, lifespan=lifespan)

# CORS: in production (single service) this is same-origin so CORS isn't needed,
# but we keep it for local dev where frontend runs on a different port.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check at root level (Render hits this)
app.include_router(health.router)

# All API routes under /api prefix
app.include_router(auth.router, prefix="/api")
app.include_router(borrowers.router, prefix="/api")
app.include_router(loans.router, prefix="/api")
app.include_router(covenants.router, prefix="/api")
app.include_router(documents.router, prefix="/api")
app.include_router(risk.router, prefix="/api")


@app.get("/api")
async def api_root() -> dict:
    return {"message": settings.app_name, "docs": "/docs"}


# Serve the React frontend in production
if FRONTEND_DIR.exists() and FRONTEND_DIR.is_dir():
    # Serve static assets (JS, CSS, images)
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIR / "assets"), name="assets")

    # SPA catch-all: any non-API route returns index.html so React Router handles it
    @app.get("/{full_path:path}")
    async def serve_spa(request: Request, full_path: str):
        # If a specific static file exists, serve it
        file_path = FRONTEND_DIR / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        # Otherwise return index.html for SPA routing
        return FileResponse(FRONTEND_DIR / "index.html")
