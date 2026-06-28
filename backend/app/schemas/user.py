# Schema — implemented in Phase 1
from pydantic import BaseModel
from datetime import datetime


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    created_at: datetime

    model_config = {"from_attributes": True}