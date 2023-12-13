import datetime
from typing import Any, Dict, List, Tuple

import httpx
import pytest
from fastapi import FastAPI, status
from fastapi.testclient import TestClient
from httpx import AsyncClient, Cookies
from pydantic import ValidationError
from shapely import LineString, Point, wkb, wkt
from sqlalchemy.ext.asyncio import AsyncSession

from karpo_backend.db.dao.rides_dao import RidesDAO
from karpo_backend.web.api.requests.schema import (
    PostRequestsResponse,
)
from karpo_backend.web.api.rides.schema import (
    GetRideSavedRidesResponse,
    GetRideIdStatusResponse,
    GetRideIdScheduleResponse,
    GetRideIdResponse,
    GetRideMessagesResponse,
    PostRidesResponse,
    PostRideIdJoinsResponse,
)


@pytest.mark.anyio
async def test_creation(
    ride_data_1: Dict,
    fastapi_app: FastAPI,
    client_test: AsyncClient,
    dbsession: AsyncSession,
) -> None:
    """Tests rides instance creation."""
    # post a ride
    req_body = ride_data_1
    url = fastapi_app.url_path_for("post_rides")
    resp = await client_test.post(
        url,
        json=req_body,
    )
    assert resp.status_code == status.HTTP_200_OK

    try:
        resp_obj = PostRidesResponse.model_validate(resp.json())
    except ValidationError:
        pytest.fail("invalid response")
    dao = RidesDAO(dbsession)
    resp_db_obj = await dao.get_ride_model_by_id(resp_obj.ride_id)

    # check ride in db is correct
    assert resp_db_obj is not None
    assert req_body.get("label", None) == None or resp_db_obj.label == req_body["label"]
    assert resp_db_obj.num_seats == req_body["num_seats"]

    origin_point: Point = wkb.loads(bytes(resp_db_obj.origin.data))
    assert origin_point.x == req_body["origin"]["longitude"]
    assert origin_point.y == req_body["origin"]["latitude"]
    assert resp_db_obj.origin_description == req_body["origin"]["description"]

    destination_point: Point = wkb.loads(bytes(resp_db_obj.destination.data))
    assert destination_point.x == req_body["destination"]["longitude"]
    assert destination_point.y == req_body["destination"]["latitude"]
    assert resp_db_obj.destination_description == req_body["destination"]["description"]

    point_idx = 0
    db_route: LineString = wkb.loads(bytes(resp_db_obj.route.data))
    db_route = list(db_route.coords)
    db_route_timestamps = resp_db_obj.route_timestamps
    assert len(db_route) == len(resp_db_obj.route_timestamps)
    for step, duration in zip(
        req_body["route"]["steps"], req_body["route"]["durations"]
    ):
        if point_idx == 0:  ## check origin
            assert db_route[point_idx] == step[0]
            point_idx += 1

        db_start_time_in_step = db_route_timestamps[point_idx - 1]
        for req_point in step[1:]:  ## check other points
            assert db_route[point_idx] == req_point
            point_idx += 1
        db_end_time_in_step = db_route_timestamps[point_idx - 1]

        db_duration_in_step = (
            db_end_time_in_step - db_start_time_in_step
        ).total_seconds()
        assert abs(db_duration_in_step - duration) <= 0.00001  ## error of a duration

    for intermediate, db_intermediate, db_intermediate_description in zip(
        req_body["intermediates"],
        resp_db_obj.intermediates,
        resp_db_obj.intermediate_descriptions,
    ):
        db_intermediate_point: Point = wkt.loads(db_intermediate)
        assert db_intermediate_point.x == intermediate["longitude"]
        assert db_intermediate_point.y == intermediate["latitude"]
        assert db_intermediate_description == intermediate["description"]

    assert resp_db_obj.departure_time == datetime.datetime.fromisoformat(
        req_body["departure_time"].replace("Z", "+00:00")
    )

    # check get ride
    get_ride_url = fastapi_app.url_path_for("get_ride_id", ride_id=resp_obj.ride_id)
    resp = await client_test.get(
        url=get_ride_url,
    )
    assert resp.status_code == status.HTTP_200_OK
    try:
        resp_obj = GetRideIdResponse.model_validate(resp.json())
    except ValidationError:
        pytest.fail("invalid response")
    assert req_body.get("label", None) == None or resp_db_obj.label == req_body["label"]
    assert resp_obj.ride.num_seats == req_body["num_seats"]
    assert resp_obj.ride.departure_time == datetime.datetime.fromisoformat(
        req_body["departure_time"].replace("Z", "+00:00")
    )

    return resp_db_obj.user_id


@pytest.mark.anyio
@pytest.mark.parametrize(
    "limit",
    [1, 2, 5],
)
async def test_get_saved_rides_by_user_id(
    limit: int,
    ride_datas: List[Dict],
    fastapi_app: FastAPI,
    client_test: AsyncClient,
    dbsession: AsyncSession,
) -> None:
    """Tests get saved rides by user id."""

    for ride_data in ride_datas:
        user_id = await test_creation(ride_data, fastapi_app, client_test, dbsession)

    url = fastapi_app.url_path_for("get_saved_rides", user_id=user_id)
    resp = await client_test.get(
        url=url,
        params={
            "user_id": user_id,
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
    assert len(resp_saved_rides) == min(
        len(ride_datas), limit
    ), "The length of the response is wrong"

    for i in range(len(resp_saved_rides) - 1):
        assert (
            resp_saved_rides[i].last_update_time
            >= resp_saved_rides[i + 1].last_update_time
        ), f"The results must be sorted from newest to oldest based on the last update time"


@pytest.mark.anyio
@pytest.mark.parametrize(
    ["driver_position", "driver_phase"],
    [
        ((0.0015, -0.0025), 2),
        ((0.0015, -0.0025), 3),
        ((0.0015, 0.03), 1),
    ],
)
async def test_get_and_update_ride_status(
    driver_position: Tuple[float, float],
    driver_phase: int,
    ride_data_1: Dict,
    fastapi_app: FastAPI,
    client_test: AsyncClient,
) -> None:
    """Tests rides instance creation."""
    # post a ride
    req_body = ride_data_1
    url = fastapi_app.url_path_for("post_rides")
    resp = await client_test.post(
        url,
        json=req_body,
    )
    assert resp.status_code == status.HTTP_200_OK

    try:
        resp_obj = PostRidesResponse.model_validate(resp.json())
    except ValidationError:
        pytest.fail("invalid response")
    post_ride_id = resp_obj.ride_id

    # check wrong ride status
    wrong_ride_id = str(post_ride_id)[:-1] + "e" if str(post_ride_id)[-1] == "0" else str(post_ride_id)[:-1] + "0"
    get_ride_id_status_url = fastapi_app.url_path_for("get_ride_id_status", ride_id=wrong_ride_id)
    resp = await client_test.get(
        url=get_ride_id_status_url,
    )
    assert resp.status_code == status.HTTP_404_NOT_FOUND

    # check origin ride status
    get_ride_id_status_url = fastapi_app.url_path_for("get_ride_id_status", ride_id=post_ride_id)
    resp = await client_test.get(
        url=get_ride_id_status_url,
    )
    assert resp.status_code == status.HTTP_200_OK

    try:
        resp_obj = GetRideIdStatusResponse.model_validate(resp.json())
    except ValidationError:
        pytest.fail("invalid response")
    assert resp_obj.phase == -2
    assert resp_obj.driver_position.latitude == req_body["origin"]["latitude"]
    assert resp_obj.driver_position.longitude == req_body["origin"]["longitude"]

    # update ride status
    patch_ride_id_status_url = fastapi_app.url_path_for("patch_ride_id_status", ride_id=post_ride_id)
    patch_ride_id_status_req_body = {
        "driver_position": {
            "latitude": driver_position[1],
            "longitude": driver_position[0],
        },
        "phase": driver_phase,
    }
    resp = await client_test.patch(
        url=patch_ride_id_status_url,
        json=patch_ride_id_status_req_body,
    )
    assert resp.status_code == status.HTTP_200_OK


    # check new ride status
    get_ride_id_status_url = fastapi_app.url_path_for("get_ride_id_status", ride_id=post_ride_id)
    resp = await client_test.get(
        url=get_ride_id_status_url,
    )
    assert resp.status_code == status.HTTP_200_OK

    try:
        resp_obj = GetRideIdStatusResponse.model_validate(resp.json())
    except ValidationError:
        pytest.fail("invalid response")
    assert resp_obj.phase == driver_phase
    assert resp_obj.driver_position.latitude == driver_position[1]
    assert resp_obj.driver_position.longitude == driver_position[0]
    

@pytest.mark.anyio
@pytest.mark.parametrize(
    "driver_action",
    ["accept", "reject"],
)
async def test_get_schedule(
    ride_data_1: Dict,
    request_data_1: Dict,
    driver_action: str,
    fastapi_app: FastAPI,
    client_test: AsyncClient,
    client_test0: AsyncClient,
) -> None:
    # create ride
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

    match_len = len(post_requests_resp_obj.matches)
    if match_len > 0:
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

        # check schedule if accept
        if driver_action == "accept":
            get_schedule_url = fastapi_app.url_path_for(
                "get_ride_id_schedule",
                ride_id=matched_ride_id,
            )
            resp = await client_test.get(url=get_schedule_url)
            assert resp.status_code == status.HTTP_200_OK
            try:
                get_schedule_resp_obj = GetRideIdScheduleResponse.model_validate(
                    resp.json()
                )
            except ValidationError:
                pytest.fail("invalid response")
            assert len(get_schedule_resp_obj.schedule) == 2 * match_len
            for i in range(1, len(get_schedule_resp_obj.schedule)):
                get_schedule_resp_obj.schedule[i-1].time <= get_schedule_resp_obj.schedule[i].time

    # test no schedule 
    if match_len == 0 or driver_action == "reject":
        get_schedule_url = fastapi_app.url_path_for(
            "get_ride_id_schedule",
            ride_id=matched_ride_id,
        )
        resp = await client_test.get(url=get_schedule_url)
        assert resp.status_code == status.HTTP_200_OK
        try:
            get_schedule_resp_obj = GetRideIdScheduleResponse.model_validate(
                resp.json()
            )
        except ValidationError:
            pytest.fail("invalid response")
        assert len(get_schedule_resp_obj.schedule) == 0


@pytest.mark.anyio
@pytest.mark.parametrize(
    ["user1_contents", "user1_send_times", "user2_contents", "user2_send_times", "from_time"],
    [
        (["1", "3"], ["2023-12-08T02:56:00.000Z", "2023-12-08T02:59:00.000Z"], ["2"], ["2023-12-08T02:58:00.000Z"], "2023-12-08T02:57:00.000Z"),
        (["1", "3"], ["2023-12-08T02:56:00.000Z", "2023-12-08T02:59:00.000Z"], ["2"], ["2023-12-08T02:58:00.000Z"], "2023-12-08T02:54:00.000Z"),
    ],
)
async def test_post_and_get_chatroom_messages(
    user1_contents: List[str],
    user1_send_times: List[datetime.datetime],
    user2_contents: List[str],
    user2_send_times: List[datetime.datetime],
    from_time: datetime.datetime,
    ride_data_1: Dict,
    fastapi_app: FastAPI,
    client_test: AsyncClient,
    client_test0: AsyncClient,
) -> None:
    """Tests rides instance creation."""
    # post a ride
    req_body = ride_data_1
    url = fastapi_app.url_path_for("post_rides")
    resp = await client_test.post(
        url,
        json=req_body,
    )
    assert resp.status_code == status.HTTP_200_OK

    try:
        resp_obj = PostRidesResponse.model_validate(resp.json())
    except ValidationError:
        pytest.fail("invalid response")
    post_ride_id = resp_obj.ride_id

    # post chatroom_messages 
    for client_user, contents, send_times in zip([client_test0, client_test], [user1_contents, user2_contents], [user1_send_times, user2_send_times]):
        resp = await client_user.get(url="/api/users/me")
        assert resp.status_code == status.HTTP_200_OK
        user_id = resp.json()["id"]

        for content, send_time in zip(contents, send_times):
            post_message_url = fastapi_app.url_path_for("post_chatroom_messages", ride_id=post_ride_id)
            post_rides_req_body = {
                "chat_record": {
                    "user_id": user_id,
                    "content": content,
                    "time": send_time,
                }
            }
            resp = await client_user.post(
                url=post_message_url,
                json=post_rides_req_body,
            )
            assert resp.status_code == status.HTTP_200_OK
            
    # get chatroom messages
    get_messages_url = fastapi_app.url_path_for(
        "get_chatroom_messages",
        ride_id=post_ride_id,
    )
    resp = await client_test.get(
        url=get_messages_url,
        params={"from_time": from_time},
    )
    assert resp.status_code == status.HTTP_200_OK
    try:
        get_messages_resp_obj = GetRideMessagesResponse.model_validate(resp.json())
    except ValidationError:
        pytest.fail("invalid response")
    assert get_messages_resp_obj.chat_records == sorted(get_messages_resp_obj.chat_records, key=lambda record: record.time), "messages should in order."
    assert get_messages_resp_obj.chat_records[0].time >= datetime.datetime.fromisoformat(
        from_time.replace("Z", "+00:00")
    )
