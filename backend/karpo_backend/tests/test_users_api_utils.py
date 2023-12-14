import contextlib
from typing import Any, Dict

import pytest
from fastapi import FastAPI, status
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from karpo_backend.db.dao.requests_dao import RequestsDAO
from karpo_backend.db.dao.rides_dao import RidesDAO
from karpo_backend.db.models.users import get_user_db
from karpo_backend.web.api.users.utils import get_user_info_for_others


@pytest.mark.anyio
async def test_get_user_info_for_others(
    fastapi_app: FastAPI,
    client_test: AsyncClient,
    dbsession: AsyncSession,
    ride_data_1: Dict[str, Any],
    request_data_1: Dict[str, Any],
) -> None:
    url_post_ride = fastapi_app.url_path_for("post_rides")
    resp = await client_test.post(
        url_post_ride,
        json=ride_data_1,
    )
    assert resp.status_code == status.HTTP_200_OK

    url_post_request = fastapi_app.url_path_for("post_requests")
    resp = await client_test.post(
        url_post_request,
        json=request_data_1,
    )
    assert resp.status_code == status.HTTP_200_OK
    assert len(resp.json()["matches"]) > 0

    url_get_user_me = fastapi_app.url_path_for("users:current_user")
    resp = await client_test.get(url_get_user_me)
    assert resp.status_code == status.HTTP_200_OK
    test_user_id = resp.json()["id"]

    get_user_db_context = contextlib.asynccontextmanager(get_user_db)
    requests_dao = RequestsDAO(dbsession)
    rides_dao = RidesDAO(dbsession)

    async with get_user_db_context(dbsession) as user_db:
        user_info = await get_user_info_for_others(
            test_user_id,
            user_db,
            requests_dao,
            rides_dao,
        )

    assert user_info.name == "TestUser"
    assert user_info.num_requests == 1
    assert user_info.num_rides == 1
