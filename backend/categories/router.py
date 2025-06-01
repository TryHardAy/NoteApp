from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from core.db_connection import get_db
from categories.models import Category, UpsertCategory, CategoryNameUpdate
from users.models import User
from users.auth import authenticate_user
import categories.service as service


router = APIRouter(tags=["Categories"])



@router.post("/category/create", response_model=Category)
async def create_category(
    category: UpsertCategory, 
    session: Session = Depends(get_db),
    _authenticated_user: User = Depends(authenticate_user)
    ):
    return service.create_category(category, _authenticated_user.id, session)


@router.get("/categories", response_model=list[Category])
async def get_categories(session: Session = Depends(get_db)):
    return service.get_categories(session)


@router.put("/category/{category_id}", response_model=Category)
async def update_category(
    category_id: int, 
    category_name: CategoryNameUpdate, 
    session: Session = Depends(get_db),
    _authenticated_user: User = Depends(authenticate_user)
    ):
    return service.update_category(category_id, category_name.name, _authenticated_user.id, session)


@router.delete("/category/{category_id}", response_model=Category)
async def delete_category(
    category_id: int, 
    session: Session = Depends(get_db),
    _authenticated_user: User = Depends(authenticate_user)
    ):
    return service.delete_category(category_id, _authenticated_user.id, session)


