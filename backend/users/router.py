from fastapi import APIRouter
from users.models import User
import users.service as service
from fastapi import Depends
from sqlalchemy.orm import Session
from core.db_connection import get_db
from users.auth import authenticate_user


router = APIRouter(tags=["Users"])


@router.get("/user/login", response_model=User)
async def login_user(
    session: Session = Depends(get_db), 
    _authenticated_user: User = Depends(authenticate_user)
    ):
    return service.login_user(_authenticated_user, session)


@router.get("/users/except", response_model=list[User])
async def get_users_except(
    prefix: str = "", 
    session: Session = Depends(get_db),
    _authenticated_user: User = Depends(authenticate_user)
    ):
    return service.get_users_except(prefix, _authenticated_user.id, session)

