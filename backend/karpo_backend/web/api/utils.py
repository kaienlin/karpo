from typing import List, Optional

from pydantic import BaseModel


class LocationDTO(BaseModel):
    latitude: float
    longitude: float


class LocationWithDescDTO(LocationDTO):
    description: Optional[str] = None


class RouteDTO(BaseModel):
    route: List[LocationDTO]
