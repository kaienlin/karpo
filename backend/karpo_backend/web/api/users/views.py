from fastapi import APIRouter, status

from karpo_backend.db.models.users import UserCreate  # type: ignore
from karpo_backend.db.models.users import UserRead  # type: ignore
from karpo_backend.db.models.users import UserUpdate  # type: ignore
from karpo_backend.db.models.users import api_users  # type: ignore
from karpo_backend.db.models.users import auth_cookie  # type: ignore
from karpo_backend.web.api.users.schema import GetUserActiveItemsResponse

router = APIRouter()

router.include_router(
    api_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"],
)

router.include_router(
    api_users.get_reset_password_router(),
    prefix="/auth",
    tags=["auth"],
)

router.include_router(
    api_users.get_verify_router(UserRead),
    prefix="/auth",
    tags=["auth"],
)

router.include_router(
    api_users.get_users_router(UserRead, UserUpdate),
    prefix="/users",
    tags=["users"],
)
router.include_router(
    api_users.get_auth_router(auth_cookie),
    prefix="/auth/cookie",
    tags=["auth"],
)


@router.get(
    "/users/me/active_items",
    responses={
        status.HTTP_401_UNAUTHORIZED: {
            "description": "Missing token or inactive user.",
        },
    },
    tags=["users"],
)
async def get_user_me_active_items() -> GetUserActiveItemsResponse:
    """
    Get the active passenger/driver states of the current user.

    #### Response:
    + **driver_state**: non-null if a ride is active currently.
    + **passenger_state**: non-null if a request is active currently.
    If `passenger_state.join_id` is non-null, then there is an *accepted*
    join request, which means `passenger_state.ride_id` is also non-null.
    """
    raise NotImplementedError("QQ")
