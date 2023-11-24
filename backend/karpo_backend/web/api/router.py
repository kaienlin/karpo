from fastapi.routing import APIRouter

from karpo_backend.web.api import docs, monitoring, requests, rides, users

api_router = APIRouter()
api_router.include_router(monitoring.router)
api_router.include_router(users.router)
api_router.include_router(docs.router)
api_router.include_router(requests.router, prefix="/requests")
api_router.include_router(rides.router, prefix="/rides")
