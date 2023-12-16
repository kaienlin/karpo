import dataclasses
import datetime
from typing import List, Optional, Tuple

from loguru import logger
from pyproj import Geod
from shapely import LineString, Point, within, wkb, wkt
from shapely.ops import nearest_points

from karpo_backend.db.models.requests import RequestsModel
from karpo_backend.db.models.rides import RidesModel


@dataclasses.dataclass
class Match:
    pick_up_location: Point
    drop_off_location: Point
    pick_up_time: datetime.datetime
    drop_off_time: datetime.datetime
    pick_up_distance: float
    drop_off_distance: float
    estimated_passenger_walking_time: float
    estimated_travel_time: float
    fare: int


def clip_route_by_start_time(
    route: LineString,
    ts: List[datetime.datetime],
    start_time: datetime.datetime,
) -> Tuple[LineString, List[datetime.datetime]]:
    i: int = 0
    while i < len(ts) and start_time > ts[i]:
        i += 1
    if i == len(ts):
        raise ValueError("start_time higher than route ending time")

    sub_route = LineString()
    sub_ts = []
    if i > 0 and start_time != ts[i]:
        fraction = (start_time.timestamp() - ts[i - 1].timestamp()) / (
            ts[i].timestamp() - ts[i - 1].timestamp()
        )
        p0 = LineString(route.coords[i - 1 : i + 1]).interpolate(  # noqa: WPS221
            fraction,
            normalized=True,
        )
        sub_route = LineString([p0] + route.coords[i:])
        sub_ts = [start_time] + ts[i:]
    else:
        sub_route = LineString(route.coords[i:])
        sub_ts = ts[i:]

    return sub_route, sub_ts


def find_point_idx_on_linestring(point: Point, line: LineString) -> int:
    for i in range(len(line.coords) - 1):
        p1 = Point(line.coords[i])
        p2 = Point(line.coords[i + 1])
        segment = LineString([p1, p2])
        if point == p1 or point == p2 or within(point, segment):
            return i
    return 0


def calc_distance(p1: Point, p2: Point) -> float:
    geod = Geod(ellps="WGS84")
    return geod.geometry_length(LineString([p1, p2]))


def get_rendezvous_point_and_dist(
    route: LineString,
    origin: Point,
) -> Tuple[Point, float]:
    rendezvous_point, _ = nearest_points(route, origin)
    dist = calc_distance(origin, rendezvous_point)
    return rendezvous_point, dist


def estimate_walking_time(distance: float) -> datetime.timedelta:
    return datetime.timedelta(seconds=distance / 1.2)


def evaluate_match(  # noqa: WPS210
    ride: RidesModel,
    req: RequestsModel,
) -> Optional[Match]:
    if req.start_time > ride.route_timestamps[-1]:
        return None

    route = wkb.loads(bytes(ride.route.data))

    if isinstance(req.origin, str):
        origin: Point = wkt.loads(req.origin)
        destination: Point = wkt.loads(req.destination)
    else:
        origin: Point = wkb.loads(bytes(req.origin.data))
        destination: Point = wkb.loads(bytes(req.destination.data))

    sub_route, sub_ts = clip_route_by_start_time(
        route,
        ride.route_timestamps,
        req.start_time,
    )

    pick_up_loc, dist_origin = get_rendezvous_point_and_dist(sub_route, origin)
    drop_off_loc, dist_destination = get_rendezvous_point_and_dist(
        sub_route,
        destination,
    )

    pick_up_time_lb = sub_ts[find_point_idx_on_linestring(pick_up_loc, sub_route)]
    if pick_up_time_lb < req.start_time + estimate_walking_time(dist_origin):
        logger.debug(
            f"rejecting the match between request {req.id} "
            f"and ride {ride.id} because the passenger cannot arrive on time"
        )
        return None

    walking_dist: float = dist_origin + dist_destination
    estimated_walking_time = estimate_walking_time(walking_dist).total_seconds()
    if estimated_walking_time > 60 * 30:
        logger.debug(
            f"rejecting the match between request {req.id} and ride {ride.id} due to long walking time"
        )
        return None

    drop_off_time_ub = sub_ts[find_point_idx_on_linestring(drop_off_loc, sub_route) + 1]
    estimated_arrival_time = drop_off_time_ub + estimate_walking_time(dist_destination)
    driving_dist = calc_distance(pick_up_loc, drop_off_loc)
    fare = 50
    if driving_dist > 1000:
        fare += int((driving_dist - 1000) * 0.02)

    logger.debug(
        f"evaluated the match between request {req.id} and ride {ride.id}. "
        f"pick_up_distance={dist_origin}, drop_off_distance={dist_destination}, "
        f"pick_up_location=({pick_up_loc.x}, {pick_up_loc.y}), drop_off_location=({drop_off_loc.x}, {drop_off_loc.y}), "
        f"pick_up_time={pick_up_time_lb}, drop_off_time={drop_off_time_ub}"
    )

    return Match(
        pick_up_location=pick_up_loc,
        drop_off_location=drop_off_loc,
        pick_up_time=pick_up_time_lb,
        drop_off_time=drop_off_time_ub,
        pick_up_distance=dist_origin,
        drop_off_distance=dist_destination,
        estimated_passenger_walking_time=estimated_walking_time,
        estimated_travel_time=(estimated_arrival_time - req.start_time).seconds,
        fare=fare,
    )
