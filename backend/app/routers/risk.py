"""Submit a compliance certificate and run the breach check"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.models import Covenant, ComplianceCertificate, BreachCheck
from app.risk.engine import check_breach
from app.schemas import CertificateCreate

router = APIRouter(prefix="/risk", tags=["risk"])

@router.post("/check")
async def submit_and_check(
    data: CertificateCreate,
    session: AsyncSession = Depends(get_session),
) -> dict:
    covenant = await session.get(Covenant, data.covenant_id)
    if covenant is None:
        raise HTTPException(status_code=404, detail="Covenant not found")
    if covenant.operator is None or covenant.threshold is None:
        raise HTTPException(status_code=400, detail="Covenant has no numeric threshold to check")

    # save the certificate
    cert = ComplianceCertificate(
        loan_agreement_id=covenant.loan_agreement_id,
        period=data.period,
        reported_value=data.reported_value,
    )
    session.add(cert)
    await session.flush()

    # run the deterministic breach check
    result = check_breach(covenant.operator, float(covenant.threshold), data.reported_value)

    # save the breach result
    breach = BreachCheck(
        covenant_id=covenant.id,
        certificate_id=cert.id,
        actual_value=data.reported_value,
        headroom=result["headroom"],
        status=result["status"],
    )
    session.add(breach)
    await session.flush()

    return {
        "covenant": covenant.metric,
        "threshold": float(covenant.threshold),
        "reported": data.reported_value,
        **result,
    }