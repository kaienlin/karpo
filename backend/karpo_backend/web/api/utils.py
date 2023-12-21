import datetime
from typing import List, Optional, Tuple

from geoalchemy2 import WKBElement
from pydantic import BaseModel
from pyproj import Geod
from shapely import LineString, Point, wkb


class LocationDTO(BaseModel):
    latitude: float
    longitude: float

    @classmethod
    def from_point(cls, p: Point) -> "LocationDTO":
        return cls(longitude=p.x, latitude=p.y)


class LocationWithDescDTO(LocationDTO):
    description: Optional[str] = None

    @classmethod
    def from_wkb(
        cls,
        wkb_elem: WKBElement,
        desc: Optional[str] = None,
    ) -> "LocationWithDescDTO":
        p: Point = wkb.loads(bytes(wkb_elem.data))
        return cls(longitude=p.x, latitude=p.y, description=desc)

    @classmethod
    def from_point(cls, p: Point, desc: Optional[str] = None) -> "LocationWithDescDTO":
        return cls(longitude=p.x, latitude=p.y, description=desc)


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

    @classmethod
    def from_wkb_and_timestamps(
        cls,
        route_wkb: WKBElement,
        timestamps: List[datetime.datetime],
    ) -> "RouteDTO":
        route: LineString = wkb.loads(bytes(route_wkb.data))
        return cls(
            route=[(p[0], p[1]) for p in route.coords],
            timestamps=list(timestamps),
        )


def get_distance_between_wkb_points(wkb1: WKBElement, wkb2: WKBElement) -> float:
    p1: Point = wkb.loads(wkb1.data)
    p2: Point = wkb.loads(wkb2.data)
    return Geod(ellps="WGS84").geometry_length(LineString([p1, p2]))
