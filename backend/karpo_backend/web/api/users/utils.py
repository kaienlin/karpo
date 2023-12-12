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


async def update_user_rating_by_id(
    user_id: uuid.UUID,
    rating: int,
    user_db: SQLAlchemyUserDatabase,
) -> None:
    user: User = await user_db.get(user_id)
    old_rating_count = user.rating_count
    old_rating = user.rating
    if user.rating_count == 0:
        new_rating_count = 1
        new_rating = rating
    else:
        new_rating_count = old_rating_count + 1
        new_rating = (old_rating * old_rating_count + rating) / new_rating_count

    await user_db.update(
        user=user,
        update_dict={
            "rating": new_rating,
            "rating_count": new_rating_count,
        },
    )
