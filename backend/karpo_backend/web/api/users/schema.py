from typing import Optional

from pydantic import Base64Str, BaseModel, Field


class UserInfoForOthersDTO(BaseModel):
    name: str
    rating: Optional[float] = Field(None, ge=0, le=5.0)
    avatar: Base64Str
