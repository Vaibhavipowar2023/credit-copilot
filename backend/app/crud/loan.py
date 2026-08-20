"""Database operations for loans."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Borrower, LoanAgreement
from app.schemas import LoanCreate


async def create(session: AsyncSession, data: LoanCreate) -> LoanAgreement | None:
    borrower = await session.get(Borrower, data.borrower_id)
    if borrower is None:
        return None
    loan = LoanAgreement(
        borrower_id=data.borrower_id,
        principal=data.principal,
        currency=data.currency,
        maturity_date=data.maturity_date,
    )
    session.add(loan)
    await session.flush()
    await session.refresh(loan)
    return loan


async def list_all(session: AsyncSession) -> list[LoanAgreement]:
    result = await session.execute(select(LoanAgreement))
    return list(result.scalars().all())