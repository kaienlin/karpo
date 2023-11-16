import uuid
from typing import Literal

from pydantic import BaseModel, NonNegativeInt

from karpo_backend.web.api.utils import LocationDTO


class PostRideIdJoinsRequestModel(BaseModel):
    ride_id: uuid.UUID
    request_id: uuid.UUID


class PostRideIdJoinsResponseModel(BaseModel):
    join_id: uuid.UUID


class GetRideIdJoinIdStatusResponseModel(BaseModel):
    driver_response: Literal["accepted", "rejected", "pending"]


class GetRideIdStatusResponseModel(BaseModel):
    driver_position: LocationDTO
    driver_phase: NonNegativeInt
