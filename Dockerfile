# ============================================================
# Stage 1: Build the React frontend
# ============================================================
FROM node:20-slim AS frontend-build

WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install
COPY frontend/ ./
RUN npm run build
# Output: /frontend/dist/

# ============================================================
# Stage 2: Python backend + serve the built frontend
# ============================================================
FROM python:3.11-slim

# Install uv for fast dependency resolution
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

WORKDIR /app

# Install Python dependencies
COPY backend/pyproject.toml ./
RUN uv pip install --system --no-cache \
    "fastapi>=0.136" "uvicorn[standard]>=0.30" "sqlalchemy[asyncio]>=2.0" \
    "asyncpg>=0.29" "pydantic-settings>=2.4" "pgvector>=0.5.0" \
    "httpx>=0.28" "langchain-text-splitters>=1.1" "python-multipart>=0.0.32" \
    "mistralai>=2.9" "openai>=2.53" "cohere>=7.0" "pyjwt>=2.13" "bcrypt>=5.0"

# Copy backend code
COPY backend/ ./

# Copy the built frontend
COPY --from=frontend-build /frontend/dist /app/frontend-dist

# Tell FastAPI where the frontend build is
ENV FRONTEND_DIR=/app/frontend-dist

# Render sets PORT env var; default to 8000
ENV PORT=8000

# Expose and run
EXPOSE ${PORT}
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT}
