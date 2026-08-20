from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.schemas import BorrowerCreate, BorrowerRead
from app.crud import borrower as borrower_crud

router = APIRouter(prefix="/borrowers", tags=["borrowers"])


@router.post("", response_model=BorrowerRead, status_code=201)
async def create_borrower(
    data: BorrowerCreate,
    session: AsyncSession = Depends(get_session),
):
    return await borrower_crud.create(session, data)


@router.get("", response_model=list[BorrowerRead])
async def list_borrowers(session: AsyncSession = Depends(get_session)):
    return await borrower_crud.list_all(session)