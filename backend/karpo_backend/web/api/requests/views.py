import uuid
from typing import List, Tuple

from fastapi import APIRouter, HTTPException
from fastapi.param_functions import Depends
from shapely import LineString, Point, wkb

from karpo_backend.db.dao.requests_dao import RequestsDAO
from karpo_backend.db.models.rides import RidesModel
from karpo_backend.db.models.users import User, current_active_user  # type: ignore
from karpo_backend.matching import Match
from karpo_backend.web.api.requests.schema import (
    GetRequestIdMatchesResponse,
    GetRequestIdResponse,
    MatchDTO,
    PostRequestsRequest,
    PostRequestsResponse,
)
from karpo_backend.web.api.users.schema import UserInfoForOthersDTO
from karpo_backend.web.api.utils import LocationWithDescDTO, RouteDTO

router = APIRouter()


@router.post("/", response_model=PostRequestsResponse, tags=["passenger"])
async def post_requests(
    req: PostRequestsRequest,
    limit: int = 10,
    requests_dao: RequestsDAO = Depends(),
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
    request_id = await requests_dao.create_requests_model(
        user_id=user.id,
        origin=req.origin,
        destination=req.destination,
        num_passengers=req.num_passengers,
        start_time=req.time,
    )
    return PostRequestsResponse(request_id=request_id, matches=[])


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

    matches: List[Tuple[RidesModel, Match]] = await requests_dao.get_request_matches(
        request,
        limit,
    )
    resp = GetRequestIdMatchesResponse(matches=[])
    for ride, match in matches:
        driver_origin: Point = wkb.loads(bytes(ride.origin.data))
        driver_destination: Point = wkb.loads(bytes(ride.destination.data))
        ride_route: LineString = wkb.loads(bytes(ride.route.data))
        match_dto = MatchDTO(
            ride_id=ride.id,
            pick_up_time=match.pick_up_time,
            drop_off_time=match.drop_off_time,
            pick_up_location=LocationWithDescDTO.from_point(match.pick_up_location),
            drop_off_location=LocationWithDescDTO.from_point(match.drop_off_location),
            pick_up_distance=match.pick_up_distance,
            drop_off_distance=match.drop_off_distance,
            driver_origin=LocationWithDescDTO.from_point(driver_origin),
            driver_destination=LocationWithDescDTO.from_point(driver_destination),
            num_available_seat=1,
            other_passengers=[],
            fare=0,
            driver_info=UserInfoForOthersDTO(name="test"),
            driver_route=RouteDTO.from_linestring_and_timestamps(
                ride_route,
                ride.route_timestamps,
            ),
            proximity=match.estimated_travel_time,
            status="unasked",
        )
        resp.matches.append(match_dto)

    return resp
