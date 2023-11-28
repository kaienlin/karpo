import datetime
import uuid

from geoalchemy2 import Geography, WKBElement
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func
from sqlalchemy.sql.sqltypes import ARRAY, DateTime, String

from karpo_backend.db.base import Base


class RidesModel(Base):
    """Model for a driver's ride."""

    __tablename__ = "rides"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("user.id"))
    origin: Mapped[WKBElement] = mapped_column(
        Geography(geometry_type="POINT", srid=4326, spatial_index=False),
    )
    origin_description: Mapped[str]
    destination: Mapped[WKBElement] = mapped_column(
        Geography(geometry_type="POINT", srid=4326, spatial_index=False),
    )
    destination_description: Mapped[str]
    route: Mapped[WKBElement] = mapped_column(
        Geography(geometry_type="LINESTRING", srid=4326, spatial_index=False),
    )
    route_timestamps = mapped_column(
        ARRAY(DateTime(timezone=True)),
    )
    departure_time: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True))
    num_seats: Mapped[int]
    phase: Mapped[int]
    schedule = mapped_column(ARRAY(String))
    driver_position = mapped_column(
        Geography(geometry_type="POINT", srid=4326, spatial_index=False),
    )
    last_update_time: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
