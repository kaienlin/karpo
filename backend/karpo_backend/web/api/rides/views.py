import datetime
import uuid

from fastapi import APIRouter

from karpo_backend.web.api.rides.schema import (  # noqa: WPS235
    GetRideIdJoinIdStatusResponse,
    GetRideIdStatusResponse,
    GetRideJoinsResponseModel,
    GetRideMessagesResponseModel,
    GetRideSavedRidesResponseModel,
    PostCommentsRequestModel,
    PostRideIdJoinsRequest,
    PostRideIdJoinsResponse,
    PostRideMessagesRequestModel,
    PostRidesRequestModel,
    PostRidesResponseModel,
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


@router.get("/{ride_id}/messages", response_model=GetRideMessagesResponseModel)
async def get_chatroom_messages(
    ride_id: uuid.UUID,
    from_time: datetime.datetime,
) -> GetRideMessagesResponseModel:
    """Get Chatroom messages

    :param ride_id: id of ride, tpye is uuid.UUID.
    :param from_time: time when the messages need to return from.
    """
    raise NotImplementedError("QQ")


@router.post("/{ride_id}/messages")
async def post_chatroom_messages(
    req: PostRideMessagesRequestModel,
) -> None:
    """Post Chatroom messages"""
    raise NotImplementedError("QQ")


@router.post("/", response_model=PostRidesResponseModel)
async def post_rides(
    req: PostRidesRequestModel,
) -> PostRidesResponseModel:
    """司機發起行程."""
    raise NotImplementedError("QQ")


@router.post("/{ride_id}/comments")
async def post_comments(
    req: PostCommentsRequestModel,
) -> None:
    """對參與該行程的用戶添加評論"""
    raise NotImplementedError("QQ")


@router.get("/saved_rides", response_model=GetRideSavedRidesResponseModel)
async def get_saved_rides(
    driver_id: uuid.UUID,
) -> GetRideSavedRidesResponseModel:
    """取得過去行程

    :param driver_id: id of driver.
    """
    raise NotImplementedError("QQ")


@router.get("/{ride_id}/joins", response_model=GetRideJoinsResponseModel)
async def get_ride_joins(
    ride_id: uuid.UUID,
) -> GetRideJoinsResponseModel:
    """得到發起邀請的乘客的訊息

    :param ride_id: id of ride.
    """
    raise NotImplementedError("QQ")
