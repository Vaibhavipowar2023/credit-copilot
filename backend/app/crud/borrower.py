from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Borrower
from app.schemas import BorrowerCreate


async def create(session: AsyncSession, data: BorrowerCreate) -> Borrower:
    borrower = Borrower(name=data.name, sector=data.sector)
    session.add(borrower)
    await session.flush()
    await session.refresh(borrower)
    return borrower


async def list_all(session: AsyncSession) -> list[Borrower]:
    result = await session.execute(select(Borrower))
    return list(result.scalars().all())