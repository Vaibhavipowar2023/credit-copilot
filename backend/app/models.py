"""
All database tables, defined as SQLAlchemy models.
one class = one table
One mapped attribute = one column.
borrower -> loans -> covenants
plus compliance certificates and the breach checks computed from them.
"""

from sqlalchemy import ForeignKey, Numeric, Text, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from datetime import date, datetime
from pgvector.sqlalchemy import Vector
import enum


class Base(DeclarativeBase):
    """Parent of every model. SQLAlchemy uses it to keep a registry of all tables."""
    pass


class Role(str, enum.Enum):
    admin = "admin"
    user = "user"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(unique=True)
    hashed_password: Mapped[str]
    role: Mapped[str] = mapped_column(default=Role.user.value)
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())


class Borrower(Base):
    __tablename__ = "borrowers"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    sector: Mapped[str | None]
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    loans: Mapped[list["LoanAgreement"]] = relationship(back_populates="borrower")


class LoanAgreement(Base):
    __tablename__ = "loan_agreements"

    id: Mapped[int] = mapped_column(primary_key=True)
    borrower_id: Mapped[int] = mapped_column(ForeignKey("borrowers.id"))
    principal: Mapped[float] = mapped_column(Numeric(18, 2))
    currency: Mapped[str] = mapped_column(default="USD")
    maturity_date: Mapped[date | None]
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    borrower: Mapped["Borrower"] = relationship(back_populates="loans")
    covenants: Mapped[list["Covenant"]] = relationship(back_populates="loan")
    certificates: Mapped[list["ComplianceCertificate"]] = relationship(back_populates="loan")


class Covenant(Base):
    __tablename__ = "covenants"

    id: Mapped[int] = mapped_column(primary_key=True)
    loan_agreement_id: Mapped[int] = mapped_column(ForeignKey("loan_agreements.id"))
    metric: Mapped[str]
    operator: Mapped[str | None]
    threshold: Mapped[float | None] = mapped_column(Numeric(18, 4), nullable=True)
    unit: Mapped[str | None]
    test_frequency: Mapped[str | None]
    source_quote: Mapped[str | None]
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    loan: Mapped["LoanAgreement"] = relationship(back_populates="covenants")
    breach_checks: Mapped[list["BreachCheck"]] = relationship(back_populates="covenant")


class ComplianceCertificate(Base):
    __tablename__ = "compliance_certificates"

    id: Mapped[int] = mapped_column(primary_key=True)
    loan_agreement_id: Mapped[int] = mapped_column(ForeignKey("loan_agreements.id"))
    period: Mapped[date]
    reported_value: Mapped[float] = mapped_column(Numeric(18, 4))
    submitted_at: Mapped[datetime] = mapped_column(server_default=func.now())

    loan: Mapped["LoanAgreement"] = relationship(back_populates="certificates")
    breach_checks: Mapped[list["BreachCheck"]] = relationship(back_populates="certificate")


class BreachCheck(Base):
    __tablename__ = "breach_checks"

    id: Mapped[int] = mapped_column(primary_key=True)
    covenant_id: Mapped[int] = mapped_column(ForeignKey("covenants.id"))
    certificate_id: Mapped[int] = mapped_column(ForeignKey("compliance_certificates.id"))
    actual_value: Mapped[float] = mapped_column(Numeric(18, 4))
    headroom: Mapped[float] = mapped_column(Numeric(18, 4))
    status: Mapped[str]
    checked_at: Mapped[datetime] = mapped_column(server_default=func.now())

    covenant: Mapped["Covenant"] = relationship(back_populates="breach_checks")
    certificate: Mapped["ComplianceCertificate"] = relationship(back_populates="breach_checks")


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[int] = mapped_column(primary_key=True)
    loan_agreement_id: Mapped[int] = mapped_column(ForeignKey("loan_agreements.id"))
    filename: Mapped[str]
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    chunks: Mapped[list["DocumentChunk"]] = relationship(back_populates="document")


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id: Mapped[int] = mapped_column(primary_key=True)
    document_id: Mapped[int] = mapped_column(ForeignKey("documents.id"))
    content: Mapped[str] = mapped_column(Text)
    embedding: Mapped[list[float] | None] = mapped_column(Vector(768))
    chunk_index: Mapped[int]
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    document: Mapped["Document"] = relationship(back_populates="chunks")