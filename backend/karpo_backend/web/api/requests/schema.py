import datetime
import uuid
from typing import List, Literal, Optional

from pydantic import BaseModel, NonNegativeFloat, NonNegativeInt, PositiveInt

from karpo_backend.db.models.users import UserRead  # type: ignore
from karpo_backend.web.api.utils import LocationDTO


class MatchDTO(BaseModel):
    """A match between a passenger's request and a ride provided by a driver"""

    ride_id: uuid.UUID
    get_on_time: datetime.datetime
    get_off_time: datetime.datetime
    get_on_location: LocationDTO
    get_off_location: LocationDTO
    distance_to_get_on_location: NonNegativeFloat
    distance_to_get_off_location: NonNegativeFloat
    driver_origin: LocationDTO
    driver_destination: LocationDTO
    num_available_seat: PositiveInt
    other_passengers: List[uuid.UUID]
    driver_info: UserRead
    cost: NonNegativeInt
    driver_route: List[LocationDTO]
    status: Literal["unasked", "pending", "accepted"]
    join_id: Optional[uuid.UUID] = None


class PostRequestsRequest(BaseModel):
    time: datetime.datetime
    origin: LocationDTO
    origin_description: Optional[str] = None
    destination: LocationDTO
    destination_description: Optional[str] = None
    num_people: PositiveInt


class PostRequestsResponse(BaseModel):
    request_id: uuid.UUID
    matches: List[MatchDTO]


class GetRequestIdResponse(PostRequestsRequest):
    create_time: datetime.datetime
    is_active: bool


class GetRequestIdMatchesResponse(BaseModel):
    matches: List[MatchDTO]
