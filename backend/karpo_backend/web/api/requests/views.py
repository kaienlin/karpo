import uuid

from fastapi import APIRouter

from karpo_backend.web.api.requests.schema import (
    GetRequestIdMatchesResponse,
    GetRequestIdResponse,
    PostRequestsRequest,
    PostRequestsResponse,
)

router = APIRouter()


@router.post("/", response_model=PostRequestsResponse)
async def post_requests(
    req: PostRequestsRequest,
    limit: int = 10,
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
    raise NotImplementedError("QQ")


@router.get("/{request_id}", response_model=GetRequestIdResponse)
async def get_request_id() -> GetRequestIdResponse:
    """
    Get the information of the request specified by `request_id`.

    #### Response:
    + **is_active**: `true` if this request is open for matching.
    """
    raise NotImplementedError("QQ")


@router.get(
    "/{request_id}/matches",
    response_model=GetRequestIdMatchesResponse,
    responses={404: {"description": "Not Found"}},
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
