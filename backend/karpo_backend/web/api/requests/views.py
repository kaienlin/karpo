from fastapi import APIRouter

from karpo_backend.web.api.requests.schema import (
    PostRequestsRequestModel,
    PostRequestsResponseModel,
)

router = APIRouter()


@router.post("/", response_model=PostRequestsResponseModel)
async def post_requests(
    req: PostRequestsRequestModel,
) -> PostRequestsResponseModel:
    """為乘客媒合司機."""
    raise NotImplementedError("QQ")
