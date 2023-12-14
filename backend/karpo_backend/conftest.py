from typing import Any, AsyncGenerator

import pytest
from fakeredis import FakeServer
from fakeredis.aioredis import FakeConnection
from fastapi import FastAPI
from httpx import AsyncClient
from redis.asyncio import ConnectionPool
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from karpo_backend.db.dependencies import get_db_session
from karpo_backend.db.utils import create_database, drop_database
from karpo_backend.services.redis.dependency import get_redis_pool
from karpo_backend.settings import settings
from karpo_backend.tests.data_fixtures.request_data_fixtures import (  # noqa: F401
    match_ride_data_1_request_datas,
    request_data_1,
    request_data_2,
    request_datas,
)
from karpo_backend.tests.data_fixtures.ride_data_fixtures import (  # noqa: F401
    ride_data_1,
    ride_data_2,
    ride_datas,
)
from karpo_backend.web.application import get_app
from karpo_backend.web.lifetime import setup_db, setup_test_users


@pytest.fixture(scope="session")
def anyio_backend() -> str:
    """
    Backend for anyio pytest plugin.

    :return: backend name.
    """
    return "asyncio"


@pytest.fixture(scope="session")
async def _engine() -> AsyncGenerator[AsyncEngine, None]:
    """
    Create engine and databases.

    :yield: new engine.
    """
    from karpo_backend.db.meta import meta  # noqa: WPS433
    from karpo_backend.db.models import load_all_models  # noqa: WPS433

    load_all_models()

    await create_database()

    engine = create_async_engine(str(settings.db_url))
    async with engine.begin() as conn:
        await conn.run_sync(meta.create_all)

    try:
        yield engine
    finally:
        await engine.dispose()
        await drop_database()


@pytest.fixture
async def dbsession(
    _engine: AsyncEngine,
) -> AsyncGenerator[AsyncSession, None]:
    """
    Get session to database.

    Fixture that returns a SQLAlchemy session with a SAVEPOINT, and the rollback to it
    after the test completes.

    :param _engine: current engine.
    :yields: async session.
    """
    connection = await _engine.connect()
    trans = await connection.begin()

    session_maker = async_sessionmaker(
        connection,
        expire_on_commit=False,
    )
    session = session_maker()

    try:
        yield session
    finally:
        await session.close()
        await trans.rollback()
        await connection.close()


@pytest.fixture
async def fake_redis_pool() -> AsyncGenerator[ConnectionPool, None]:
    """
    Get instance of a fake redis.

    :yield: FakeRedis instance.
    """
    server = FakeServer()
    server.connected = True
    pool = ConnectionPool(
        connection_class=FakeConnection,
        server=server,
        decode_responses=True,
    )

    yield pool

    await pool.disconnect()


@pytest.fixture
async def fastapi_app(
    dbsession: AsyncSession,
    fake_redis_pool: ConnectionPool,
) -> FastAPI:
    """
    Fixture for creating FastAPI app.

    :return: fastapi app with mocked dependencies.
    """
    application = get_app()
    application.state.redis_pool = fake_redis_pool
    application.dependency_overrides[get_db_session] = lambda: dbsession
    application.dependency_overrides[get_redis_pool] = lambda: fake_redis_pool

    setup_db(application)
    await setup_test_users(application)

    return application  # noqa: WPS331


@pytest.fixture
async def client(
    fastapi_app: FastAPI,
    anyio_backend: Any,
) -> AsyncGenerator[AsyncClient, None]:
    """
    Fixture that creates client for requesting server.

    :param fastapi_app: the application.
    :yield: client for the app.
    """
    async with AsyncClient(app=fastapi_app, base_url="http://test") as ac:
        yield ac


@pytest.fixture
async def client_test(
    fastapi_app: FastAPI,
    anyio_backend: Any,
) -> AsyncGenerator[AsyncClient, None]:
    """
    Fixture that creates client with the credential of test user (TestUser)
    """
    async with AsyncClient(app=fastapi_app, base_url="http://test") as ac:
        ac.headers.update(
            {
                "Authorization": "Bearer test",
            },
        )
        yield ac


@pytest.fixture
async def client_test0(
    fastapi_app: FastAPI,
    anyio_backend: Any,
) -> AsyncGenerator[AsyncClient, None]:
    """
    Fixture that creates client with the credential of test user (TestUser)
    """
    async with AsyncClient(app=fastapi_app, base_url="http://test") as ac:
        ac.headers.update(
            {
                "Authorization": "Bearer test0",
            },
        )
        yield ac


@pytest.fixture
async def client_test2(
    fastapi_app: FastAPI,
    anyio_backend: Any,
) -> AsyncGenerator[AsyncClient, None]:
    """
    Fixture that creates client with the credential of test user (TestUser)
    """
    async with AsyncClient(app=fastapi_app, base_url="http://test") as ac:
        ac.headers.update(
            {
                "Authorization": "Bearer test2",
            },
        )
        yield ac
