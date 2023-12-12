import datetime
from typing import Dict, Tuple

import pytest
from fastapi import FastAPI, status
from httpx import AsyncClient
from pydantic import ValidationError
from shapely import Point, wkb
from sqlalchemy.ext.asyncio import AsyncSession

from karpo_backend.db.dao.requests_dao import RequestsDAO
from karpo_backend.web.api.requests.schema import (
    GetRequestIdMatchesResponse,
    PostRequestsResponse,
)
from karpo_backend.web.api.rides.schema import (
    GetRideIdJoinIdStatusResponse,
    GetRideJoinsResponse,
    PostRideIdJoinsResponse,
    PostRidesResponse,
)


@pytest.mark.anyio
@pytest.mark.parametrize(
    "driver_action",
    ["accept", "reject"],
)
async def test_post_joins_and_do_action(
    ride_data_1: Dict,
    request_data_1: Dict,
    driver_action: str,
    fastapi_app: FastAPI,
    client_test: AsyncClient,
    client_test0: AsyncClient,
) -> None:
    # create some rides
    post_rides_url = fastapi_app.url_path_for("post_rides")
    post_rides_req_body = ride_data_1
    resp = await client_test0.post(
        url=post_rides_url,
        json=post_rides_req_body,
    )
    assert resp.status_code == status.HTTP_200_OK
    try:
        post_rides_resp_obj = PostRidesResponse.model_validate(resp.json())
    except ValidationError:
        pytest.fail("invalid response")

    # create request
    post_requests_url = fastapi_app.url_path_for("post_requests")
    post_requests_req_body = request_data_1
    resp = await client_test.post(
        post_requests_url,
        json=post_requests_req_body,
    )
    assert resp.status_code == status.HTTP_200_OK

    try:
        post_requests_resp_obj = PostRequestsResponse.model_validate(resp.json())
    except ValidationError:
        pytest.fail("invalid response")

    matched = len(post_requests_resp_obj.matches) == 1
    if matched:
        assert post_requests_resp_obj.matches[0].ride_id == post_rides_resp_obj.ride_id
        matched_ride_id = post_requests_resp_obj.matches[0].ride_id

        # post a join
        post_joins_url = fastapi_app.url_path_for(
            "post_ride_id_joins",
            ride_id=matched_ride_id,
        )
        post_joins_req_body = {"request_id": str(post_requests_resp_obj.request_id)}
        resp = await client_test.post(url=post_joins_url, json=post_joins_req_body)
        assert resp.status_code == status.HTTP_200_OK

        try:
            post_joins_resp_obj = PostRideIdJoinsResponse.model_validate(resp.json())
        except ValidationError:
            pytest.fail("invalid response")

        # pessenger check join status
        get_join_status_url = fastapi_app.url_path_for(
            "get_ride_id_join_id_status",
            ride_id=matched_ride_id,
            join_id=post_joins_resp_obj.join_id,
        )
        resp = await client_test.get(url=get_join_status_url)
        assert resp.status_code == status.HTTP_200_OK
        try:
            get_join_status_resp_obj = GetRideIdJoinIdStatusResponse.model_validate(
                resp.json()
            )
        except ValidationError:
            pytest.fail("invalid response")
        assert get_join_status_resp_obj.driver_response == "pending"

        # driver check join
        get_ride_id_join_url = fastapi_app.url_path_for(
            "get_ride_id_joins",
            ride_id=matched_ride_id,
        )
        for get_joins_status in ["all", "accepted", "rejected", "pending"]:
            get_ride_id_join_req_body = {
                "status": get_joins_status,
            }
            resp = await client_test0.get(
                url=get_ride_id_join_url,
                params=get_ride_id_join_req_body,
            )
            assert resp.status_code == status.HTTP_200_OK
            try:
                get_ride_id_join_resp_obj = GetRideJoinsResponse.model_validate(
                    resp.json()
                )
            except ValidationError:
                pytest.fail("invalid response")

            assert (
                get_ride_id_join_resp_obj.num_available_seat
                == post_rides_req_body["num_seats"]
            )
            if get_joins_status in ["pending", "all"]:
                assert len(get_ride_id_join_resp_obj.joins) == 1
            else:
                assert len(get_ride_id_join_resp_obj.joins) == 0

        # driver put join status
        put_join_status_url = fastapi_app.url_path_for(
            "put_ride_id_joins_join_id_status",
            ride_id=matched_ride_id,
            join_id=post_joins_resp_obj.join_id,
        )
        put_join_status_req_body = {"action": driver_action}
        resp = await client_test0.put(
            url=put_join_status_url,
            json=put_join_status_req_body,
        )
        assert resp.status_code == status.HTTP_200_OK

        status_action_mapping = {"accept": "accepted", "reject": "rejected"}

        # pessenger check new join status
        get_join_status_url = fastapi_app.url_path_for(
            "get_ride_id_join_id_status",
            ride_id=matched_ride_id,
            join_id=post_joins_resp_obj.join_id,
        )
        resp = await client_test.get(url=get_join_status_url)
        assert resp.status_code == status.HTTP_200_OK
        try:
            get_join_status_resp_obj = GetRideIdJoinIdStatusResponse.model_validate(
                resp.json()
            )
        except ValidationError:
            pytest.fail("invalid response")
        if driver_action == "accept":
            assert get_join_status_resp_obj.driver_response == "accepted"
        if driver_action == "reject":
            assert get_join_status_resp_obj.driver_response == "rejected"

        # driver check join after action to join
        get_ride_id_join_url = fastapi_app.url_path_for(
            "get_ride_id_joins",
            ride_id=matched_ride_id,
        )
        for get_joins_status in ["all", "accepted", "rejected", "pending"]:
            get_ride_id_join_req_body = {
                "status": get_joins_status,
            }
            resp = await client_test0.get(
                url=get_ride_id_join_url,
                params=get_ride_id_join_req_body,
            )
            assert resp.status_code == status.HTTP_200_OK
            try:
                get_ride_id_join_resp_obj = GetRideJoinsResponse.model_validate(
                    resp.json()
                )
            except ValidationError:
                pytest.fail("invalid response")

            if driver_action == "accept":
                assert (
                    get_ride_id_join_resp_obj.num_available_seat
                    == post_rides_req_body["num_seats"]
                    - post_requests_req_body["num_passengers"]
                ), "num of seats left not correct."
                if get_joins_status in ["accepted", "all"]:
                    assert len(get_ride_id_join_resp_obj.joins) == 1
                else:
                    assert len(get_ride_id_join_resp_obj.joins) == 0
            if driver_action == "reject":
                assert (
                    get_ride_id_join_resp_obj.num_available_seat
                    == post_rides_req_body["num_seats"]
                ), "num of seats left not correct."
                if get_joins_status in ["rejected", "all"]:
                    assert len(get_ride_id_join_resp_obj.joins) == 1
                else:
                    assert len(get_ride_id_join_resp_obj.joins) == 0
