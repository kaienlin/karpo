from fastapi.routing import APIRouter

from karpo_backend.web.api import (
    docs,
    dummy,
    echo,
    monitoring,
    redis,
    requests,
    rides,
    users,
)

api_router = APIRouter()
api_router.include_router(monitoring.router)
api_router.include_router(users.router)
api_router.include_router(docs.router)
api_router.include_router(echo.router, prefix="/echo", tags=["echo"])
api_router.include_router(dummy.router, prefix="/dummy", tags=["dummy"])
api_router.include_router(redis.router, prefix="/redis", tags=["redis"])
api_router.include_router(requests.router, prefix="/requests", tags=["requests"])
api_router.include_router(rides.router, prefix="/rides", tags=["rides"])
