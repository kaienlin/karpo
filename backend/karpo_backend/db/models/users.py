# type: ignore
import datetime
import uuid
from typing import Optional

from fastapi import Depends
from fastapi_users import BaseUserManager, FastAPIUsers, UUIDIDMixin, schemas
from fastapi_users.authentication import (
    AuthenticationBackend,
    BearerTransport,
    RedisStrategy,
)
from fastapi_users.db import SQLAlchemyBaseUserTableUUID, SQLAlchemyUserDatabase
from pydantic import Field
from redis.asyncio import ConnectionPool, Redis
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func
from sqlalchemy.sql.sqltypes import DateTime, String
from typing_extensions import Annotated

from karpo_backend.db.base import Base
from karpo_backend.db.dependencies import get_db_session
from karpo_backend.services.redis.dependency import get_redis_pool
from karpo_backend.settings import settings


class User(SQLAlchemyBaseUserTableUUID, Base):
    """Represents a user entity."""

    name: Mapped[str] = mapped_column(String(length=200))
    phone_number: Mapped[Optional[str]] = mapped_column(String(length=20))
    rating: Mapped[Optional[float]] = mapped_column(insert_default=None)
    rating_count: Mapped[int] = mapped_column(insert_default=0)
    avatar: Mapped[Optional[str]]
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )


class UserRead(schemas.BaseUser[uuid.UUID]):
    """Represents a read command for a user."""

    name: str
    phone_number: Optional[str] = None
    rating: Optional[
        Annotated[float, Field(strict=True, ge=0, le=5.0)]
    ] = None  # noqa: WPS432
    avatar: Optional[str] = None


class UserCreate(schemas.BaseUserCreate):
    """Represents a create command for a user."""

    name: str
    phone_number: Optional[str] = None
    avatar: Optional[str] = None


class UserUpdate(schemas.BaseUserUpdate):
    """Represents an update command for a user."""

    name: Optional[str] = None
    phone_number: Optional[str] = None
    avatar: Optional[str] = None


class UserManager(UUIDIDMixin, BaseUserManager[User, uuid.UUID]):
    """Manages a user session and its tokens."""

    reset_password_token_secret = settings.users_secret
    verification_token_secret = settings.users_secret


async def get_user_db(
    session: AsyncSession = Depends(get_db_session),
) -> SQLAlchemyUserDatabase:
    """
    Yield a SQLAlchemyUserDatabase instance.

    :param session: asynchronous SQLAlchemy session.
    :yields: instance of SQLAlchemyUserDatabase.
    """
    yield SQLAlchemyUserDatabase(session, User)


async def get_user_manager(
    user_db: SQLAlchemyUserDatabase = Depends(get_user_db),
) -> UserManager:
    """
    Yield a UserManager instance.

    :param user_db: SQLAlchemy user db instance
    :yields: an instance of UserManager.
    """
    yield UserManager(user_db)


async def get_redis_strategy(
    redis_pool: ConnectionPool = Depends(get_redis_pool),
) -> RedisStrategy:
    """
    Return a RedisStrategy in order to instantiate it dynamically.

    :returns: instance of RedisStrategy with provided settings.
    """
    async with Redis(connection_pool=redis_pool, decode_responses=True) as redis:
        yield RedisStrategy(redis, lifetime_seconds=86400)


bearer_transport = BearerTransport(tokenUrl="/api/auth/cookie/login")
auth_cookie = AuthenticationBackend(
    name="cookie",
    transport=bearer_transport,
    get_strategy=get_redis_strategy,
)

backends = [
    auth_cookie,
]

api_users = FastAPIUsers[User, uuid.UUID](get_user_manager, backends)

current_active_user = api_users.current_user(active=True)
