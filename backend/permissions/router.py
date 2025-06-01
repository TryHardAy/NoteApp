from fastapi import APIRouter, Depends, Form
from sqlalchemy.orm import Session
from core.db_connection import get_db
from permissions.models import NewPermissionsForm
from typing import Annotated
from users.models import User
from users.auth import authenticate_user
import permissions.service as service


router = APIRouter(tags=["Permissions"])



@router.put("/permission/add", response_model=str)
async def add_category_user_permission(
    data: Annotated[NewPermissionsForm, Form()],
    session: Session = Depends(get_db),
    _authenticated_user: User = Depends(authenticate_user)
    ):
    service.add_category_user_permission(data, _authenticated_user.id, session)

    return "Zapisano uprawnienia użytkownika"


