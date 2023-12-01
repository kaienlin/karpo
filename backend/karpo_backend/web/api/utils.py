import datetime
from typing import List, Optional, Tuple

from pydantic import BaseModel


class LocationDTO(BaseModel):
    latitude: float
    longitude: float


class LocationWithDescDTO(LocationDTO):
    description: Optional[str] = None


class RouteDTO(BaseModel):
    route: List[Tuple[float, float]]
    timestamps: List[datetime.datetime]
