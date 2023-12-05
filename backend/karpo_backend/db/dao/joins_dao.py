import datetime
import uuid
from typing import List, Literal, Optional

from fastapi import Depends
from shapely import LineString, Point, within, wkb
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from karpo_backend.db.dependencies import get_db_session
from karpo_backend.db.models.joins import JoinsModel
from karpo_backend.web.api.utils import LocationWithDescDTO


class JoinsDAO:
    """Class for accessing joins table."""

    def __init__(self, session: AsyncSession = Depends(get_db_session)):
        self.session = session

    async def create_joins_model(
        self,
        request_id: uuid.UUID,
        ride_id: uuid.UUID,
        request_user_id: uuid.UUID,
        ride_user_id: uuid.UUID,
        num_passengers: int,
        # fare: int,
        pick_up_location: LocationWithDescDTO,
        drop_off_location: LocationWithDescDTO,
        pick_up_time: datetime.datetime,
        drop_off_time: datetime.datetime,
        pick_up_distance: float,
        drop_off_distance: float,
    ) -> uuid.UUID:
        join = JoinsModel(
            request_id=request_id,
            ride_id=ride_id,
            request_user_id=request_user_id,
            ride_user_id=ride_user_id,
            num_passengers=num_passengers,
            # fare=,                          # TBA
            status="pending",  # status -> driver_response?
            pick_up_location=f"POINT({pick_up_location.longitude} {pick_up_location.latitude})",
            pick_up_location_description=pick_up_location.description,
            drop_off_location=f"POINT({drop_off_location.longitude} {drop_off_location.latitude})",
            drop_off_location_description=drop_off_location.description,
            pick_up_time=pick_up_time,
            drop_off_time=drop_off_time,
            pick_up_distance=pick_up_distance,
            drop_off_distance=drop_off_distance,
            progress="waiting",
        )
        self.session.add(join)
        await self.session.flush()
        return join.id

    async def get_joins_model_by_id(
        self,
        join_id: uuid.UUID,
    ) -> Optional[JoinsModel]:
        result = await self.session.scalars(
            select(JoinsModel).where(JoinsModel.id == join_id)
        )

        return result.one_or_none()

    async def put_joins_model_by_id(
        self, join_id: uuid.UUID, action: Literal["accpet", "reject"]
    ) -> Optional[JoinsModel]:
        if action == "accept":
            row_updated = self.session.query.filter(JoinsModel.join == join_id).update(
                status="accepted"
            )
        else:
            row_updated = self.session.query.filter(JoinsModel.join == join_id).update(
                status="rejected"
            )
        await self.session.commit()

        return row_updated

    async def get_accepted_joins_model_by_ride_id(
        self,
        ride_id: uuid.UUID,
    ) -> List[JoinsModel]:
        result = await self.session.scalars(
            select(JoinsModel).where(
                (JoinsModel.ride_id == ride_id) & (JoinsModel.status == "accepted")
            )
        )

        return result.all()

    async def get_joins_model_by_ride_id_and_status(
        self,
        ride_id: uuid.UUID,
        status: Literal["pending", "accepted", "rejected", "all"],
    ) -> List[JoinsModel]:
        if status == "all":
            result = await self.session.scalars(
                select(JoinsModel).where((JoinsModel.ride_id == ride_id))
            )
        else:
            result = await self.session.scalars(
                select(JoinsModel).where(
                    (JoinsModel.ride_id == ride_id) & (JoinsModel.status == status)
                )
            )

        return result.all()

    async def get_accepted_joins_by_request_id(
        self,
        request_id: uuid.UUID,
    ) -> Optional[JoinsModel]:
        result = await self.session.scalars(
            select(JoinsModel).where(
                (JoinsModel.request_id == request_id)
                & (JoinsModel.status == "accepted")
            )
        )

        return result.one_or_none()

    async def get_pending_joins_by_request_id(
        self,
        request_id: uuid.UUID,
    ) -> List[JoinsModel]:
        result = await self.session.scalars(
            select(JoinsModel).where(
                (JoinsModel.request_id == request_id) & (JoinsModel.status == "pending")
            )
        )

        return result.all()
