import uuid
from typing import List, Optional

from fastapi import APIRouter, HTTPException, status
from fastapi.param_functions import Depends
from fastapi_users.db import SQLAlchemyUserDatabase
from shapely import Point, wkb

from karpo_backend.db.dao.joins_dao import JoinsDAO
from karpo_backend.db.dao.requests_dao import RequestsDAO
from karpo_backend.db.dao.rides_dao import RidesDAO
from karpo_backend.db.models.joins import JoinsModel
from karpo_backend.db.models.requests import RequestsModel
from karpo_backend.db.models.users import (  # type: ignore
    User,
    current_active_user,
    get_user_db,
)
from karpo_backend.web.api.requests.schema import (
    GetRequestIdMatchesResponse,
    GetRequestIdResponse,
    GetSavedRequestsResponse,
    MatchDTO,
    PostRequestsRequest,
    PostRequestsResponse,
)
from karpo_backend.web.api.users.utils import get_user_info_for_others
from karpo_backend.web.api.utils import (
    LocationWithDescDTO,
    RouteDTO,
    get_distance_between_wkb_points,
)

router = APIRouter()


async def get_unasked_match_dtos(
    request: RequestsModel,
    limit: int,
    requests_dao: RequestsDAO,
    rides_dao: RidesDAO,
    joins_dao: JoinsDAO,
    user_db: SQLAlchemyUserDatabase,
) -> List[MatchDTO]:
    evaled_matches = await requests_dao.get_request_matches(request, limit)
    match_dtos: List[MatchDTO] = []
    for ride, evaled_match in evaled_matches:
        driver_user_info = await get_user_info_for_others(
            ride.user_id, user_db, requests_dao, rides_dao
        )

        other_accepted_joins = await joins_dao.get_accepted_joins_model_by_ride_id(
            ride.id,
        )
        other_passengers: List[uuid.UUID] = [
            join.request_user_id for join in other_accepted_joins
        ]

        match_dto = MatchDTO(
            ride_id=ride.id,
            pick_up_time=evaled_match.pick_up_time,
            drop_off_time=evaled_match.drop_off_time,
            pick_up_location=LocationWithDescDTO.from_point(
                evaled_match.pick_up_location,
            ),
            drop_off_location=LocationWithDescDTO.from_point(
                evaled_match.drop_off_location,
            ),
            pick_up_distance=evaled_match.pick_up_distance,
            drop_off_distance=evaled_match.drop_off_distance,
            driver_origin=LocationWithDescDTO.from_wkb(
                ride.origin,
                ride.origin_description,
            ),
            driver_destination=LocationWithDescDTO.from_wkb(
                ride.destination,
                ride.destination_description,
            ),
            num_available_seat=ride.num_seats - len(other_accepted_joins),
            other_passengers=other_passengers,
            fare=0,
            driver_info=driver_user_info,
            driver_route=RouteDTO.from_wkb_and_timestamps(
                ride.route,
                ride.route_timestamps,
            ),
            proximity=evaled_match.estimated_travel_time,
            status="unasked",
        )
        match_dtos.append(match_dto)

    return match_dtos


async def get_match_dto_from_request_and_join(
    request: RequestsModel,
    join: JoinsModel,
    requests_dao: RequestsDAO,
    rides_dao: RidesDAO,
    joins_dao: JoinsDAO,
    user_db: SQLAlchemyUserDatabase,
) -> MatchDTO:
    pick_up_location = LocationWithDescDTO.from_wkb(
        join.pick_up_location,
        join.pick_up_location_description,
    )

    drop_off_location = LocationWithDescDTO.from_wkb(
        join.drop_off_location,
        join.drop_off_location_description,
    )

    pick_up_distance = get_distance_between_wkb_points(
        request.origin,
        join.pick_up_location,
    )
    drop_off_distance = get_distance_between_wkb_points(
        request.destination,
        join.drop_off_location,
    )

    ride = await rides_dao.get_ride_model_by_id(join.ride_id)
    other_accepted_joins = await joins_dao.get_accepted_joins_model_by_ride_id(ride.id)
    other_passengers: List[uuid.UUID] = [
        j.request_user_id for j in other_accepted_joins if j.id != join.id
    ]
    num_avaiable_seat = ride.num_seats - len(other_passengers)
    if join.status == "accepted":
        num_avaiable_seat -= 1

    driver_user_info = await get_user_info_for_others(
        ride.user_id, user_db, requests_dao, rides_dao
    )

    return MatchDTO(
        ride_id=join.ride_id,
        pick_up_time=join.pick_up_time,
        drop_off_time=join.drop_off_time,
        pick_up_location=pick_up_location,
        drop_off_location=drop_off_location,
        pick_up_distance=pick_up_distance,
        drop_off_distance=drop_off_distance,
        driver_origin=LocationWithDescDTO.from_wkb(
            ride.origin,
            ride.origin_description,
        ),
        driver_destination=LocationWithDescDTO.from_wkb(
            ride.destination,
            ride.destination_description,
        ),
        num_available_seat=num_avaiable_seat,
        other_passengers=other_passengers,
        driver_info=driver_user_info,
        fare=0,
        driver_route=RouteDTO.from_wkb_and_timestamps(
            ride.route,
            ride.route_timestamps,
        ),
        proximity=0,  # TODO: add proximity to JoinsModel
        status=join.status,
        join_id=join.id,
    )


async def get_accepted_match_dto(
    request: RequestsModel,
    requests_dao: RequestsDAO,
    rides_dao: RidesDAO,
    joins_dao: JoinsDAO,
    user_db: SQLAlchemyUserDatabase,
) -> Optional[MatchDTO]:
    join = await joins_dao.get_accepted_joins_by_request_id(request.id)
    if join is None:
        return None

    return await get_match_dto_from_request_and_join(
        request,
        join,
        requests_dao,
        rides_dao,
        joins_dao,
        user_db,
    )


async def get_pending_match_dtos(
    request: RequestsModel,
    requests_dao: RequestsDAO,
    rides_dao: RidesDAO,
    joins_dao: JoinsDAO,
    user_db: SQLAlchemyUserDatabase,
) -> List[MatchDTO]:
    joins = await joins_dao.get_pending_joins_by_request_id(request.id)
    match_dtos: List[MatchDTO] = []

    for join in joins:
        match_dto = await get_match_dto_from_request_and_join(
            request,
            join,
            requests_dao,
            rides_dao,
            joins_dao,
            user_db,
        )
        match_dtos.append(match_dto)

    return match_dtos


@router.post("/", response_model=PostRequestsResponse, tags=["passenger"])
async def post_requests(
    req: PostRequestsRequest,
    limit: int = 10,
    requests_dao: RequestsDAO = Depends(),
    rides_dao: RidesDAO = Depends(),
    joins_dao: JoinsDAO = Depends(),
    user_db: SQLAlchemyUserDatabase = Depends(get_user_db),
    user: User = Depends(current_active_user),
) -> PostRequestsResponse:
    """
    For a passenger to submit a request and get a list of matched rides.

    #### Query parameters:
    + **limit**: control how many matches in the response.

    #### Request body:
    + **time**: the earliest time when the passenger can get on.
    + **origin**: the coordinate where the passenger depart at.
    + **origin_description**: any description e.g. address, place id.
    + **destination**: the coordinate where the passenger wants to go.
    + **destination_description**: any description e.g. address, place id.
    + **num_passengers**: number of people who want a ride.

    #### Response:
    + **request_id**
    + **matches**: the same as the reponse of GET /requests/{request_id}/matches.
    """
    request = await requests_dao.get_active_request_by_user_id(user.id)
    if request is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="exists a active request for the current user",
        )

    request = await requests_dao.create_requests_model(
        user_id=user.id,
        origin=req.origin,
        destination=req.destination,
        num_passengers=req.num_passengers,
        start_time=req.time,
    )

    unasked_matches = await get_unasked_match_dtos(
        request,
        limit,
        requests_dao,
        rides_dao,
        joins_dao,
        user_db,
    )
    return PostRequestsResponse(request_id=request.id, matches=unasked_matches)


@router.get("/{request_id}", response_model=GetRequestIdResponse, tags=["passenger"])
async def get_request_id(
    request_id: uuid.UUID,
    requests_dao: RequestsDAO = Depends(),
    user: User = Depends(current_active_user),
) -> GetRequestIdResponse:
    """
    Get the information of the request specified by `request_id`.

    #### Response:
    + **is_active**: `true` if this request is open for matching.
    """
    request = await requests_dao.get_requests_model_by_id(request_id)
    if request is None:
        raise HTTPException(status_code=404, detail="Item not found")

    if request.user_id != user.id:
        raise HTTPException(status_code=403, detail="Permission denied")

    origin: Point = wkb.loads(bytes(request.origin.data))
    destination: Point = wkb.loads(bytes(request.destination.data))

    return GetRequestIdResponse(
        time=request.start_time,
        origin=LocationWithDescDTO(
            longitude=origin.x,
            latitude=origin.y,
            description=request.origin_description,
        ),
        destination=LocationWithDescDTO(
            longitude=destination.x,
            latitude=destination.y,
            description=request.destination_description,
        ),
        num_passengers=request.num_passengers,
        is_active=request.is_active,
        create_time=request.created_at,
    )


@router.get(
    "/{request_id}/matches",
    response_model=GetRequestIdMatchesResponse,
    responses={404: {"description": "Not Found"}},
    tags=["passenger"],
)
async def get_request_id_matches(  # noqa: WPS210
    request_id: uuid.UUID,
    limit: int = 10,
    requests_dao: RequestsDAO = Depends(),
    rides_dao: RidesDAO = Depends(),
    joins_dao: JoinsDAO = Depends(),
    user_db: SQLAlchemyUserDatabase = Depends(get_user_db),
    user: User = Depends(current_active_user),
) -> GetRequestIdMatchesResponse:
    """
    Get matches for the request specified `request_id`.

    #### Query parameters:
    + **limit**: control how many matches in the response.

    #### Response (an element in the list):
    + **proximity**: the lower the better.
    + **join_id**: the join_id of a sent join request, null if `status` is "unasked".
    """
    request = await requests_dao.get_requests_model_by_id(request_id)
    if request is None:
        raise HTTPException(status_code=404, detail="Item not found")

    if request.user_id != user.id:
        raise HTTPException(status_code=403, detail="Permission denied")

    resp = GetRequestIdMatchesResponse(matches=[])
    accepted_match = await get_accepted_match_dto(
        request, requests_dao, rides_dao, joins_dao, user_db
    )
    if accepted_match is not None:
        resp.matches.append(accepted_match)
        return resp

    pending_matches = await get_pending_match_dtos(
        request, requests_dao, rides_dao, joins_dao, user_db
    )
    resp.matches.extend(pending_matches)

    unasked_matches = await get_unasked_match_dtos(
        request,
        limit,
        requests_dao,
        rides_dao,
        joins_dao,
        user_db,
    )
    resp.matches.extend(unasked_matches)

    return resp


@router.get(
    "/saved_requests/{user_id}",
    response_model=GetSavedRequestsResponse,
    tags=["passenger"],
)
async def get_saved_requests(
    user_id: uuid.UUID,
    limit: int = 10,
    requests_dao: RequestsDAO = Depends(),
    user: User = Depends(current_active_user),
) -> GetSavedRequestsResponse:
    """
    Get past request records

    #### Query parameters:
    + **limit**: control how many latest requests in the response.
    + **user_id**: user who want to query past requests.

    """
    requests = await requests_dao.get_saved_request_by_user_id(
        user_id=user_id,
        limit=limit,
    )
    if requests is None:
        raise HTTPException(status_code=404, detail="Item not found")

    if user_id != user.id:
        raise HTTPException(status_code=403, detail="Permission denied")

    saved_request_item_list = []
    for request in requests:
        saved_request_item = PostRequestsRequest(
            time=request.start_time,
            origin=LocationWithDescDTO.from_wkb(
                request.origin,
                request.origin_description,
            ),
            destination=LocationWithDescDTO.from_wkb(
                request.destination,
                request.destination_description,
            ),
            num_passengers=request.num_passengers,
        )
        saved_request_item_list.append(saved_request_item)

    return GetSavedRequestsResponse(
        saved_requests=saved_request_item_list,
    )
