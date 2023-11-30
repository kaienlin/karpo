import datetime
import uuid
from typing import Literal

from fastapi import APIRouter

from karpo_backend.web.api.rides.schema import (  # noqa: WPS235
    GetRideIdJoinIdStatusResponse,
    GetRideIdResponse,
    GetRideIdScheduleResponse,
    GetRideIdStatusResponse,
    GetRideJoinsResponse,
    GetRideMessagesResponse,
    GetRideSavedRidesResponse,
    PatchRideIdStatusRequest,
    PostCommentsRequest,
    PostRideIdJoinsRequest,
    PostRideIdJoinsResponse,
    PostRideMessagesRequest,
    PostRidesRequest,
    PostRidesResponse,
    PutRideIdJoinsJoinIdStatusRequest,
)

router = APIRouter()


@router.post(
    "/{ride_id}/joins",
    responses={404: {"description": "nonexistent ride_id or wrong permissions"}},
    tags=["passenger"],
)
async def post_ride_id_joins(
    req: PostRideIdJoinsRequest,
) -> PostRideIdJoinsResponse:
    """Request to join the ride specified by `ride_id`."""
    raise NotImplementedError("QQ")


@router.get(
    "/{ride_id}/joins/{join_id}/status",
    responses={
        404: {"description": "nonexistent ride_id,join_id or wrong permissions"},
    },
    tags=["passenger"],
)
async def get_ride_id_join_id_status(
    ride_id: uuid.UUID,
    join_id: uuid.UUID,
) -> GetRideIdJoinIdStatusResponse:
    """Get the status of a join request."""
    raise NotImplementedError("QQ")


@router.get(
    "/{ride_id}/status",
    responses={404: {"description": "nonexistent ride_id or wrong permissions"}},
    tags=["passenger"],
)
async def get_ride_id_status(ride_id: uuid.UUID) -> GetRideIdStatusResponse:
    """Get the dynamic status (location, phase) of a ride."""
    raise NotImplementedError("QQ")


@router.get(
    "/{ride_id}/messages",
    response_model=GetRideMessagesResponse,
    tags=["chat"],
)
async def get_chatroom_messages(
    ride_id: uuid.UUID,
    from_time: datetime.datetime,
) -> GetRideMessagesResponse:
    """Get Chatroom messages

    :param ride_id: id of ride, tpye is uuid.UUID.
    :param from_time: time when the messages need to return from.
    """
    raise NotImplementedError("QQ")


@router.post("/{ride_id}/messages", tags=["chat"])
async def post_chatroom_messages(
    ride_id: uuid.UUID,
    req: PostRideMessagesRequest,
) -> None:
    """Post Chatroom messages"""
    raise NotImplementedError("QQ")


@router.post("/", response_model=PostRidesResponse, tags=["driver"])
async def post_rides(
    req: PostRidesRequest,
) -> PostRidesResponse:
    """司機發起行程."""
    raise NotImplementedError("QQ")


@router.get("/{ride_id}", tags=["driver", "passenger"])
async def get_ride_id(ride_id: uuid.UUID) -> GetRideIdResponse:
    """Get the ride specified by `ride_id`."""
    raise NotImplementedError("QQ")


@router.post("/{ride_id}/comments", tags=["driver", "passenger"])
async def post_comments(
    ride_id: uuid.UUID,
    req: PostCommentsRequest,
) -> None:
    """對參與該行程的用戶添加評論"""
    raise NotImplementedError("QQ")


@router.get("/saved_rides", response_model=GetRideSavedRidesResponse, tags=["driver"])
async def get_saved_rides(
    driver_id: uuid.UUID,
) -> GetRideSavedRidesResponse:
    """取得過去行程

    :param driver_id: id of driver.
    """
    raise NotImplementedError("QQ")


@router.get("/{ride_id}/joins", response_model=GetRideJoinsResponse, tags=["driver"])
async def get_ride_id_joins(
    ride_id: uuid.UUID, status: Literal["pending", "accepted", "rejected", "all"]
) -> GetRideJoinsResponse:
    """
    Get matches for the request specified `request_id`.

    #### Query parameters:
    + **ride_id**: ride want to query.
    + **status**: which status of joins want to get.

    """
    raise NotImplementedError("QQ")


@router.put("/{ride_id}/joins/{join_id}/status", tags=["driver"])
async def put_ride_id_joins_join_id_status(
    ride_id: uuid.UUID,
    join_id: uuid.UUID,
    req: PutRideIdJoinsJoinIdStatusRequest,
) -> None:
    """Accept or Reject a join request specified by `join_id` and `ride_id`

    #### Request Body:
    + **action**: action to do.
    """
    raise NotImplementedError("QQ")


@router.patch("/{ride_id}/status", tags=["driver"])
async def patch_ride_id_status(
    ride_id: uuid.UUID,
    req: PatchRideIdStatusRequest,
) -> None:
    """
    Update the driver's status (position, phase).

    #### Request Body:
    + **position**: the driver's current position.
    + **phase**: a phase index on the schedule(/rides/{ride_id}/schedule).

    #### Example values for `phase`:
    + -1: not yet departed.
    + 0: pick up first passenger, i.e. depart.
    + len(schedule): arrive driver's destination.
    """
    raise NotImplementedError("QQ")


@router.get(
    "/{ride_id}/schedule",
    response_model=GetRideIdScheduleResponse,
    tags=["driver", "passenger"],
)
async def get_ride_id_schedule(ride_id: uuid.UUID) -> GetRideIdScheduleResponse:
    """Get a list of stopovers and current position specified by `ride_id`."""
    raise NotImplementedError("QQ")
