"""
Pydantic schemas : The shape of JSON going in and out of the API.
"""

from pydantic import BaseModel
from datetime import date

# Authentication :
class UserCreate(BaseModel):
    email: str
    password: str

class UserRead(BaseModel):
    id: int
    email: str
    role: str
    is_active: bool
    model_config = {"from_attributes": True}

class LoginRequest(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RefreshRequest(BaseModel):
    refresh_token: str


class BorrowerCreate(BaseModel):
    """What a user is ALLOWED to send."""
    name: str
    sector: str | None = None

class BorrowerRead(BaseModel):
    "What we send Back. Includes the DB-generated fields."
    id: int
    name: str
    sector: str | None
    model_config = {"from_attributes" : True} #  # lets Pydantic read straight from a SQLAlchemy model

class LoanCreate(BaseModel):
    """When a user sends to create a loan. borrower_id says which borrower it belongs to"""
    borrower_id: int
    principal: float
    currency: str="USD"
    maturity_date: date | None = None

class LoanRead(BaseModel):
    """What we send back"""
    id: int
    borrower_id: int
    principal: float
    currency: str
    maturity_date: date | None
    model_config = {"from_attributes": True}

class CovenantCreate(BaseModel):
    """What a user sends to create a covenant. loan_agreement_id says which loan it belongs to"""
    loan_agreement_id: int
    metric: str
    operator: str
    threshold: float
    unit: str | None = None
    test_frequency: str | None = None
    source_quote: str | None = None

class CovenantRead(BaseModel):
    """What we send back"""
    id: int
    loan_agreement_id: int
    metric: str
    operator: str | None
    threshold: float | None
    unit: str | None
    test_frequency: str | None
    source_quote: str | None
    model_config = {"from_attributes": True}

class DocumentRead(BaseModel):
    id: int
    loan_agreement_id: int
    filename: str
    created_at: str | None = None
    chunk_count: int | None = None
    model_config = {"from_attributes": True}

class SearchResult(BaseModel):
    chunk_index: int
    content: str


class AskResponse(BaseModel):
    answer: str
    sources: list["SearchResult"]

class CertificateCreate(BaseModel):
    covenant_id: int
    period: date
    reported_value: float