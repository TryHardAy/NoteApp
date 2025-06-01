from categories.models import Category, UpsertCategory
from sqlalchemy.orm import Session
from sqlalchemy import select
from core.models import Categories
from fastapi import HTTPException
from users.service import is_user_admin



def create_category(category: UpsertCategory, user_id: str, session: Session) -> Category:
    if not is_user_admin(user_id, session):
        raise HTTPException(status_code=403, detail="This user has no permission to create categories")
    
    category_db: Categories = Categories(**category.model_dump())
    session.add(category_db)
    session.flush()

    return Category.model_validate(category_db)


def get_categories(session: Session) -> list[Category]:
    stmt = select(Categories)
    categories = session.scalars(stmt).all()

    return [Category.model_validate(category) for category in categories]


def update_category(category_id: int, name: str, user_id: str, session: Session):
    if not is_user_admin(user_id, session):
        raise HTTPException(status_code=403, detail="This user has no permission to update categories")
    
    try:
        category = session.scalars(select(Categories).where(Categories.id == category_id)).one()
    except Exception as e:
        raise HTTPException(status_code=404, detail="Category not found")
    
    category.name = name
    return Category.model_validate(category)


def delete_category(category_id: int, user_id: str, session: Session) -> Category:
    if not is_user_admin(user_id, session):
        raise HTTPException(status_code=403, detail="This user has no permission to delete categories")
    
    stmt = select(Categories).where(Categories.id == category_id)
    try:
        category = session.scalars(stmt).one()
    except Exception as e:
        raise HTTPException(status_code=404, detail="Category not found")

    model = Category.model_validate(category)
    session.delete(category)
    return model

