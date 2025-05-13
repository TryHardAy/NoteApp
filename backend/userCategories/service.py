from userCategories.models import UserCategory
from sqlalchemy.orm import Session, aliased
from sqlalchemy import select, delete, insert, case, literal
from sqlalchemy.exc import NoResultFound
from fastapi import HTTPException
from core.models import t_UserCategories, Categories




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


def get_user_categories(user_id: str, session: Session) -> list[UserCategory]:
    # userCategoryAlias = aliased(t_UserCategories)

    stmt = (
        select(
            Categories.id, 
            Categories.name,
            case(
                (t_UserCategories.c.user_id == user_id, True),
                else_=False
            ).label("has_user")
        )
        .outerjoin(
            t_UserCategories, 
            Categories.id == t_UserCategories.c.category_id
        )
    )
    
    try:
        categories = session.execute(stmt).fetchall()
    except Exception as e:
        raise HTTPException(status_code=404, detail="Error while fetching categories")

    return [UserCategory.model_validate(category) for category in categories]


def update_user_categories(
    categories: list[UserCategory], 
    user_id: str, 
    session: Session
    ):
    
    to_remove = []
    to_add = []
    for category in categories:
        if category.has_user:
            to_add.append(category.id)
        else:
            to_remove.append(category.id)

    remove_stmt = (
        delete(t_UserCategories)
        .where(
            t_UserCategories.c.user_id == user_id,
            t_UserCategories.c.category_id.in_(to_remove)
        )
    )

    try:
        session.execute(remove_stmt)
    except Exception as e:
        raise HTTPException(status_code=404, detail="Error while removing categories from user")

    is_exists_stmt = (
        select(t_UserCategories.c.category_id)
        .where(
            t_UserCategories.c.user_id == user_id,
            t_UserCategories.c.category_id.in_(to_add)
        )
    )

    try:
        result = session.scalars(is_exists_stmt).all()
    except Exception as e:
        raise HTTPException(status_code=404, detail="Error while fetching categories")
    
    to_add2 = [{"user_id": user_id, "category_id": id} for id in to_add if id not in result]

    if len(to_add2) == 0:
        return

    try:
        result = session.execute(t_UserCategories.insert().values(to_add2))
    except Exception as e:
        raise HTTPException(status_code=404, detail="Error while adding categories to user")
    
    if result.rowcount > 0:
        session.info["has_changes"] = True




    
