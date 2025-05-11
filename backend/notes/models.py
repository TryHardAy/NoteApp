from pydantic import BaseModel

class UpsertNote(BaseModel):
    title: str = "New Note"
    content: str

    class Config:
        from_attributes = True


class Note(UpsertNote):
    id: int
    permission: int = None


class NoteLabel(BaseModel):
    id: int
    title: str
    owner_first_name: str
    owner_last_name: str
    permission: int
    categories: str | None = None

    class Config:
        from_attributes = True


