import datetime
import uuid
from typing import List, Literal

from pydantic import BaseModel, NonNegativeInt

from karpo_backend.web.api.utils import LocationDTO, RouteDTO


class PostRideIdJoinsRequest(BaseModel):
    request_id: uuid.UUID


class PostRideIdJoinsResponse(BaseModel):
    join_id: uuid.UUID


class GetRideIdJoinIdStatusResponse(BaseModel):
    driver_response: Literal["accepted", "rejected", "pending"]


class GetRideIdStatusResponse(BaseModel):
    driver_position: LocationDTO
    driver_phase: NonNegativeInt


class ChatRecordDTO(BaseModel):
    user_id: uuid.UUID
    message: str
    time: datetime.datetime


class RideDTO(BaseModel):
    time: datetime.datetime
    origin: LocationDTO
    destination: LocationDTO
    num_people: int
    route: RouteDTO


class JoinDTO(BaseModel):
    join_id: uuid.UUID
    passenger_id: uuid.UUID
    get_on_time: datetime.datetime
    get_off_time: datetime.datetime
    get_on_location: LocationDTO
    get_off_location: LocationDTO
    passenger_get_on_distance: float
    passenger_get_off_distance: float
    price: int


class GetRideMessagesResponse(BaseModel):
    chat_records: List[ChatRecordDTO]


class PostRideMessagesRequest(BaseModel):
    chat_record: ChatRecordDTO


class PostRidesRequest(BaseModel):
    ride: RideDTO


class PostRidesResponse(BaseModel):
    ride_id: uuid.UUID


class PostCommentsRequest(BaseModel):
    user_id: uuid.UUID
    rate: int
    comment: str


class GetRideSavedRidesResponse(BaseModel):
    saved_rides: List[RideDTO]


class GetRideJoinsResponse(BaseModel):
    vacant_seat: int
    joins: List[JoinDTO]


class StopoverDTO(BaseModel):
    request_id: uuid.UUID
    time: datetime.datetime
    location: LocationDTO
    status: Literal["get_on", "get_off"]


class PutRideIdStatusRequest(BaseModel):
    next_stopover_index: NonNegativeInt


class PutRideIdStatusResponse(BaseModel):
    next_stopover: StopoverDTO


class PutRideIdPositionRequest(BaseModel):
    position: LocationDTO


class GetRideIdScheduleResponse(BaseModel):
    schedule: List[StopoverDTO]
