import uuid

from fastapi import APIRouter

from karpo_backend.web.api.requests.schema import (
    GetRequestIdMatchesResponseModel,
    GetRequestIdResponseModel,
    PostRequestsRequestModel,
    PostRequestsResponseModel,
)

router = APIRouter()


@router.post("/", response_model=PostRequestsResponseModel)
async def post_requests(
    req: PostRequestsRequestModel,
    limit: int = 10,
) -> PostRequestsResponseModel:
    """For a passenger to submit a request and get a list of matched rides."""
    raise NotImplementedError("QQ")


@router.get("/{request_id}", response_model=GetRequestIdResponseModel)
async def get_request_id() -> GetRequestIdResponseModel:
    """Get the information of the request specified by `request_id`."""
    raise NotImplementedError("QQ")


@router.get(
    "/{request_id}/matches",
    response_model=GetRequestIdMatchesResponseModel,
    responses={404: {"description": "Not Found"}},
)
async def get_request_id_matches(
    request_id: uuid.UUID,
    limit: int = 10,
) -> GetRequestIdMatchesResponseModel:
    """Get matches for the request specified `request_id`."""
    raise NotImplementedError("QQ")
