import datetime
import json
import uuid
from typing import List, Optional, Tuple

from fastapi import Depends
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from karpo_backend.db.dependencies import get_db_session
from karpo_backend.db.models.messages import MessagesModel


class MessagesDAO:
    """Class for accessing messages table."""

    def __init__(self, session: AsyncSession = Depends(get_db_session)):
        self.session = session

    async def create_message_model(
        self,
        user_id: uuid.UUID,
        ride_id: uuid.UUID,
        content: str,
        created_at: datetime.datetime,
    ) -> MessagesModel:
        message = MessagesModel(
            user_id=user_id,
            ride_id=ride_id,
            content=content,
            created_at=created_at,
        )
        self.session.add(message)
        await self.session.flush()
        return message

    async def get_message_model_by_ride_id(
        self,
        ride_id: uuid.UUID,
        from_time : datetime.datetime
    ) -> Optional[MessagesModel]:
        result = await self.session.scalars(
            select(MessagesModel).where(
                MessagesModel.ride_id == ride_id, MessagesModel.created_at >= from_time
            ).order_by(MessagesModel.created_at),
        )

        return result.all()
