import datetime
import uuid
from typing import Literal, Optional

from fastapi import Depends
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
