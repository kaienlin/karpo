import datetime
import uuid
from typing import List, Optional, Tuple

from fastapi import Depends
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from karpo_backend.db.dependencies import get_db_session
from karpo_backend.db.models.rides import RidesModel
from karpo_backend.web.api.utils import LocationWithDescDTO


class RidesDAO:
    """Class for accessing rides table."""

    def __init__(self, session: AsyncSession = Depends(get_db_session)):
        self.session = session

    async def create_ride_model(
        self,
        user_id: uuid.UUID,
        label: str,
        origin: LocationWithDescDTO,
        destination: LocationWithDescDTO,
        route: List[Tuple[float, float]],
        waypoints: List[Tuple[float, float]],
        route_timestamps: List[datetime.datetime],
        departure_time: datetime.datetime,
        num_seats: int,
        driver_position: LocationWithDescDTO,
        last_update_time: datetime.datetime,
        schedule: List[str] = [],
        phase: int = -2,
    ) -> uuid.UUID:
        route_str = "LINESTRING("
        for route_point in route:
            route_str += f"{route_point[0]} {route_point[1]}, "
        route_str = route_str[:-2]
        route_str += ")"
        waypoints_str = "LINESTRING("
        for waypoint in waypoints:
            waypoints_str += f"{waypoint[0]} {waypoint[1]}, "
        waypoints_str = waypoints_str[:-2]
        waypoints_str += ")"

        ride = RidesModel(
            user_id=user_id,
            label=label,
            origin=f"POINT({origin.longitude} {origin.latitude})",
            destination=f"POINT({destination.longitude} {destination.latitude})",
            origin_description=origin.description,
            destination_description=destination.description,
            route=route_str,
            waypoints=waypoints_str,
            route_timestamps=route_timestamps,
            departure_time=departure_time,
            num_seats=num_seats,
            phase=phase,
            schedule=schedule,
            driver_position=f"POINT({driver_position.longitude} {driver_position.latitude})",
            last_update_time=last_update_time,
        )
        self.session.add(ride)
        await self.session.flush()
        return ride.id

    async def get_ride_model_by_id(
        self,
        ride_id: uuid.UUID,
    ) -> Optional[RidesModel]:
        result = await self.session.scalars(
            select(RidesModel).where(RidesModel.id == ride_id),
        )

        return result.one_or_none()
    
    async def get_saved_ride_model_by_user_id(
        self,
        user_id: uuid.UUID,
        limit: int,
    ) -> List[RidesModel]:
        result = await self.session.scalars(
            select(RidesModel).where(RidesModel.user_id == user_id).order_by(RidesModel.last_update_time.desc()).limit(limit=limit),
        )

        return result.all()

    async def put_phase_position_by_id(
        self,
        ride_id: uuid.UUID,
        phase: int,
        driver_position: LocationWithDescDTO,
        last_update_time: datetime.datetime
    ) -> None:
        await self.session.execute(
            update(RidesModel)
            .where(RidesModel.id == ride_id)
            .values(phase=phase, 
                    driver_position=f"POINT({driver_position.longitude} {driver_position.latitude})", 
                    last_update_time=last_update_time)
        )

    async def get_phase_position_by_id(
        self,
        ride_id: uuid.UUID,
    ) -> Optional[RidesModel]:
        result = await self.session.scalars(
            select(RidesModel.phase, RidesModel.driver_position).where(
                RidesModel.id == ride_id
            ),
        )
        return result.one_or_none()

    async def get_schedule_by_id(
        self,
        ride_id: uuid.UUID,
    ) -> Optional[RidesModel]:
        result = await self.session.scalars(
            select(RidesModel.schedule).where(RidesModel.id == ride_id),
        )
        return result.one_or_none()
