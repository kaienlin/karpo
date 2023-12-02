import datetime
import uuid
from typing import Literal, List

from fastapi import APIRouter, HTTPException, status
from fastapi.param_functions import Depends
from shapely import LineString, Point, wkb

from karpo_backend.db.dao.joins_dao import JoinsDAO
from karpo_backend.db.dao.requests_dao import RequestsDAO
from karpo_backend.db.dao.rides_dao import RidesDAO
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
    RideDTO,
)
from karpo_backend.web.api.utils import LocationDTO, LocationWithDescDTO, RouteDTO

router = APIRouter()

@router.get(
    "/{ride_id}/status",
    responses={404: {"description": "nonexistent ride_id or wrong permissions"}},
    tags=["passenger"],
)
async def get_ride_id_status(
    ride_id: uuid.UUID,
    rides_dao: RidesDAO = Depends(),
) -> GetRideIdStatusResponse:
    """Get the dynamic status (location, phase) of a ride."""
    ride_status = await rides_dao.get_ride_model_by_id(ride_id)
    if ride_status is None:
        raise HTTPException(status_code=404, detail="Item not found")

    driver_position: Point = wkb.loads(bytes(ride_status.driver_position.data))

    return GetRideIdStatusResponse(
        driver_position=LocationDTO(
            longitude=driver_position.x,
            latitude=driver_position.y,
        ),
        phase=ride_status.phase,
    )


@router.post("/", response_model=PostRidesResponse, tags=["driver"])
async def post_rides(
    req: PostRidesRequest,
    rides_dao: RidesDAO = Depends(),
    user: User = Depends(current_active_user),
) -> PostRidesResponse:
    """
    司機發起行程.
    `route` 和 `durations` 需要至少2個點
    """
    if len(req.route) != len(req.durations):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Lengths of route and durations should be equal.",
        )

    timestamps = []
    t = req.departure_time
    for dur in req.durations:
        t += datetime.timedelta(seconds=dur)
        timestamps.append(t)

    ride_id = await rides_dao.create_ride_model(
        user_id=user.id,
        origin=req.origin,
        destination=req.destination,
        route=req.route,
        route_timestamps=timestamps,
        departure_time=req.departure_time,
        num_seats=req.num_seats,
        driver_position=req.origin,
        last_update_time=datetime.datetime.now(),
    )
    return PostRidesResponse(ride_id=ride_id)


@router.get("/{ride_id}", tags=["driver", "passenger"])
async def get_ride_id(
    ride_id: uuid.UUID,
    rides_dao: RidesDAO = Depends(),
) -> GetRideIdResponse:
    """Get the ride specified by `ride_id`."""
    ride = await rides_dao.get_ride_model_by_id(ride_id)
    if ride is None:
        raise HTTPException(status_code=404, detail="Item not found")

    origin: Point = wkb.loads(bytes(ride.origin.data))
    destination: Point = wkb.loads(bytes(ride.destination.data))
    route: LineString = wkb.loads(bytes(ride.route.data))
    driver_position: Point = wkb.loads(bytes(ride.driver_position.data))

    return GetRideIdResponse(
        ride=RideDTO(
            origin=LocationWithDescDTO(
                longitude=origin.x,
                latitude=origin.y,
                description=ride.origin_description,
            ),
            destination=LocationWithDescDTO(
                longitude=destination.x,
                latitude=destination.y,
                description=ride.destination_description,
            ),
            route_with_time=RouteDTO(
                route=list(route.coords),
                timestamps=ride.route_timestamps,
            ),
            num_seats=ride.num_seats,
            schedule=ride.schedule,
            driver_position=LocationDTO(
                longitude=destination.x,
                latitude=destination.y,
            ),
            departure_time=ride.departure_time,
        )
    )


@router.get("/saved_rides/{user_id}", response_model=GetRideSavedRidesResponse, tags=["driver"])
async def get_saved_rides(
    user_id: uuid.UUID,
    limit: int = 10,
    rides_dao: RidesDAO = Depends(),
    user: User = Depends(current_active_user),
) -> GetRideSavedRidesResponse:
    """
    Get past ride records 

    #### Query parameters:
    + **limit**: control how many latest rides in the response.
    + **user_id**: user who want to query past rides.

    """
    rides = await rides_dao.get_saved_ride_model_by_user_id(user_id=user_id, limit=limit)
    if rides is None:
        raise HTTPException(status_code=404, detail="Item not found")

    if user_id != user.id:
        raise HTTPException(status_code=403, detail="Permission denied")
    
    rideDTO_list = []
    for ride in rides:
        origin: Point = wkb.loads(bytes(ride.origin.data))
        destination: Point = wkb.loads(bytes(ride.destination.data))
        route: LineString = wkb.loads(bytes(ride.route.data))
        driver_position: Point = wkb.loads(bytes(ride.driver_position.data))
        rideDTO = RideDTO(
            origin=LocationWithDescDTO(
                longitude=origin.x,
                latitude=origin.y,
                description=ride.origin_description,
            ),
            destination=LocationWithDescDTO(
                longitude=destination.x,
                latitude=destination.y,
                description=ride.destination_description,
            ),
            route_with_time=RouteDTO(
                route=list(route.coords),
                timestamps=ride.route_timestamps,
            ),
            departure_time=ride.departure_time,
            num_seats=ride.num_seats,
        ) 
        rideDTO_list.append(rideDTO)


    return GetRideSavedRidesResponse(
        saved_rides=rideDTO_list,
    )



@router.patch("/{ride_id}/status", tags=["driver"])
async def patch_ride_id_status(
    ride_id: uuid.UUID,
    req: PatchRideIdStatusRequest,
    rides_dao: RidesDAO = Depends(),
    user: User = Depends(current_active_user),
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
    
    ride = await rides_dao.get_ride_model_by_id(ride_id)
    if ride is None:
        raise HTTPException(status_code=404, detail="Ride not found, make sure ride_id is correct!")

    if ride.user_id != user.id:
        raise HTTPException(status_code=403, detail="Permission denied")
    
    await rides_dao.put_phase_position_by_id(ride_id=ride_id, driver_position=req.driver_position, phase=req.phase, last_update_time=datetime.datetime.now())
 


## TODO
@router.get(
    "/{ride_id}/schedule",
    response_model=GetRideIdScheduleResponse,
    tags=["driver", "passenger"],
)
async def get_ride_id_schedule(ride_id: uuid.UUID) -> GetRideIdScheduleResponse:
    """Get a list of stopovers and current position specified by `ride_id`."""
    raise NotImplementedError("QQ")


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
    requests_dao: RequestsDAO = Depends(),  # can add user_id to joins table ??
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


@router.post("/{ride_id}/comments", tags=["driver", "passenger"])
async def post_comments(
    ride_id: uuid.UUID,
    req: PostCommentsRequest,
) -> None:
    """對參與該行程的用戶添加評論"""
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
