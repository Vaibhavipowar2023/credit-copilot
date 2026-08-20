from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.schemas import LoanCreate, LoanRead
from app.crud import loan as loan_crud

router = APIRouter(prefix="/loans", tags=["loans"])


@router.post("", response_model=LoanRead, status_code=201)
async def create_loan(data: LoanCreate, session: AsyncSession = Depends(get_session)):
    loan = await loan_crud.create(session, data)
    if loan is None:
        raise HTTPException(status_code=404, detail="Borrower not found")
    return loan


@router.get("", response_model=list[LoanRead])
async def list_loans(session: AsyncSession = Depends(get_session)):
    return await loan_crud.list_all(session)