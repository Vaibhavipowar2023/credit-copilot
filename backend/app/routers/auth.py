"""Register, Login and Refresh token endpoint"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

import jwt
from app.config import settings
from app.database import get_session
from app.models import User
from app.schemas import UserCreate, UserRead, Token, LoginRequest, RefreshRequest
from app.auth import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    SECRET,
    ALGORITHM,
)

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserRead, status_code=201)
async def register(data: UserCreate, session: AsyncSession = Depends(get_session)):
    existing = await session.execute(select(User).where(User.email == data.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(email=data.email, hashed_password=hash_password(data.password))
    session.add(user)
    await session.flush()
    await session.refresh(user)
    return user


@router.post("/login", response_model=Token)
async def login(data: LoginRequest, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return Token(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )


@router.post("/refresh", response_model=Token)
async def refresh(data: RefreshRequest, session: AsyncSession = Depends(get_session)):
    try:
        payload = jwt.decode(data.refresh_token, SECRET, algorithms=[ALGORITHM])
        if payload.get("type") != "refresh":
            raise ValueError("wrong token type")
        user_id = int(payload["sub"])
    except (jwt.PyJWTError, KeyError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    user = await session.get(User, user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or deactivated")
    return Token(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )