import datetime
import uuid
from typing import Literal

from fastapi import APIRouter, HTTPException
from fastapi.param_functions import Depends

from karpo_backend.db.dao.requests_dao import RequestsDAO
from karpo_backend.db.dao.joins_dao import JoinsDAO
# from karpo_backend.db.dao.rides_dao import RidesDAO
from karpo_backend.db.models.users import User, current_active_user  # type: ignore
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

# to be implemented (add joins entry)
@router.post(
    "/{ride_id}/joins",
    responses={404: {"description": "nonexistent ride_id or wrong permissions"}},
    tags=["passenger"],
)
async def post_ride_id_joins(
    ride_id: uuid.UUID,
    req: PostRideIdJoinsRequest,
    joins_dao: JoinsDAO = Depends(),
    # rides_dao: RidesDAO = Depends(),
    requests_dao: RequestsDAO = Depends(),
    user: User = Depends(current_active_user),
) -> PostRideIdJoinsResponse:
    """
    For a passenger to join a ride specified by `ride_id`.

    #### Query parameters:
    + **ride_id**: specifying which ride to join

    #### Request body:
    + **request_id**

    #### Response:
    + **join_id**: the id for the created join record
    """
    request = await requests_dao.get_requests_model_by_id(req.request_id)
    if request is None:
        raise HTTPException(status_code=404, detail="Item not found")

    if request.user_id != user.id:
        raise HTTPException(status_code=403, detail="Permission denied")
        

    join_id = await joins_dao.create_join_model(
        user_id=user.id,
        ride_id=ride_id,
        request_id=req.request_id,
    )
    return PostRideIdJoinsResponse(join_id=join_id)

# to be implemented (get join id status)
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
    joins_dao: JoinsDAO = Depends(),
    requests_dao: RequestsDAO = Depends(), # can add user_id to joins table ??
    user: User = Depends(current_active_user),
) -> GetRideIdJoinIdStatusResponse:
    """Get the status of a join request."""
    join = joins_dao.get_joins_model_by_id(join_id)
    if join is None:
        raise HTTPException(status_code=404, detail="Item not found")

    request = requests_dao.get_requests_model_by_id(join.request_id)
    if request.user_id != user.id:
        raise HTTPException(status_code=403, detail="Permission denied")
    
    return GetRideIdJoinIdStatusResponse(driver_response=join.status)


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
    ride_id: uuid.UUID,
    status: Literal["pending", "accepted", "rejected", "all"]
) -> GetRideJoinsResponse:
    """
    Get matches for the request specified `request_id`.

    #### Query parameters:
    + **ride_id**: ride want to query.
    + **status**: which status of joins want to get.
    """
    
    raise NotImplementedError("QQ")

# to be implemented (update join status)
@router.put("/{ride_id}/joins/{join_id}/status", tags=["driver"])
async def put_ride_id_joins_join_id_status(
    ride_id: uuid.UUID,
    join_id: uuid.UUID,
    req: PutRideIdJoinsJoinIdStatusRequest,
    # rides_dao: RidesDAO = Depends(),
    joins_dao: JoinsDAO = Depends(),
    user: User = Depends(current_active_user),
) -> None:
    """
    Accept or reject a join request specified by `join_id` and `ride_id`.
    
    #### Request Body:
    + **action**: `"reject"` or `"accept"`.
    """

    # ride = rides_dao.get_rides_model_by_id(ride_id)
    # if ride is None:
    #     raise HTTPException(status_code=404, detail="Item not found")
    # if ride.user_id != user.id:
    #     raise HTTPException(status_code=403, detail="Permission denied")
    
    # Todo: need to check if there is a vacant seat

    join = joins_dao.get_joins_model_by_id(join_id)
    if join is None:
        raise HTTPException(status_code=404, detail="Item not found")
    if join.ride_id != ride_id:
        raise HTTPException(status_code=403, detail="Permission denied")
    
    joins_dao.put_joins_model_by_id(join_id, req.action)


# to be implemented ("update" a join entry)
# @router.put("/{ride_id}/joins/{join_id}/accept", tags=["driver"])
# async def put_ride_id_joins_join_id_accept(
#     ride_id: uuid.UUID,
#     join_id: uuid.UUID,
# ) -> None:
#     """Accept a join request specified by `join_id` and `ride_id`"""
#     raise NotImplementedError("QQ")

# # to be implemented ("update" a join entry)
# @router.put("/{ride_id}/joins/{join_id}/reject", tags=["driver"])
# async def put_ride_id_joins_join_id_reject(
#     ride_id: uuid.UUID,
#     join_id: uuid.UUID,
# ) -> None:
#     """Reject a join request specified by `join_id` and `ride_id`"""
#     raise NotImplementedError("QQ")


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
