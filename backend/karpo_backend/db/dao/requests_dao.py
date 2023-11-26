import datetime
import uuid
from typing import Optional

from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from karpo_backend.db.dependencies import get_db_session
from karpo_backend.db.models.requests import RequestsModel
from karpo_backend.web.api.utils import LocationDTO


class RequestsDAO:
    """Class for accessing requests table."""

    def __init__(self, session: AsyncSession = Depends(get_db_session)):
        self.session = session

    async def create_requests_model(
        self,
        user_id: uuid.UUID,
        origin: LocationDTO,
        destination: LocationDTO,
        origin_description: Optional[str],
        destination_description: Optional[str],
        num_people: int,
        start_time: datetime.datetime,
        is_active: bool = True,
    ) -> uuid.UUID:
        request = RequestsModel(
            user_id=user_id,
            origin=f"POINT({origin.longitude} {origin.latitude})",
            destination=f"POINT({destination.longitude} {destination.latitude})",
            origin_description=origin_description,
            destination_description=destination_description,
            num_people=num_people,
            start_time=start_time,
            is_active=is_active,
        )
        self.session.add(request)
        await self.session.flush()
        return request.id

    async def get_requests_model_by_id(
        self,
        request_id: uuid.UUID,
    ) -> Optional[RequestsModel]:
        result = await self.session.scalars(
            select(RequestsModel).where(RequestsModel.id == request_id),
        )

        return result.one_or_none()
