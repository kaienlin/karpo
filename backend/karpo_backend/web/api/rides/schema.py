import datetime
import uuid
from typing import List, Literal, Optional, Tuple

from pydantic import BaseModel, NonNegativeInt, PositiveInt

from karpo_backend.web.api.users.schema import UserInfoForOthersDTO
from karpo_backend.web.api.utils import LocationDTO, LocationWithDescDTO, RouteDTO


class PostRideIdJoinsRequest(BaseModel):
    request_id: uuid.UUID


class PostRideIdJoinsResponse(BaseModel):
    join_id: uuid.UUID


class GetRideIdJoinIdStatusResponse(BaseModel):
    driver_response: Literal["accepted", "rejected", "pending"]


class GetRideIdStatusResponse(BaseModel):
    driver_position: LocationDTO
    phase: int


class PatchRideIdStatusRequest(BaseModel):
    driver_position: LocationDTO
    phase: Optional[int] = None


class ChatRecordDTO(BaseModel):
    user_id: uuid.UUID
    message: str
    time: datetime.datetime


class RideDTO(BaseModel):
    origin: LocationWithDescDTO
    destination: LocationWithDescDTO
    route_with_time: RouteDTO
    departure_time: datetime.datetime
    num_seats: int


class GetRideIdResponse(BaseModel):
    ride: RideDTO


class JoinDTO(BaseModel):
    join_id: uuid.UUID
    passenger_id: uuid.UUID
    pick_up_time: datetime.datetime
    drop_off_time: datetime.datetime
    pick_up_location: LocationWithDescDTO
    drop_off_location: LocationWithDescDTO
    passenger_pick_up_distance: float
    passenger_drop_off_distance: float
    num_passengers: PositiveInt
    fare: int


class GetRideMessagesResponse(BaseModel):
    chat_records: List[ChatRecordDTO]


class PostRideMessagesRequest(BaseModel):
    chat_record: ChatRecordDTO


class googleMapAPIrouteDTO(BaseModel):
    steps: List[List[Tuple[float, float]]] = [[(0, 0), (0, 1)], [(0, 1), (0, 2), (0, 3), (0, 5)]] # for quick test
    durations: List[int] = [1, 2] # for quick test

class PostRidesRequest(BaseModel):
    origin: LocationWithDescDTO
    destination: LocationWithDescDTO
    route: googleMapAPIrouteDTO
    departure_time: datetime.datetime
    num_seats: PositiveInt


class PostRidesResponse(BaseModel):
    ride_id: uuid.UUID


class PostCommentsRequest(BaseModel):
    user_id: uuid.UUID
    rate: int
    comment: str


class GetRideSavedRidesResponse(BaseModel):
    saved_rides: List[RideDTO]


class GetRideJoinsResponse(BaseModel):
    num_available_seat: int
    joins: List[JoinDTO]


class StopoverDTO(BaseModel):
    request_id: uuid.UUID
    passenger_info: UserInfoForOthersDTO
    time: datetime.datetime
    location: LocationWithDescDTO
    status: Literal["pick_up", "drop_off"]


class PutRideIdJoinsJoinIdStatusRequest(BaseModel):
    action: Literal["reject", "accept"]


class GetRideIdScheduleResponse(BaseModel):
    schedule: List[StopoverDTO]
