from pydantic import BaseModel


class User(BaseModel):
    id: str
    name: str
    last_name: str
    email: str


class Note(BaseModel):
    title: str = "Abc"
    content: str

# zmienione
# class NoteTitle(BaseModel):
#     id: int
#     title: str

class NoteTitle(BaseModel):
    id: int
    title: str
    permission: int  # Nowe pole dla permission



class Category(BaseModel):
    id: int = None
    name: str


class NewPermissionsForm(BaseModel):
    note_id: int
    category_id: int = 0
    category_permission: int = 0
    user_id: str = "0"
    user_permission: int = 0

class KeycloakUserCreate(BaseModel):
    userId: str
    firstName: str
    lastName: str
    email: str

class DeleteNoteRequest(BaseModel):
    user_id: str