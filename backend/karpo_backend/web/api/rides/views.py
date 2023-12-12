import datetime
import json
import uuid
from typing import List, Literal

from fastapi import APIRouter, HTTPException, status
from fastapi.param_functions import Depends
from fastapi_users.db import SQLAlchemyUserDatabase
from shapely import LineString, Point, wkb, wkt

from karpo_backend.db.dao.joins_dao import JoinsDAO
from karpo_backend.db.dao.requests_dao import RequestsDAO
from karpo_backend.db.dao.rides_dao import RidesDAO
from karpo_backend.db.dao.messages_dao import MessagesDAO
from karpo_backend.db.models.users import (  # type: ignore
    User,
    current_active_user,
    get_user_db,
)
from karpo_backend.matching import evaluate_match
from karpo_backend.web.api.rides.schema import (  # noqa: WPS235
    GetRideIdJoinIdStatusResponse,
    GetRideIdResponse,
    GetRideIdScheduleResponse,
    GetRideIdStatusResponse,
    GetRideJoinsResponse,
    GetRideMessagesResponse,
    GetRideSavedRidesResponse,
    JoinDTO,
    PatchRideIdStatusRequest,
    PostCommentsRequest,
    PostRideIdJoinsRequest,
    PostRideIdJoinsResponse,
    PostRideMessagesRequest,
    PostRidesRequest,
    PostRidesResponse,
    PutRideIdJoinsJoinIdStatusRequest,
    RideDTO,
    SavedRideItemDTO,
    StopoverDTO,
    ChatRecordDTO,
)
from karpo_backend.web.api.users.utils import get_user_info_for_others, update_user_rating_by_id
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
    `route` 中 `steps` 和 `durations` 數量需相同
    """
    if len(req.route.steps) != len(req.route.durations):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Lengths of steps and durations should be equal.",
        )

    route = []
    timestamps = []

    t = req.departure_time
    for step, duration in zip(req.route.steps, req.route.durations):
        ## Except for the step containing the origin, the first point of each step has been considered by the previous step.
        if len(timestamps) == 0:
            route.append((step[0][0], step[0][1]))
            timestamps.append(req.departure_time)

        distance_to_next_point = []
        for point_idx in range(1, len(step)):
            distance_to_next_point.append(
                (
                    (step[point_idx][0] - step[point_idx - 1][0]) ** 2
                    + (step[point_idx][1] - step[point_idx - 1][1]) ** 2
                )
                ** 0.5
            )
        total_distance = sum(distance_to_next_point)
        for point_idx in range(1, len(step)):
            route.append((step[point_idx][0], step[point_idx][1]))
            timestamps.append(
                timestamps[-1]
                + datetime.timedelta(
                    seconds=duration
                    * (distance_to_next_point[point_idx - 1] / total_distance)
                )
            )

        t += datetime.timedelta(seconds=duration)

    ride_id = await rides_dao.create_ride_model(
        user_id=user.id,
        label=req.label,
        origin=req.origin,
        destination=req.destination,
        route=route,
        route_timestamps=timestamps,
        intermediates=req.intermediates,
        departure_time=req.departure_time,
        num_seats=req.num_seats,
        num_seats_left=req.num_seats,
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

    intermediateDTO_list = []
    for intermediate, intermediate_description in zip(ride.intermediates, ride.intermediate_descriptions):
        intermediateDTO_list.append(
            LocationWithDescDTO(
                longitude=wkt.loads(intermediate).x,
                latitude=wkt.loads(intermediate).y,
                description=intermediate_description,
            )
        )

    return GetRideIdResponse(
        ride=RideDTO(
            label=ride.label,
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
            intermediates=intermediateDTO_list,
            departure_time=ride.departure_time,
            num_seats=ride.num_seats,
            last_update_time=ride.last_update_time,
        )
    )


@router.get(
    "/saved_rides/{user_id}", response_model=GetRideSavedRidesResponse, tags=["driver"]
)
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
    rides = await rides_dao.get_saved_ride_model_by_user_id(
        user_id=user_id, limit=limit
    )
    if rides is None:
        raise HTTPException(status_code=404, detail="Item not found")

    if user_id != user.id:
        raise HTTPException(status_code=403, detail="Permission denied")

    saved_ride_item_list = []
    for ride in rides:
        origin: Point = wkb.loads(bytes(ride.origin.data))
        destination: Point = wkb.loads(bytes(ride.destination.data))
        driver_position: Point = wkb.loads(bytes(ride.driver_position.data))

        intermediateDTO_list = []
        for intermediate, intermediate_description in zip(ride.intermediates, ride.intermediate_descriptions):
            intermediateDTO_list.append(
                LocationWithDescDTO(
                    longitude=wkt.loads(intermediate).x,
                    latitude=wkt.loads(intermediate).y,
                    description=intermediate_description,
                )
            )

        saved_ride_item = SavedRideItemDTO(
            label=ride.label,
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
            intermediates=intermediateDTO_list,
            departure_time=ride.departure_time,
            num_seats=ride.num_seats,
            last_update_time=ride.last_update_time,
        )
        saved_ride_item_list.append(saved_ride_item)

    return GetRideSavedRidesResponse(
        saved_rides=saved_ride_item_list,
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
        raise HTTPException(
            status_code=404, detail="Ride not found, make sure ride_id is correct!"
        )

    if ride.user_id != user.id:
        raise HTTPException(status_code=403, detail="Permission denied")

    await rides_dao.put_phase_position_by_id(
        ride_id=ride_id,
        driver_position=req.driver_position,
        phase=req.phase,
        last_update_time=datetime.datetime.now(),
    )


@router.get(
    "/{ride_id}/schedule",
    response_model=GetRideIdScheduleResponse,
    tags=["driver", "passenger"],
)
async def get_ride_id_schedule(
    ride_id: uuid.UUID,
    rides_dao: RidesDAO = Depends(),
    user_db: SQLAlchemyUserDatabase = Depends(get_user_db),
) -> GetRideIdScheduleResponse:
    """Get a list of stopovers specified by `ride_id`."""

    schedule = await rides_dao.get_schedule_by_id(ride_id)

    if schedule is None:
        raise HTTPException(status_code=404, detail="Item not found")

    stopover_list = []
    for stopover_json in schedule:
        stopover_info = json.loads(stopover_json)
        user_info = await get_user_info_for_others(
            stopover_info["passenger_id"], user_db
        )
        location: Point = wkb.loads(bytes.fromhex(stopover_info["location"]))

        stopover_list.append(
            StopoverDTO(
                request_id=stopover_info["request_id"],
                passenger_info=user_info,
                time=stopover_info["time"],
                location=LocationWithDescDTO(
                    longitude=location.x,
                    latitude=location.y,
                    description=stopover_info["description"],
                ),
                status=stopover_info["status"],
            )
        )
    return GetRideIdScheduleResponse(schedule=stopover_list)


@router.post(
    "/{ride_id}/joins",
    responses={404: {"description": "nonexistent ride_id or wrong permissions"}},
    tags=["passenger"],
)
async def post_ride_id_joins(
    ride_id: uuid.UUID,
    req: PostRideIdJoinsRequest,
    joins_dao: JoinsDAO = Depends(),
    rides_dao: RidesDAO = Depends(),
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
        raise HTTPException(status_code=404, detail="Request not found")

    if request.user_id != user.id:
        raise HTTPException(status_code=403, detail="Permission denied")

    ride = await rides_dao.get_ride_model_by_id(ride_id)
    if ride is None:
        raise HTTPException(status_code=404, detail="Ride not found")

    if ride.num_seats_left < request.num_passengers:
        raise HTTPException(status_code=403, detail="No seats left")

    match = evaluate_match(ride=ride, req=request)
    join_id = await joins_dao.create_joins_model(
        request_id=req.request_id,
        ride_id=ride_id,
        request_user_id=request.user_id,
        ride_user_id=ride.user_id,
        num_passengers=request.num_passengers,
        # fare=,
        pick_up_location=LocationWithDescDTO.from_point(match.pick_up_location),
        drop_off_location=LocationWithDescDTO.from_point(match.drop_off_location),
        pick_up_time=match.pick_up_time,
        drop_off_time=match.drop_off_time,
        pick_up_distance=match.pick_up_distance,
        drop_off_distance=match.drop_off_distance,
    )
    return PostRideIdJoinsResponse(join_id=join_id)


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
    user: User = Depends(current_active_user),
) -> GetRideIdJoinIdStatusResponse:
    """Get the status of a join request (`accepted`, `rejected` or `pending`)"""
    join = await joins_dao.get_joins_model_by_id(join_id)
    if join is None:
        raise HTTPException(status_code=404, detail="Join not found")

    if join.request_user_id != user.id or join.ride_id != ride_id:
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
    messages_dao: MessagesDAO = Depends(),
) -> GetRideMessagesResponse:
    """Get Chatroom messages

    :param ride_id: id of ride, tpye is uuid.UUID.
    :param from_time: time when the messages need to return from.
    """

    messages = await messages_dao.get_message_model_by_ride_id(ride_id=ride_id, from_time=from_time)
    messages_list = []
    for message in messages:
        messages_list.append(
            ChatRecordDTO(
                user_id=message.user_id,
                content=message.content,
                time=message.created_at,
            )
        )
    return GetRideMessagesResponse(chat_records=messages_list)


@router.post("/{ride_id}/messages", tags=["chat"])
async def post_chatroom_messages(
    ride_id: uuid.UUID,
    req: PostRideMessagesRequest,
    messages_dao: MessagesDAO = Depends(),
    user: User = Depends(current_active_user),
) -> None:
    """Post Chatroom messages"""

    if req.chat_record.user_id != user.id:
        raise HTTPException(status_code=403, detail="Permission denied")

    message = await messages_dao.create_message_model(
        user_id=user.id,
        ride_id=ride_id,
        content=req.chat_record.content,
        created_at=req.chat_record.time,
    )
    


@router.get("/{ride_id}/joins", response_model=GetRideJoinsResponse, tags=["driver"])
async def get_ride_id_joins(
    ride_id: uuid.UUID,
    status: Literal["pending", "accepted", "rejected", "all"],
    rides_dao: RidesDAO = Depends(),
    joins_dao: JoinsDAO = Depends(),
    user: User = Depends(current_active_user),
) -> GetRideJoinsResponse:
    """
    Get matches for the request specified `request_id`.

    #### Query parameters:
    + **ride_id**: ride want to query.
    + **status**: which status of joins want to get.
    """

    ride = await rides_dao.get_ride_model_by_id(ride_id)
    if ride is None:
        raise HTTPException(status_code=404, detail="Ride not found")
    if ride.user_id != user.id:
        raise HTTPException(status_code=403, detail="Permission denied")

    joins_model = await joins_dao.get_joins_model_by_ride_id_and_status(
        ride_id=ride_id, status=status
    )

    joins = []
    for join_model in joins_model:
        joins.append(
            JoinDTO(
                join_id=join_model.id,
                passenger_id=join_model.request_user_id,
                pick_up_time=join_model.pick_up_time,
                drop_off_time=join_model.drop_off_time,
                pick_up_location=LocationWithDescDTO.from_wkb(
                    join_model.pick_up_location,
                    join_model.pick_up_location_description,
                ),
                drop_off_location=LocationWithDescDTO.from_wkb(
                    join_model.drop_off_location,
                    join_model.drop_off_location_description,
                ),
                passenger_pick_up_distance=join_model.pick_up_distance,
                passenger_drop_off_distance=join_model.drop_off_distance,
                num_passengers=join_model.num_passengers,
                fare=0,     # TBA
            )
        )

    return GetRideJoinsResponse(num_available_seat=ride.num_seats_left, joins=joins)

@router.post("/{ride_id}/comments", tags=["driver", "passenger"])
async def post_comments(
    ride_id: uuid.UUID,
    req: PostCommentsRequest,
    joins_dao: JoinsDAO = Depends(),
    user_db: SQLAlchemyUserDatabase = Depends(get_user_db),
    user: User = Depends(current_active_user),
) -> None:
    """對參與該行程的用戶添加評分"""
    
    accepted_joins_in_ride = await joins_dao.get_accepted_joins_model_by_ride_id(ride_id=ride_id)
    if len(accepted_joins_in_ride) == 0:
        raise HTTPException(status_code=404, detail="Item not found")

    users: List[uuid.UUID] = [ j.request_user_id for j in accepted_joins_in_ride ]
    users.append(accepted_joins_in_ride[0].ride_user_id)

    if user.id not in users:
        raise HTTPException(status_code=403, detail="Permission denied")
    if req.user_id not in users:
        raise HTTPException(status_code=404, detail="No such user")

    await update_user_rating_by_id(
        user_id=req.user_id,
        rating=req.rate,
        user_db=user_db,
    )


@router.put("/{ride_id}/joins/{join_id}/status", tags=["driver"])
async def put_ride_id_joins_join_id_status(
    ride_id: uuid.UUID,
    join_id: uuid.UUID,
    req: PutRideIdJoinsJoinIdStatusRequest,
    rides_dao: RidesDAO = Depends(),
    joins_dao: JoinsDAO = Depends(),
    user: User = Depends(current_active_user),
) -> None:
    """
    Accept or reject a join request specified by `join_id` and `ride_id`.

    #### Request Body:
    + **action**: `"reject"` or `"accept"`.
    """

    ride = await rides_dao.get_ride_model_by_id(ride_id)
    if ride is None:
        raise HTTPException(status_code=404, detail="Ride not found")
    if ride.user_id != user.id:
        raise HTTPException(status_code=403, detail="Permission denied")

    join = await joins_dao.get_joins_model_by_id(join_id)
    if join is None:
        raise HTTPException(status_code=404, detail="Join not found")
    if join.ride_id != ride_id:
        raise HTTPException(status_code=403, detail="Permission denied")

    if req.action == "accept" and ride.num_seats_left < join.num_passengers:
        raise HTTPException(
            status_code=403,
            detail="Number of passengers > number of available seats",
        )

    await joins_dao.put_joins_model_by_id(join_id, req.action)
    if req.action == "accept":
        await rides_dao.put_num_seats_left_by_id(
            ride_id=ride_id,
            num_seats_left=(ride.num_seats_left - join.num_passengers),
            last_update_time=datetime.datetime.now(),
        )
    await rides_dao.update_schedule_by_ride_id(ride_id)
