from pydantic import BaseModel

class UpsertNote(BaseModel):
    title: str = "New Note"
    content: str

    class Config:
        from_attributes = True


class Note(UpsertNote):
    id: int
    permission: int = None


class NoteTitle(BaseModel):
    id: int
    title: str
    permission: int
    categories: str | None = None

    class Config:
        from_attributes = True


