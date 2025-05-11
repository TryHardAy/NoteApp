from fastapi import APIRouter
from users.models import User
import users.service as service
from fastapi import Depends
from sqlalchemy.orm import Session
from core.db_connection import get_db


router = APIRouter(tags=["Users"])


# @router.post("/user/create")
# async def create_user(user: Annotated[User, Form()], db: Session = Depends(get_db)) -> str:
#     create_user(user)
#     return "Zapisano użytkownika"


# @router.post("/user/keycloak/create")
# async def create_user_from_keycloak(user: KeycloakUserCreate):
#     # Sprawdzamy, czy użytkownik już istnieje w bazie danych
#     existing_user = query(check_existing_user, user.userId)

#     if existing_user:
#         raise HTTPException(status_code=400, detail="Użytkownik już istnieje.")

#     # Zapisujemy użytkownika w bazie danych
#     user_id = query(create_keycloak_user, user)

#     return {"id": user_id}


# @router.get("/user/{user_id}")
# async def does_user_exist(user_id: str) -> bool:
#     return query(does_user_exist, user_id)


@router.get("/user/login/{token}", response_model=User)
async def login_user(token: str, session: Session = Depends(get_db)):
    return service.login_user(token, session)


@router.post("/user", response_model=User)
async def update_user(user: User,  session: Session = Depends(get_db)):
    return service.update_user(user, session)


@router.delete("/user/{user_id}")
async def delete_user(user_id: str, session: Session = Depends(get_db)):
    service.delete_user(user_id, session)
    return {"message": f"User {user_id} deleted successfully."}


@router.get("/users/some/{user_id}", response_model=list[User])
async def get_users_except(
    user_id: str, 
    prefix: str = "", 
    session: Session = Depends(get_db)):
    return service.get_users_except(prefix, user_id, session)

