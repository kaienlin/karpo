import datetime
import uuid
from typing import List

from pydantic import BaseModel

from karpo_backend.web.api.utils import LocationDTO


class MatchDTO(BaseModel):
    ride_id: uuid.UUID
    get_on_time: datetime.datetime
    get_off_time: datetime.datetime


class PostRequestsRequestModel(BaseModel):
    time: datetime.datetime
    source: LocationDTO
    destination: LocationDTO
    num_people: int


class PostRequestsResponseModel(BaseModel):
    request_id: uuid.UUID
    matches: List[MatchDTO]
