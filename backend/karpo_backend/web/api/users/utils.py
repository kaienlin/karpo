import uuid
from base64 import b64encode

from fastapi_users.db import SQLAlchemyUserDatabase

from karpo_backend.db.models.users import User
from karpo_backend.web.api.users.schema import UserInfoForOthersDTO


async def get_user_info_for_others(
    user_id: uuid.UUID,
    user_db: SQLAlchemyUserDatabase,
) -> UserInfoForOthersDTO:
    user: User = await user_db.get(user_id)
    return UserInfoForOthersDTO(
        name=user.name,
        rating=user.rating if user.rating else None,
        avatar=b64encode(user.avatar) if user.avatar else None,
    )
