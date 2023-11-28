import uuid

from fastapi import APIRouter, HTTPException
from fastapi.param_functions import Depends
from shapely import Point, wkb

from karpo_backend.db.dao.requests_dao import RequestsDAO
from karpo_backend.db.models.users import User, current_active_user  # type: ignore
from karpo_backend.web.api.requests.schema import (
    GetRequestIdMatchesResponse,
    GetRequestIdResponse,
    PostRequestsRequest,
    PostRequestsResponse,
)
from karpo_backend.web.api.utils import LocationWithDescDTO

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
    + **num_people**: number of people who want a ride.

    #### Response:
    + **request_id**
    + **matches**: the same as the reponse of GET /requests/{request_id}/matches.
    """
    request_id = await requests_dao.create_requests_model(
        user_id=user.id,
        origin=req.origin,
        destination=req.destination,
        num_people=req.num_people,
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
        num_people=request.num_people,
        is_active=request.is_active,
        create_time=request.created_at,
    )


@router.get(
    "/{request_id}/matches",
    response_model=GetRequestIdMatchesResponse,
    responses={404: {"description": "Not Found"}},
    tags=["passenger"],
)
async def get_request_id_matches(
    request_id: uuid.UUID,
    limit: int = 10,
) -> GetRequestIdMatchesResponse:
    """
    Get matches for the request specified `request_id`.

    #### Query parameters:
    + **limit**: control how many matches in the response.

    #### Response (an element in the list):
    + **join_id**: the join_id of a sent join request, null if `status` is "unasked".
    """
    raise NotImplementedError("QQ")
