import datetime
import uuid
from typing import Literal

from geoalchemy2 import Geography, WKBElement
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func
from sqlalchemy.sql.sqltypes import DateTime

from karpo_backend.db.base import Base


class JoinsModel(Base):
    """Model for a request to join a ride."""

    __tablename__ = "joins"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    request_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("requests.id"))
    ride_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("rides.id"))
    fare: Mapped[int]
    status: Mapped[Literal["pending", "rejected", "accepted"]]
    pick_up_location: Mapped[WKBElement] = mapped_column(
        Geography(geometry_type="POINT", srid=4326, spatial_index=False),
    )
    pick_up_location_description: Mapped[str]
    drop_off_location: Mapped[WKBElement] = mapped_column(
        Geography(geometry_type="POINT", srid=4326, spatial_index=False),
    )
    drop_off_location_description: Mapped[str]
    pick_up_time: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True))
    drop_off_time: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True))
    progress: Mapped[Literal["waiting", "onboard", "fulfilled"]]
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
