from pydantic import BaseModel



class NewPermissionsForm(BaseModel):
    note_id: int
    category_id: int = 0
    category_permission: int = 0
    user_id: str = "0"
    user_permission: int = 0

