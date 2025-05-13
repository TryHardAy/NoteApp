from pydantic import BaseModel


class UserCategory(BaseModel):
    id: int
    name: str
    has_user: bool

    class Config:
        from_attributes = True

