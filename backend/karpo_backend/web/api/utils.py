import datetime
from typing import List, Optional, Tuple

from pydantic import BaseModel
from shapely import LineString, Point


class LocationDTO(BaseModel):
    latitude: float
    longitude: float

    @classmethod
    def from_point(cls, p: Point) -> "LocationDTO":
        return cls(longitude=p.x, latitude=p.y)


class LocationWithDescDTO(LocationDTO):
    description: Optional[str] = None

    @classmethod
    def from_point(cls, p: Point) -> "LocationWithDescDTO":
        return cls(longitude=p.x, latitude=p.y)


class RouteDTO(BaseModel):
    route: List[Tuple[float, float]]
    timestamps: List[datetime.datetime]

    @classmethod
    def from_linestring_and_timestamps(
        cls,
        route: LineString,
        timestamps: List[datetime.datetime],
    ) -> "RouteDTO":
        return cls(
            route=[(p[0], p[1]) for p in route.coords],
            timestamps=list(timestamps),
        )
