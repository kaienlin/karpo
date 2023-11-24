import datetime
import uuid

from geoalchemy2 import Geography
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func
from sqlalchemy.sql.sqltypes import DateTime, String

from karpo_backend.db.base import Base


class RequestsModel(Base):
    """Model for a passenger's request."""

    __tablename__ = "requests"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True)
    origin = mapped_column(
        Geography(geometry_type="POINT", srid=4326, spatial_index=False),
    )
    destination = mapped_column(
        Geography(geometry_type="POINT", srid=4326, spatial_index=False),
    )
    origin_description: Mapped[str] = mapped_column(String(length=320))
    destination_description: Mapped[str] = mapped_column(String(length=320))
    num_people: Mapped[int]
    start_time: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True))
    is_active: Mapped[bool]
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
