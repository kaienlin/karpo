import datetime
import uuid

from fastapi import APIRouter

from karpo_backend.web.api.rides.schema import (  # noqa: WPS235
    GetRideIdJoinIdStatusResponse,
    GetRideIdScheduleResponse,
    GetRideIdStatusResponse,
    GetRideJoinsResponse,
    GetRideMessagesResponse,
    GetRideSavedRidesResponse,
    PostCommentsRequest,
    PostRideIdJoinsRequest,
    PostRideIdJoinsResponse,
    PostRideMessagesRequest,
    PostRidesRequest,
    PostRidesResponse,
    PutRideIdPositionRequest,
    PutRideIdStatusRequest,
    PutRideIdStatusResponse,
)

router = APIRouter()


@router.post(
    "/{ride_id}/joins",
    responses={404: {"description": "nonexistent ride_id or wrong permissions"}},
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
)
async def get_ride_id_status(ride_id: uuid.UUID) -> GetRideIdStatusResponse:
    """Get the dynamic status (location, phase) of a ride."""
    raise NotImplementedError("QQ")


@router.get("/{ride_id}/messages", response_model=GetRideMessagesResponse)
async def get_chatroom_messages(
    ride_id: uuid.UUID,
    from_time: datetime.datetime,
) -> GetRideMessagesResponse:
    """Get Chatroom messages

    :param ride_id: id of ride, tpye is uuid.UUID.
    :param from_time: time when the messages need to return from.
    """
    raise NotImplementedError("QQ")


@router.post("/{ride_id}/messages")
async def post_chatroom_messages(
    ride_id: uuid.UUID,
    req: PostRideMessagesRequest,
) -> None:
    """Post Chatroom messages"""
    raise NotImplementedError("QQ")


@router.post("/", response_model=PostRidesResponse)
async def post_rides(
    req: PostRidesRequest,
) -> PostRidesResponse:
    """司機發起行程."""
    raise NotImplementedError("QQ")


@router.post("/{ride_id}/comments")
async def post_comments(
    ride_id: uuid.UUID,
    req: PostCommentsRequest,
) -> None:
    """對參與該行程的用戶添加評論"""
    raise NotImplementedError("QQ")


@router.get("/saved_rides", response_model=GetRideSavedRidesResponse)
async def get_saved_rides(
    driver_id: uuid.UUID,
) -> GetRideSavedRidesResponse:
    """取得過去行程

    :param driver_id: id of driver.
    """
    raise NotImplementedError("QQ")


@router.get("/{ride_id}/joins", response_model=GetRideJoinsResponse)
async def get_ride_joins(
    ride_id: uuid.UUID,
) -> GetRideJoinsResponse:
    """得到發起邀請的乘客的訊息

    :param ride_id: id of ride.
    """
    raise NotImplementedError("QQ")


@router.put("/{ride_id}/joins/{join_id}/accept")
async def put_ride_id_joins_join_id_accept(
    ride_id: uuid.UUID,
    join_id: uuid.UUID,
) -> None:
    """Accept a join request specified by `join_id` and `ride_id`"""
    raise NotImplementedError("QQ")


@router.put("/{ride_id}/depart")
async def put_ride_id_depart(ride_id: uuid.UUID) -> None:
    """Update the ride status to departure"""
    raise NotImplementedError("QQ")


@router.put("/{ride_id}/status", response_model=PutRideIdStatusResponse)
async def put_ride_id_status(
    ride_id: uuid.UUID,
    req: PutRideIdStatusRequest,
) -> PutRideIdStatusResponse:
    """Update the next stopover specifed by `ride_id`."""
    raise NotImplementedError("QQ")


@router.put("/{ride_id}/position")
async def put_ride_id_position(
    ride_id: uuid.UUID,
    req: PutRideIdPositionRequest,
) -> None:
    """Update the driver's current position specified by `ride_id`."""
    raise NotImplementedError("QQ")


@router.get("/{ride_id}/schedule", response_model=GetRideIdScheduleResponse)
async def get_ride_id_schedule(ride_id: uuid.UUID) -> GetRideIdScheduleResponse:
    """Get a list of stopovers and current position specified by `ride_id`."""
    raise NotImplementedError("QQ")
