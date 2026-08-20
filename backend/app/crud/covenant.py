from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Covenant, LoanAgreement
from app.schemas import CovenantCreate


async def create(session: AsyncSession, data: CovenantCreate) -> Covenant | None:
    loan = await session.get(LoanAgreement, data.loan_agreement_id)
    if loan is None:
        return None
    covenant = Covenant(
        loan_agreement_id=data.loan_agreement_id,
        metric=data.metric,
        operator=data.operator,
        threshold=data.threshold,
        unit=data.unit,
        test_frequency=data.test_frequency,
        source_quote=data.source_quote,
    )
    session.add(covenant)
    await session.flush()
    await session.refresh(covenant)
    return covenant


async def list_all(session: AsyncSession) -> list[Covenant]:
    result = await session.execute(select(Covenant))
    return list(result.scalars().all())