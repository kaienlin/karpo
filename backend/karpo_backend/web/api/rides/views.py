import uuid

from fastapi import APIRouter

from karpo_backend.web.api.rides.schema import (
    GetRideIdJoinIdStatusResponseModel,
    GetRideIdStatusResponseModel,
    PostRideIdJoinsRequestModel,
    PostRideIdJoinsResponseModel,
)

router = APIRouter()


@router.post(
    "/{ride_id}/joins",
    responses={404: {"description": "nonexistent ride_id or wrong permissions"}},
)
async def post_ride_id_joins(
    req: PostRideIdJoinsRequestModel,
) -> PostRideIdJoinsResponseModel:
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
) -> GetRideIdJoinIdStatusResponseModel:
    """Get the status of a join request."""
    raise NotImplementedError("QQ")


@router.get(
    "/{ride_id}/status",
    responses={404: {"description": "nonexistent ride_id or wrong permissions"}},
)
async def get_ride_id_status(ride_id: uuid.UUID) -> GetRideIdStatusResponseModel:
    """Get the dynamic status (location, phase) of a ride."""
    raise NotImplementedError("QQ")
