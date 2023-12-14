from fastapi import APIRouter, Depends, status

from karpo_backend.db.dao.joins_dao import JoinsDAO
from karpo_backend.db.dao.requests_dao import RequestsDAO
from karpo_backend.db.dao.rides_dao import RidesDAO
from karpo_backend.db.models.users import UserCreate  # type: ignore
from karpo_backend.db.models.users import UserRead  # type: ignore
from karpo_backend.db.models.users import UserUpdate  # type: ignore
from karpo_backend.db.models.users import api_users  # type: ignore
from karpo_backend.db.models.users import auth_cookie  # type: ignore
from karpo_backend.db.models.users import User, current_active_user
from karpo_backend.web.api.users.schema import (
    DriverStateDTO,
    GetUserActiveItemsResponse,
    PassengerStateDTO,
)

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
async def get_user_me_active_items(
    requests_dao: RequestsDAO = Depends(),
    rides_dao: RidesDAO = Depends(),
    joins_dao: JoinsDAO = Depends(),
    user: User = Depends(current_active_user),
) -> GetUserActiveItemsResponse:
    """
    Get the active passenger/driver states of the current user.

    #### Response:
    + **driver_state**: non-null if a ride is active currently.
    + **passenger_state**: non-null if a request is active currently.
    If `passenger_state.join_id` is non-null, then there is an *accepted*
    join request, which means `passenger_state.ride_id` is also non-null.
    """
    resp = GetUserActiveItemsResponse(driver_state=None, passenger_state=None)
    active_request = await requests_dao.get_active_request_by_user_id(user.id)
    if active_request is not None:
        state = PassengerStateDTO(
            request_id=active_request.id, join_id=None, ride_id=None
        )

        accepted_join = await joins_dao.get_accepted_joins_by_request_id(
            active_request.id
        )
        if accepted_join is not None:
            state.join_id = accepted_join.id
            state.ride_id = accepted_join.ride_id

        resp.passenger_state = state

    active_ride = await rides_dao.get_active_ride_by_user_id(user.id)
    if active_ride is not None:
        resp.driver_state = DriverStateDTO(
            ride_id=active_ride.id,
        )

    return resp


@router.delete(
    "/users/me/data",
    responses={
        status.HTTP_401_UNAUTHORIZED: {
            "description": "Missing token or inactive user.",
        },
    },
    tags=["users"],
)
async def delete_user_me_data(
    requests_dao: RequestsDAO = Depends(),
    rides_dao: RidesDAO = Depends(),
    joins_dao: JoinsDAO = Depends(),
    user: User = Depends(current_active_user),
) -> None:
    """Burn everything related to a user except their profile."""
    await joins_dao.delete_all_by_user_id(user.id)
    await requests_dao.delete_all_by_user_id(user.id)
    await rides_dao.delete_all_by_user_id(user.id)
