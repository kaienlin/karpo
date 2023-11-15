from pydantic import BaseModel


class LocationDTO(BaseModel):
    latitude: float
    longitude: float
