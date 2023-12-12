import datetime
import uuid
from typing import List, Optional, Tuple

from shapely import Point
from fastapi import Depends
from geoalchemy2 import Geography
from geoalchemy2.shape import to_shape  # noqa: WPS347
from sqlalchemy import func, select, type_coerce
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql.expression import true

from karpo_backend.db.dependencies import get_db_session
from karpo_backend.db.models.requests import RequestsModel
from karpo_backend.db.models.rides import RidesModel
from karpo_backend.matching import Match, evaluate_match
from karpo_backend.web.api.utils import LocationWithDescDTO


class RequestsDAO:
    """Class for accessing requests table."""

    def __init__(self, session: AsyncSession = Depends(get_db_session)):
        self.session = session

    async def create_requests_model(
        self,
        user_id: uuid.UUID,
        origin: LocationWithDescDTO,
        destination: LocationWithDescDTO,
        num_passengers: int,
        start_time: datetime.datetime,
        is_active: bool = True,
    ) -> RequestsModel:
        request = RequestsModel(
            user_id=user_id,
            origin=f"POINT({origin.longitude} {origin.latitude})",
            destination=f"POINT({destination.longitude} {destination.latitude})",
            origin_description=origin.description,
            destination_description=destination.description,
            num_passengers=num_passengers,
            start_time=start_time,
            is_active=is_active,
        )
        self.session.add(request)
        await self.session.flush()
        return request

    async def get_requests_model_by_id(
        self,
        request_id: uuid.UUID,
    ) -> Optional[RequestsModel]:
        result = await self.session.scalars(
            select(RequestsModel).where(RequestsModel.id == request_id),
        )

        return result.one_or_none()

    async def get_active_request_by_user_id(
        self,
        user_id: uuid.UUID,
    ) -> Optional[RequestsModel]:
        result = await self.session.scalars(
            select(RequestsModel).where(
                (RequestsModel.user_id == user_id)
                & (RequestsModel.is_active == true()),
            )
        )

        return result.one_or_none()

    async def get_saved_request_by_user_id(
        self,
        user_id: uuid.UUID,
        limit: int,
    ) -> List[RequestsModel]:
        result = await self.session.scalars(
            select(RequestsModel)
            .where(RequestsModel.user_id == user_id)
            .order_by(RequestsModel.created_at.desc())
            .limit(limit=limit),
        )

        return result.all()

    async def get_request_matches(  # noqa: WPS210
        self,
        requests_model: RequestsModel,
        limit: int,
    ) -> List[Tuple[RidesModel, Match]]:
        origin = requests_model.origin
        destination = requests_model.destination
        if not isinstance(origin, str):
            origin = to_shape(origin).wkt
            destination = to_shape(destination).wkt

        query = (
            select(RidesModel)
            .where(
                (RidesModel.phase < 0)
                & (RidesModel.num_seats >= requests_model.num_passengers)
                & (
                    RidesModel.route_timestamps[
                        func.array_length(RidesModel.route_timestamps, 1)
                    ]
                    > requests_model.start_time
                ),
            )
            .order_by(
                func.ST_Distance(type_coerce(origin, Geography), RidesModel.route)
                + func.ST_Distance(
                    type_coerce(destination, Geography),
                    RidesModel.route,
                ),
            )
        )
        candidates = await self.session.scalars(query)
        results: List[RidesModel] = []
        for partition in candidates.partitions(size=100):
            evaled_matches: List[Tuple[RidesModel, Match]] = []
            for ride in partition:
                match = evaluate_match(ride, requests_model)
                if match is not None:
                    evaled_matches.append((ride, match))

            evaled_matches.sort(key=lambda it: it[1].estimated_travel_time)
            while evaled_matches and len(results) < limit:
                results.append(evaled_matches[0])
                evaled_matches.pop(0)

            if len(results) == limit:
                break

        return results
