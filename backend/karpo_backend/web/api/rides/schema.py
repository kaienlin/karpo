import datetime
import uuid
from typing import List, Literal

from pydantic import BaseModel, NonNegativeInt

from karpo_backend.web.api.utils import LocationDTO, RouteDTO


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


class ChatRecordDTO(BaseModel):
    user_id: uuid.UUID
    message: str
    time: datetime.datetime


class RideDTO(BaseModel):
    time: datetime.datetime
    source: LocationDTO
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


class GetRideMessagesResponseModel(BaseModel):
    chat_records: List[ChatRecordDTO]


class PostRideMessagesRequestModel(BaseModel):
    chat_record: ChatRecordDTO


class PostRidesRequestModel(BaseModel):
    ride: RideDTO


class PostRidesResponseModel(BaseModel):
    status: str


class PostCommentsRequestModel(BaseModel):
    ride_id: uuid.UUID
    user_id: uuid.UUID
    rate: int
    comment: str


class GetRideSavedRidesResponseModel(BaseModel):
    saved_rides: List[RideDTO]


class GetRideJoinsResponseModel(BaseModel):
    vacant_seat: int
    joins: List[JoinDTO]
