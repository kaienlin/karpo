import datetime
from typing import List, Optional, Tuple

from pydantic import BaseModel


class LocationDTO(BaseModel):
    latitude: float
    longitude: float


class LocationWithDescDTO(LocationDTO):
    description: Optional[str] = None


class RouteDTO(BaseModel):
    route: List[Tuple[float, float]] = [(0, 0), (0, 1)] # set a default value for fast test
    timestamps: List[datetime.datetime]
