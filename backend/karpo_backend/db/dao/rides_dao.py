import datetime
import json
import uuid
from typing import List, Optional, Tuple

from fastapi import Depends
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from karpo_backend.db.dependencies import get_db_session
from karpo_backend.db.models.joins import JoinsModel
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
        intermediates: List[LocationWithDescDTO],
        route_timestamps: List[datetime.datetime],
        departure_time: datetime.datetime,
        num_seats: int,
        num_seats_left: int,
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

        intermediate_list = []
        intermediate_description_list = []
        for intermediate in intermediates:
            intermediate_list.append(f"POINT({intermediate.longitude} {intermediate.latitude})")
            intermediate_description_list.append(intermediate.description)
        

        ride = RidesModel(
            user_id=user_id,
            label=label,
            origin=f"POINT({origin.longitude} {origin.latitude})",
            destination=f"POINT({destination.longitude} {destination.latitude})",
            origin_description=origin.description,
            destination_description=destination.description,
            route=route_str,
            route_timestamps=route_timestamps,
            intermediates=intermediate_list,
            intermediate_descriptions=intermediate_description_list,
            departure_time=departure_time,
            num_seats=num_seats,
            num_seats_left=num_seats_left,
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
            select(RidesModel)
            .where(RidesModel.user_id == user_id)
            .order_by(RidesModel.last_update_time.desc())
            .limit(limit=limit),
        )

        return result.all()

    async def put_phase_position_by_id(
        self,
        ride_id: uuid.UUID,
        phase: int,
        driver_position: LocationWithDescDTO,
        last_update_time: datetime.datetime,
    ) -> None:
        await self.session.execute(
            update(RidesModel)
            .where(RidesModel.id == ride_id)
            .values(
                phase=phase,
                driver_position=f"POINT({driver_position.longitude} {driver_position.latitude})",
                last_update_time=last_update_time,
            )
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

    async def update_schedule_by_ride_id(
        self,
        ride_id: uuid.UUID,
    ) -> None:
        result = await self.session.scalars(
            select(JoinsModel).where(
                (JoinsModel.ride_id == ride_id) & (JoinsModel.status == "accepted")
            )
        )
        accepted_requests = result.all()
        schedule_list = []
        for accepted_request in accepted_requests:
            schedule_list.append(
                {
                    "request_id": str(accepted_request.request_id),
                    "passenger_id": str(accepted_request.request_user_id),
                    "location": str(accepted_request.pick_up_location),
                    "description": str(accepted_request.pick_up_location_description),
                    "time": str(accepted_request.pick_up_time),
                    "status": "pick_up",
                }
            )
            schedule_list.append(
                {
                    "request_id": str(accepted_request.request_id),
                    "passenger_id": str(accepted_request.request_user_id),
                    "location": str(accepted_request.drop_off_location),
                    "description": str(accepted_request.drop_off_location_description),
                    "time": str(accepted_request.drop_off_time),
                    "status": "drop_off",
                }
            )
        schedule_list = sorted(schedule_list, key=lambda item: item["time"])
        schedule_string_list = [json.dumps(stopover) for stopover in schedule_list]
        await self.session.execute(
            update(RidesModel)
            .where(RidesModel.id == ride_id)
            .values(schedule=schedule_string_list)
        )
