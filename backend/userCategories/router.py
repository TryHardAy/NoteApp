from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from core.db_connection import get_db
from categories.models import Category
import userCategories.service as service


router = APIRouter(tags=["User Categories"])


@router.post("/user/{user_id}/category/{category_id}")
async def add_user_to_category(
    user_id: str,
    category_id: int,
    session: Session = Depends(get_db)
):
    service.add_user_to_category(user_id, category_id, session)
    return {"message": "User added to category successfully"}


@router.delete("/user/{user_id}/category/{category_id}")
async def remove_user_from_category(
    user_id: str,
    category_id: int,
    session: Session = Depends(get_db)
):
    service.remove_user_from_category(user_id, category_id, session)
    return {"message": "User removed from category successfully"}





