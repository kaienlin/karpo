from typing import Any, Dict

import httpx
import pytest
from fastapi import FastAPI, status
from fastapi.testclient import TestClient
from httpx import AsyncClient, Cookies
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession

from karpo_backend.db.dao.rides_dao import RidesDAO
from karpo_backend.web.api.rides.schema import PostRidesResponse, GetRideSavedRidesResponse


@pytest.fixture
def ride_data():
    return {
        "label": "new ride",
        "origin": {
            "latitude": 0,
            "longitude": 0,
            "description": "string"
        },
        "destination": {
            "latitude": 0,
            "longitude": 0,
            "description": "string"
        },
        "route": {
            "steps": [
                [(0, 0), (0, 1)],
                [(0, 1), (0, 2), (0, 3), (0, 5)]
            ],
            "durations": [1,2]
        },
        "waypoints": [
            (0, 0), (0, 1), (0, 5)
        ],
        "departure_time": "2023-12-09T08:22:43.556Z",
        "num_seats": 4
    }

@pytest.mark.anyio
async def test_creation(
    ride_data: Dict,
    fastapi_app: FastAPI,
    client_test: AsyncClient,
    dbsession: AsyncSession,
) -> None:
    """Tests rides instance creation."""
    url = fastapi_app.url_path_for("post_rides")
    
    resp = await client_test.post(
        url,
        json=ride_data,
    )
    assert resp.status_code == status.HTTP_200_OK

    try:
        resp_obj = PostRidesResponse.model_validate(resp.json())
    except ValidationError:
        pytest.fail("invalid response")
    dao = RidesDAO(dbsession)
    resp_db_obj = await dao.get_ride_model_by_id(resp_obj.ride_id)
    assert resp_db_obj is not None
    return resp_db_obj.user_id

@pytest.mark.anyio
async def test_get_saved_rides_by_user_id(
    ride_data: Dict,
    fastapi_app: FastAPI,
    client_test: AsyncClient,
    dbsession: AsyncSession,
) -> None:
    """Tests get saved rides by user id."""

    user_id = await test_creation(ride_data, fastapi_app, client_test, dbsession)
    
    url = f"/api/rides/saved_rides/{user_id}"

    resp = await client_test.get(
        url=url,
        params={
            "user_id" : user_id,
            "limit": 10,
        },
    )
    assert resp.status_code == status.HTTP_200_OK

    try:
        resp_obj = GetRideSavedRidesResponse.model_validate(resp.json())
    except ValidationError:
        pytest.fail("invalid response")
    
    assert resp_obj is not None