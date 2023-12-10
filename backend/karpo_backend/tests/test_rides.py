from typing import Any, Dict, List

import httpx
import pytest
from fastapi import FastAPI, status
from fastapi.testclient import TestClient
from httpx import AsyncClient, Cookies
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession

from karpo_backend.db.dao.rides_dao import RidesDAO
from karpo_backend.web.api.rides.schema import PostRidesResponse, GetRideSavedRidesResponse


@pytest.mark.anyio
async def test_creation(
    ride_data_1 : Dict,
    fastapi_app: FastAPI,
    client_test: AsyncClient,
    dbsession: AsyncSession,
) -> None:
    """Tests rides instance creation."""
    url = fastapi_app.url_path_for("post_rides")
    
    resp = await client_test.post(
        url,
        json=ride_data_1,
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
    ride_datas: List[Dict],
    fastapi_app: FastAPI,
    client_test: AsyncClient,
    dbsession: AsyncSession,
) -> None:
    """Tests get saved rides by user id."""

    for ride_data in ride_datas:
        user_id = await test_creation(ride_data, fastapi_app, client_test, dbsession)
    
    url = f"/api/rides/saved_rides/{user_id}"

    limit = 10
    resp = await client_test.get(
        url=url,
        params={
            "user_id" : user_id,
            "limit": limit,
        },
    )
    assert resp.status_code == status.HTTP_200_OK

    try:
        resp_obj = GetRideSavedRidesResponse.model_validate(resp.json())
    except ValidationError:
        pytest.fail("invalid response")
    
    assert resp_obj is not None
    resp_saved_rides = resp_obj.saved_rides
    assert len(resp_saved_rides) == min(len(ride_datas), limit), "The length of the response is wrong"
    
    for i in range(len(resp_saved_rides) - 1):
        assert resp_saved_rides[i].last_update_time >= resp_saved_rides[i+1].last_update_time, f"The results must be sorted from newest to oldest based on the last update time"