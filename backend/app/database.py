from collections.abc import AsyncGenerator
"""SQLAlchemy is a Python library used to communicate with SQL databases like PostgreSQL, MySQL, SQLite, etc.
It can create tables, insert data, query data, update records, and manage database connections.

1. create_async_engine : creates the connection engine between your Python app and the database.
2. async_sessionmaker : creates a factory for database session
3. AsyncSession : is the actual async session you use to run queries, insert data, update rows, commit transactions, and so on.
"""
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy import NullPool
from app.config import settings

engine = create_async_engine(
    settings.database_url,
    poolclass=NullPool,
    pool_pre_ping=True,
    echo=settings.debug,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    autoflush=False,
    expire_on_commit=False,
)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise