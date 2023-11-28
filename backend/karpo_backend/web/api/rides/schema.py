import datetime
import uuid
from typing import List, Literal

from pydantic import BaseModel, NonNegativeInt

from karpo_backend.web.api.utils import LocationDTO, LocationWithDescDTO, RouteDTO


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
    origin: LocationWithDescDTO
    destination: LocationWithDescDTO
    num_seats: int
    route: RouteDTO


class JoinDTO(BaseModel):
    join_id: uuid.UUID
    passenger_id: uuid.UUID
    pick_up_time: datetime.datetime
    drop_off_time: datetime.datetime
    pick_up_location: LocationWithDescDTO
    drop_off_location: LocationWithDescDTO
    passenger_pick_up_distance: float
    passenger_drop_off_distance: float
    fare: int


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
    num_available_seat: int
    joins: List[JoinDTO]


class StopoverDTO(BaseModel):
    request_id: uuid.UUID
    time: datetime.datetime
    location: LocationWithDescDTO
    status: Literal["pick_up", "drop_off"]


class PutRideIdStatusRequest(BaseModel):
    next_stopover_index: NonNegativeInt


class PutRideIdStatusResponse(BaseModel):
    next_stopover: StopoverDTO


class PutRideIdPositionRequest(BaseModel):
    position: LocationDTO


class GetRideIdScheduleResponse(BaseModel):
    schedule: List[StopoverDTO]
