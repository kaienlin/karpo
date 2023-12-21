import uuid
from typing import Any, Dict

import pytest
from fastapi import FastAPI, status
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from karpo_backend.db.dao.joins_dao import JoinsDAO
from karpo_backend.db.dao.requests_dao import RequestsDAO
from karpo_backend.db.dao.rides_dao import RidesDAO


@pytest.mark.anyio
async def test_delete_user_data(
    fastapi_app: FastAPI,
    client_test: AsyncClient,
    client_test0: AsyncClient,
    dbsession: AsyncSession,
    request_data_1: Dict[str, Any],
    ride_data_1: Dict[str, Any],
) -> None:
    url_post_ride = fastapi_app.url_path_for("post_rides")
    resp = await client_test.post(
        url_post_ride,
        json=ride_data_1,
    )
    assert resp.status_code == status.HTTP_200_OK
    ride_id: uuid.UUID = resp.json()["ride_id"]

    url_post_request = fastapi_app.url_path_for("post_requests")
    resp = await client_test0.post(
        url_post_request,
        json=request_data_1,
    )
    assert resp.status_code == status.HTTP_200_OK
    assert len(resp.json()["matches"]) > 0
    request_id: uuid.UUID = resp.json()["request_id"]

    url_post_join = fastapi_app.url_path_for(
        "post_ride_id_joins",
        ride_id=ride_id,
    )
    resp = await client_test0.post(
        url_post_join,
        json={
            "request_id": str(request_id),
        },
    )
    assert resp.status_code == status.HTTP_200_OK

    delete_user_data_url = fastapi_app.url_path_for("delete_user_me_data")
    resp = await client_test0.delete(delete_user_data_url)
    assert resp.status_code == status.HTTP_200_OK

    url_get_user_me = fastapi_app.url_path_for("users:current_user")
    resp = await client_test.get(url_get_user_me)
    assert resp.status_code == status.HTTP_200_OK
    test_user_id = resp.json()["id"]

    resp = await client_test0.get(url_get_user_me)
    assert resp.status_code == status.HTTP_200_OK
    test0_user_id = resp.json()["id"]

    requests_dao = RequestsDAO(dbsession)
    requests = await requests_dao.get_saved_request_by_user_id(test0_user_id, limit=100)
    assert len(requests) == 0

    joins_dao = JoinsDAO(dbsession)
    joins = await joins_dao.get_pending_joins_by_request_id(request_id)
    assert len(joins) == 0

    resp = await client_test.delete(delete_user_data_url)
    assert resp.status_code == status.HTTP_200_OK

    rides_dao = RidesDAO(dbsession)
    rides = await rides_dao.get_saved_ride_model_by_user_id(test_user_id, limit=100)
    assert len(rides) == 0
