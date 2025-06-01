from pydantic import BaseModel


class UpsertUser(BaseModel):
    name: str
    last_name: str
    email: str

    class Config:
        from_attributes = True


class User(UpsertUser):
    id: str
    is_admin: bool = False

