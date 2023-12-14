import uuid
from base64 import b64encode

from fastapi_users.db import SQLAlchemyUserDatabase

from karpo_backend.db.dao.requests_dao import RequestsDAO
from karpo_backend.db.dao.rides_dao import RidesDAO
from karpo_backend.db.models.users import User
from karpo_backend.web.api.users.schema import UserInfoForOthersDTO


async def get_user_info_for_others(
    user_id: uuid.UUID,
    user_db: SQLAlchemyUserDatabase,
    requests_dao: RequestsDAO,
    rides_dao: RidesDAO,
) -> UserInfoForOthersDTO:
    user: User = await user_db.get(user_id)
    if user is None:
        raise ValueError(f"user {user_id} does not exists")
    num_requests = await requests_dao.get_num_saved_requests_by_user_id(user_id)
    num_rides = await rides_dao.get_num_saved_rides_by_user_id(user_id)
    return UserInfoForOthersDTO(
        name=user.name,
        rating=user.rating if user.rating else None,
        avatar=b64encode(user.avatar).decode() if user.avatar else None,
        created_at=user.created_at,
        num_requests=num_requests,
        num_rides=num_rides,
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
