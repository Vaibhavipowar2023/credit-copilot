"""Get /health
it is use to check the app can actually reach Postgres, not just that its running"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session

router = APIRouter(tags=["health"])

@router.get("/health")
async def health(session: AsyncSession = Depends(get_session)) -> dict :
    try:
        await session.execute(text("SELECT 1"))
    except Exception as exc :
        raise HTTPException(status_code=503, detail="database unreachable") from exc
    return {"status" : "ok", "database" : "connected"}