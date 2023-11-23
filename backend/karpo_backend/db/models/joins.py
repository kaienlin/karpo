import datetime
import uuid

from geoalchemy2 import Geography
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func
from sqlalchemy.sql.sqltypes import DateTime, String

from karpo_backend.db.base import Base


class JoinsModel(Base):
    """Model for a request to join a ride."""

    __tablename__ = "joins"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True)
    request_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("requests.id"))
    ride_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("rides.id"))
    cost: Mapped[int]
    status: Mapped[str] = mapped_column(
        String(length=10),
    )  # pending, rejected, accepted
    get_on_location = mapped_column(
        Geography(geometry_type="POINT", srid=4326, spatial_index=False),
    )
    get_off_location = mapped_column(
        Geography(geometry_type="POINT", srid=4326, spatial_index=False),
    )
    get_on_time: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True))
    get_off_time: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True))
    progress: Mapped[str] = mapped_column(
        String(length=10),
    )  # waiting, onboard, fulfilled
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
