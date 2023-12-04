import uuid
from typing import List, Literal, Optional

from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from karpo_backend.db.dependencies import get_db_session
from karpo_backend.db.models.joins import JoinsModel


class JoinsDAO:
    """Class for accessing joins table."""

    def __init__(self, session: AsyncSession = Depends(get_db_session)):
        self.session = session

    async def create_joins_model(
        self,
        ride_id: uuid.UUID,
        request_id: uuid.UUID,
    ) -> uuid.UUID:
        join = JoinsModel(
            request_id=request_id,
            ride_id=ride_id,
            # fare=,                          # TBA
            status="pending",  # status -> driver_response?
            # pick_up_location=,              # TBA
            # pick_up_location_description=,  # TBA
            # drop_off_location=,             # TBA
            # drop_off_location_description=, # TBA
            # pick_up_time=,                  # TBA
            # drop_off_time=,                 # TBA
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
