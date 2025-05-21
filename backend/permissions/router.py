from fastapi import APIRouter, Depends, Form
from sqlalchemy.orm import Session
from core.db_connection import get_db
from permissions.models import NewPermissionsForm
from typing import Annotated
import permissions.service as service


router = APIRouter(tags=["Permissions"])



@router.put("/permission/add/{user_id}", response_model=str)
async def add_category_user_permission(
    user_id: str, 
    data: Annotated[NewPermissionsForm, Form()],
    session: Session = Depends(get_db)
    ):
    print(f"{data=}")
    service.add_category_user_permission(data, user_id, session)

    return "Zapisano uprawnienia użytkownika"


