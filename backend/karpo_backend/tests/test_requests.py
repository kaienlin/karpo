import datetime
from typing import Tuple

import pytest
from fastapi import FastAPI, status
from httpx import AsyncClient
from pydantic import ValidationError
from shapely import Point, wkb
from sqlalchemy.ext.asyncio import AsyncSession

from karpo_backend.db.dao.requests_dao import RequestsDAO
from karpo_backend.web.api.requests.schema import (
    GetRequestIdMatchesResponse,
    GetRequestIdResponse,
    PostRequestsRequest,
    PostRequestsResponse,
)
from karpo_backend.web.api.rides.schema import PostRidesResponse


@pytest.mark.anyio
async def test_creation_and_read_ok(
    fastapi_app: FastAPI,
    client_test: AsyncClient,
    dbsession: AsyncSession,
) -> None:
    """Tests requests instance creation."""
    url_post = fastapi_app.url_path_for("post_requests")
    req_body = {
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
    }
    resp = await client_test.post(
        url_post,
        json=req_body,
    )
    assert resp.status_code == status.HTTP_200_OK

    try:
        resp_obj = PostRequestsResponse.model_validate(resp.json())
    except ValidationError:
        pytest.fail("invalid response")

    dao = RequestsDAO(dbsession)
    db_obj = await dao.get_requests_model_by_id(resp_obj.request_id)
    assert db_obj is not None
    assert db_obj.start_time == datetime.datetime.fromisoformat(req_body["time"])

    origin_point: Point = wkb.loads(bytes(db_obj.origin.data))
    assert origin_point.x == req_body["origin"]["longitude"]
    assert origin_point.y == req_body["origin"]["latitude"]
    assert db_obj.origin_description == req_body["origin"]["description"]

    destination_point: Point = wkb.loads(bytes(db_obj.destination.data))
    assert destination_point.x == req_body["destination"]["longitude"]
    assert destination_point.y == req_body["destination"]["latitude"]
    assert db_obj.destination_description == req_body["destination"]["description"]

    assert db_obj.num_passengers == req_body["num_passengers"]

    url_get = fastapi_app.url_path_for("get_request_id", request_id=resp_obj.request_id)
    resp_get = await client_test.get(url_get)
    assert resp_get.status_code == status.HTTP_200_OK
    try:
        resp_get_obj = GetRequestIdResponse.model_validate(resp_get.json())
    except ValidationError:
        pytest.fail("invalid response")

    assert resp_get_obj.is_active
    req_body_obj = PostRequestsRequest.model_validate(req_body)
    resp_get_obj_converted = PostRequestsRequest.model_validate(resp_get.json())
    assert req_body_obj == resp_get_obj_converted


@pytest.mark.anyio
async def test_creation_conflict(
    fastapi_app: FastAPI,
    client_test: AsyncClient,
) -> None:
    url = fastapi_app.url_path_for("post_requests")
    req_body = {
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
    }
    resp = await client_test.post(
        url,
        json=req_body,
    )
    assert resp.status_code == status.HTTP_200_OK

    resp2 = await client_test.post(
        url,
        json=req_body,
    )
    assert resp2.status_code == status.HTTP_409_CONFLICT


@pytest.mark.anyio
@pytest.mark.parametrize(
    ["req_start_time", "req_origin", "matched"],
    [
        ("2023-12-08T02:56:46.252Z", (0.0015, -0.0025), True),
        ("2023-12-08T02:57:46.252Z", (0.0015, -0.0025), False),
        ("2023-12-08T02:00:00.000Z", (0.0015, 0.03), False),
    ],
)
async def test_get_matches(
    fastapi_app: FastAPI,
    req_start_time: str,
    req_origin: Tuple[float, float],
    matched: bool,
    client_test: AsyncClient,
    client_test0: AsyncClient,
) -> None:
    # create some rides
    post_rides_url = fastapi_app.url_path_for("post_rides")
    post_rides_req_body = {
        "origin": {
            "latitude": 0.001,
            "longitude": 0,
            "description": "A",
        },
        "destination": {
            "latitude": -0.005,
            "longitude": 0.003,
            "description": "B",
        },
        "route": {
            "steps": [
                [(0, 0.001), (0.001, 0)],
                [(0.001, 0), (0.001, -0.002), (0.001, -0.004)],
                [(0.001, -0.004), (0.002, -0.004), (0.003, -0.005)],
            ],
            "durations": [
                30,
                180,
                100,
            ],
        },
        "intermediates": [
            {
                "latitude": 0,
                "longitude": 0.001,
                "description": "intermediate 1"
            },
            {
                "latitude": -0.004,
                "longitude": 0.001,
                "description": "intermediate 2"
            },
        ],
        "departure_time": "2023-12-08T02:56:00.000Z",
        "num_seats": 1,
    }
    resp = await client_test0.post(
        url=post_rides_url,
        json=post_rides_req_body,
    )
    assert resp.status_code == status.HTTP_200_OK
    try:
        post_rides_resp_obj = PostRidesResponse.model_validate(resp.json())
    except ValidationError:
        pytest.fail("invalid response")

    post_requests_url = fastapi_app.url_path_for("post_requests")
    post_requests_req_body = {
        "time": req_start_time,
        "origin": {
            "latitude": req_origin[1],
            "longitude": req_origin[0],
            "description": "C",
        },
        "destination": {
            "latitude": -0.006,
            "longitude": 0.004,
            "description": "D",
        },
        "num_passengers": 1,
    }
    resp = await client_test.post(
        post_requests_url,
        json=post_requests_req_body,
    )
    assert resp.status_code == status.HTTP_200_OK

    try:
        post_requests_resp_obj = PostRequestsResponse.model_validate(resp.json())
    except ValidationError:
        pytest.fail("invalid response")

    assert len(post_requests_resp_obj.matches) == (1 if matched else 0)
    if matched:
        assert post_requests_resp_obj.matches[0].ride_id == post_rides_resp_obj.ride_id

    get_match_url = fastapi_app.url_path_for(
        "get_request_id_matches", request_id=post_requests_resp_obj.request_id
    )
    resp = await client_test.get(get_match_url)
    assert resp.status_code == status.HTTP_200_OK

    try:
        get_match_resp_obj = GetRequestIdMatchesResponse.model_validate(resp.json())
    except ValidationError:
        pytest.fail("invalid response")

    assert len(get_match_resp_obj.matches) == (1 if matched else 0)
    if matched:
        assert get_match_resp_obj.matches[0].ride_id == post_rides_resp_obj.ride_id
        assert get_match_resp_obj.matches[0].status == "unasked"
        assert get_match_resp_obj.matches[0].join_id is None
