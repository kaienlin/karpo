from typing import List

from pydantic import BaseModel


class LocationDTO(BaseModel):
    latitude: float
    longitude: float


class RouteDTO(BaseModel):
    route: List[LocationDTO]
