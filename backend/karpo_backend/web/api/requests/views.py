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
    """For a passenger to submit a request and get a list of matched rides."""
    raise NotImplementedError("QQ")


@router.get("/{request_id}", response_model=GetRequestIdResponse)
async def get_request_id() -> GetRequestIdResponse:
    """Get the information of the request specified by `request_id`."""
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
    """Get matches for the request specified `request_id`."""
    raise NotImplementedError("QQ")
