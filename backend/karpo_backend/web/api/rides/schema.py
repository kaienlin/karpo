import uuid
from typing import Literal

from pydantic import BaseModel, NonNegativeInt

from karpo_backend.web.api.utils import LocationDTO


class PostRideIdJoinsRequest(BaseModel):
    ride_id: uuid.UUID
    request_id: uuid.UUID


class PostRideIdJoinsResponse(BaseModel):
    join_id: uuid.UUID


class GetRideIdJoinIdStatusResponse(BaseModel):
    driver_response: Literal["accepted", "rejected", "pending"]


class GetRideIdStatusResponse(BaseModel):
    driver_position: LocationDTO
    driver_phase: NonNegativeInt
