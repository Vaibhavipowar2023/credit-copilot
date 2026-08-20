from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.schemas import CovenantCreate, CovenantRead
from app.crud import covenant as covenant_crud

router = APIRouter(prefix="/covenants", tags=["covenants"])


@router.post("", response_model=CovenantRead, status_code=201)
async def create_covenant(data: CovenantCreate, session: AsyncSession = Depends(get_session)):
    covenant = await covenant_crud.create(session, data)
    if covenant is None:
        raise HTTPException(status_code=404, detail="Loan not found")
    return covenant


@router.get("", response_model=list[CovenantRead])
async def list_covenants(session: AsyncSession = Depends(get_session)):
    return await covenant_crud.list_all(session)