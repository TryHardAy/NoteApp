from categories.models import Category
from sqlalchemy.orm import Session
from sqlalchemy import select, exists, update
from sqlalchemy.exc import NoResultFound
from fastapi import HTTPException
from core.models import t_UserCategories




def add_user_to_category(user_id: str, category_id: int, session: Session):
    userCategory = t_UserCategories(user_id=user_id, category_id=category_id)

    try:
        session.add(userCategory)
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Error adding user to category: {e}")


def remove_user_from_category(user_id: str, category_id: int, session: Session):
    stmt = (
        select(t_UserCategories).
        where(
            t_UserCategories.user_id == user_id,
            t_UserCategories.category_id == category_id
        )
    )
    
    userCategory = session.execute(stmt).scalar_one_or_none()

    if not userCategory:
        raise HTTPException(status_code=404, detail="UserCategory not found")
    
    session.delete(userCategory)


