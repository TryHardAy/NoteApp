from userCategories.models import UserCategory
from sqlalchemy.orm import Session, aliased
from sqlalchemy import select, delete, insert, case, literal
from sqlalchemy.exc import NoResultFound
from fastapi import HTTPException
from core.models import t_UserCategories, Categories
from users.service import is_user_admin




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

    stmt1 = select(Categories)

    try:
        categories = session.scalars(stmt1).all()
    except Exception as e:
        raise HTTPException(status_code=404, detail="Error while fetching categories")

    stmt2 = select(t_UserCategories.c.category_id).where(t_UserCategories.c.user_id == user_id)

    try:
        userCategories = session.scalars(stmt2).all()
    except Exception as e:
        raise HTTPException(status_code=404, detail="Error while fetching UserCategories")

    result = []

    for category in categories:
        result.append(
            UserCategory(
                id=category.id, 
                name=category.name,
                has_user=(category.id in userCategories),
            )
        )

    return result


def update_user_categories(
    categories: list[UserCategory], 
    user_id: str, 
    potential_admin_id: str,
    session: Session
    ):
    if not is_user_admin(potential_admin_id, session):
        raise HTTPException(status_code=403, detail="This user has no permission to get user categories")
    
    to_remove = []
    to_add = []
    for category in categories:
        if category.has_user:
            to_add.append(category.id)
        else:
            to_remove.append(category.id)
    print(f'{to_remove=}')

    if len(to_remove) != 0:
        remove_stmt = (
            delete(t_UserCategories)
            .where(
                t_UserCategories.c.user_id == user_id,
                t_UserCategories.c.category_id.in_(to_remove)
            )
        )
        try:
            session.execute(remove_stmt)
            session.commit()
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
        session.commit()
    except Exception as e:
        raise HTTPException(status_code=404, detail="Error while adding categories to user")
    
    if result.rowcount > 0:
        session.info["has_changes"] = True




    
