from typing import Any

import httpx
import pytest
from fastapi import FastAPI, status
from fastapi.testclient import TestClient
from httpx import AsyncClient, Cookies
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession

from karpo_backend.db.dao.requests_dao import RequestsDAO
from karpo_backend.web.api.requests.schema import PostRequestsResponse


@pytest.mark.anyio
async def test_creation(
    fastapi_app: FastAPI,
    client_test: AsyncClient,
    dbsession: AsyncSession,
) -> None:
    """Tests requests instance creation."""
    url = fastapi_app.url_path_for("post_requests")
    resp = await client_test.post(
        url,
        json={
            "time": "2023-12-08T02:56:46.252Z",
            "origin": {
                "latitude": 25.019378,
                "longitude": 121.541824,
                "description": "De-Tian Building",
            },
            "destination": {
                "latitude": 25.03321,
                "longitude": 121.54354,
                "description": "Daan Station",
            },
            "num_passengers": 1,
        },
    )
    assert resp.status_code == status.HTTP_200_OK

    try:
        resp_obj = PostRequestsResponse.model_validate(resp.json())
    except ValidationError:
        pytest.fail("invalid response")

    dao = RequestsDAO(dbsession)
    resp_db_obj = await dao.get_requests_model_by_id(resp_obj.request_id)
    assert resp_db_obj is not None
