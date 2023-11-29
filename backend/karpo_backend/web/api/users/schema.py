import uuid
from typing import Optional

from pydantic import Base64Str, BaseModel, Field


class UserInfoForOthersDTO(BaseModel):
    name: str
    rating: Optional[float] = Field(None, ge=0, le=5.0)
    avatar: Base64Str


class DriverStateDTO(BaseModel):
    ride_id: uuid.UUID


class PassengerStateDTO(BaseModel):
    request_id: uuid.UUID
    join_id: Optional[uuid.UUID] = None
    ride_id: Optional[uuid.UUID] = None


class GetUserActiveItemsResponse(BaseModel):
    driver_state: Optional[DriverStateDTO]
    passenger_state: Optional[PassengerStateDTO]
