from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi import HTTPException
from permissions.models import NewPermissionsForm
from core.models import (
    UserNotes, 
    CategoryNotes, 
    Categories, 
    t_UserCategories, 
    UserNotes,
    CategoryNotes,
)



def get_permission(user_id: str, note_id: int, session: Session) -> int:
    permission = get_user_permission(user_id, note_id, session)
    
    if permission >= 2:
        return permission

    stmt2 = (
        select(CategoryNotes.permission)
        .join(Categories, CategoryNotes.category_id == Categories.id)
        .join(t_UserCategories, t_UserCategories.c.category_id == Categories.id)
        .where(
            t_UserCategories.c.user_id == user_id,
            CategoryNotes.note_id == note_id,
        )
    )

    try:
        permissions = session.scalars(stmt2).fetchall()
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Error while fetching permission. User or note might not exist.",
        )
    
    if len(permissions) == 0:
        return permission
    
    return max(max(permissions), permission)


def get_user_permission(user_id: str, note_id: int, session: Session) -> int:
    stmt = (
        select(UserNotes.permission)
        .where(UserNotes.user_id == user_id)
        .where(UserNotes.note_id == note_id)
    )

    try:
        permission = session.execute(stmt).scalar_one_or_none()
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Error while fetching permission. User or note might not exist.",
        )

    return permission if permission is not None else 0


def is_owner(user_id: str, note_id: int, session: Session) -> bool:
    return get_user_permission(user_id, note_id, session) == 3
    

def add_category_user_permission(data: NewPermissionsForm, user_id: str, session: Session):
    if not is_owner(user_id, data.note_id, session):
        raise HTTPException(
            status_code=403,
            detail="User does not have permission to add category or user to this note",
        )

    if data.category_permission != 0 and data.category_id != 0:
        try:   
            categoryNote = session.scalars(
                select(CategoryNotes).where(CategoryNotes.category_id == data.category_id, CategoryNotes.note_id == data.note_id)
            ).one_or_none()
        except Exception as e:
            raise HTTPException(status_code=404, detail="Error while fetching CategoryNote")

        if categoryNote is not None:
            categoryNote.permission = data.category_permission
        else:
            categoryNote = CategoryNotes(
                note_id=data.note_id,
                category_id=data.category_id,
                permission=data.category_permission,
            )

            try:
                session.add(categoryNote)
            except Exception as e:
                raise HTTPException(
                    status_code=500,
                    detail="Error while adding category permission. Category might not exist.",
                )
            
    if data.user_permission != 0 and len(data.user_id) != 0:
        try:   
            userNote = session.scalars(
                select(UserNotes).where(UserNotes.user_id == data.user_id, UserNotes.note_id == data.note_id)
            ).one_or_none()
        except Exception as e:
            raise HTTPException(status_code=404, detail="Error while fetching UserNotes")
        
        if userNote is not None:
            userNote.permission = data.user_permission
        else:
            userNote = UserNotes(
                note_id=data.note_id,
                user_id=data.user_id,
                permission=data.user_permission,
            )

            try:
                session.add(userNote)
            except Exception as e:
                raise HTTPException(
                    status_code=500,
                    detail="Error while adding user permission. User might not exist.",
                )


