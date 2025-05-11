from categories.models import Category, UpsertCategory
from sqlalchemy.orm import Session
from sqlalchemy import select
from core.models import Categories
from fastapi import HTTPException



def create_category(category: UpsertCategory, session: Session) -> Category:
    category_db: Categories = Categories(**category.model_dump())
    session.add(category_db)
    session.flush()

    return Category.model_validate(category_db)


def get_categories(session: Session) -> list[Category]:
    stmt = select(Categories)
    categories = session.scalars(stmt).all()

    return [Category.model_validate(category) for category in categories]


def delete_category(category_id: int, session: Session) -> Category:
    stmt = select(Categories).where(Categories.id == category_id)
    
    try:
        category = session.scalars(stmt).one()
    except Exception as e:
        raise HTTPException(status_code=404, detail="Category not found")

    session.delete(category)

    return Category.model_validate(category)

