import datetime
import uuid
from typing import Optional

from pydantic import BaseModel, Field, NonNegativeInt


class UserInfoForOthersDTO(BaseModel):
    name: str
    rating: Optional[float] = Field(None, ge=0, le=5.0)
    phone_number: Optional[str] = None
    avatar: Optional[str] = None
    created_at: datetime.datetime
    num_requests: NonNegativeInt
    num_rides: NonNegativeInt


class DriverStateDTO(BaseModel):
    ride_id: uuid.UUID


class PassengerStateDTO(BaseModel):
    request_id: uuid.UUID
    join_id: Optional[uuid.UUID] = None
    ride_id: Optional[uuid.UUID] = None


class GetUserActiveItemsResponse(BaseModel):
    driver_state: Optional[DriverStateDTO]
    passenger_state: Optional[PassengerStateDTO]
