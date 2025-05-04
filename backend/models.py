from pydantic import BaseModel


class User(BaseModel):
    id: str
    name: str
    last_name: str
    email: str


class Note(BaseModel):
    title: str = "Abc"
    content: str


class NoteTitle(BaseModel):
    id: int
    title: str


class Category(BaseModel):
    id: int = None
    name: str


class NewPermissionsForm(BaseModel):
    note_id: int
    category_id: int = 0
    category_permission: int = 0
    user_id: str = "0"
    user_permission: int = 0

#zmienione
class KeycloakUserCreate(BaseModel):
    userId: str  # ID z tokena Keycloak
    firstName: str
    lastName: str
    email: str