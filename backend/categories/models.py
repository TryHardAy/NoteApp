from pydantic import BaseModel


class UpsertCategory(BaseModel):
    name: str = "New Category"

    class Config:
        from_attributes = True


class Category(UpsertCategory):
    id: int



