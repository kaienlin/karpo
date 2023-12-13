import datetime
import uuid
from typing import List, Literal, Optional

from pydantic import BaseModel, NonNegativeFloat, NonNegativeInt, PositiveInt

from karpo_backend.web.api.users.schema import UserInfoForOthersDTO
from karpo_backend.web.api.utils import LocationWithDescDTO, RouteDTO


class MatchDTO(BaseModel):
    """A match between a passenger's request and a ride provided by a driver"""

    ride_id: uuid.UUID
    pick_up_time: datetime.datetime
    drop_off_time: datetime.datetime
    pick_up_location: LocationWithDescDTO
    drop_off_location: LocationWithDescDTO
    pick_up_distance: NonNegativeFloat
    drop_off_distance: NonNegativeFloat
    driver_origin: LocationWithDescDTO
    driver_destination: LocationWithDescDTO
    num_available_seat: NonNegativeInt
    other_passengers: List[uuid.UUID]
    driver_info: UserInfoForOthersDTO
    fare: NonNegativeInt
    driver_route: RouteDTO
    proximity: float
    status: Literal["unasked", "pending", "accepted"]
    join_id: Optional[uuid.UUID] = None


class PostRequestsRequest(BaseModel):
    time: datetime.datetime
    origin: LocationWithDescDTO
    destination: LocationWithDescDTO
    num_passengers: PositiveInt


class PostRequestsResponse(BaseModel):
    request_id: uuid.UUID
    matches: List[MatchDTO]


class GetRequestIdResponse(PostRequestsRequest):
    create_time: datetime.datetime
    is_active: bool


class GetRequestIdMatchesResponse(BaseModel):
    matches: List[MatchDTO]


class GetSavedRequestsResponse(BaseModel):
    saved_requests: List[PostRequestsRequest]
