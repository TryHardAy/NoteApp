from notes.models import UpsertNote, Note, NoteLabel
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from core.models import Notes, UserNotes, CategoryNotes, Categories, t_UserCategories, Users
from permissions.service import get_permission, is_owner
from fastapi import HTTPException





def create_note(note: UpsertNote, user_id: str, session: Session) -> Note:
    note_db: Notes = Notes(**note.model_dump())
    session.add(note_db)
    session.flush()

    try:
        session.add(UserNotes(note_id=note_db.id, user_id=user_id, permission=3))
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=500, 
            detail="Error while adding user access to note. Note was not saved. User might not exist."
            )
    
    note = Note.model_validate(note_db)
    note.permission = 3
    return note



def get_note(note_id: int, user_id: str, session: Session) -> Note:
    permission = get_permission(user_id, note_id, session)

    if permission == 0:
        raise HTTPException(
            status_code=403, 
            detail="User does not have permission to access this note"
            )

    stmt = select(Notes).where(Notes.id == note_id)

    try:
        note = session.scalars(stmt).one()
    except Exception as e:
        raise HTTPException(
            status_code=404, 
            detail="Note not found"
            )

    note = Note.model_validate(note)
    note.permission = permission
    return note


def update_note(note_id: int, user_id: str, note: UpsertNote, session: Session) -> Note:
    permission = get_permission(user_id, note_id, session)

    if permission < 2:
        raise HTTPException(
            status_code=403, 
            detail="User does not have permission to modify this note"
            )
    
    stmt = select(Notes).where(Notes.id == note_id)

    try:
        note_db = session.scalars(stmt).one()
    except Exception as e:
        raise HTTPException(
            status_code=404, 
            detail="Note not found"
            )

    note_db.title = note.title
    note_db.content = note.content

    note = Note.model_validate(note_db)
    note.permission = permission
    return note


def delete_note(note_id: int, user_id: str, session: Session) -> Note:
    if not is_owner(user_id, note_id, session):
        raise HTTPException(
            status_code=403, 
            detail="User does not have permission to delete this note"
            )

    stmt = select(Notes).where(Notes.id == note_id)
    
    try:
        note = session.scalars(stmt).one()
    except Exception as e:
        raise HTTPException(
            status_code=404, 
            detail="Note not found"
            )
    note_model = Note.model_validate(note)

    session.delete(note)

    note_model.permission = 3
    return note_model



def get_user_notes(user_id: str, category_id: int, prefix: str, session: Session) -> list[NoteLabel]:
    if category_id != 0:
        user_perm_subq = select(UserNotes.note_id, UserNotes.permission.label("user_permission")).where(UserNotes.user_id=='').subquery()
    else:
        user_perm_subq = (
            select(UserNotes.note_id, UserNotes.permission.label("user_permission"))
            .join(Notes, UserNotes.note_id == Notes.id)
            .where(
                UserNotes.user_id == user_id, 
                UserNotes.permission > 0, 
                Notes.title.like(f"{prefix}%")
            )
            .subquery()
        )

    category_perm_subq = (
        select(CategoryNotes.note_id, func.max(CategoryNotes.permission).label("category_permission"))
        .join(Notes, CategoryNotes.note_id == Notes.id)
        .join(Categories, CategoryNotes.category_id == Categories.id)
        .join(t_UserCategories, t_UserCategories.c.category_id == Categories.id)
        .where(
            t_UserCategories.c.user_id == user_id,
            CategoryNotes.permission > 0,
            Notes.title.like(f"{prefix}%")
        )
        .group_by(CategoryNotes.note_id)
    )

    if category_id != 0:
        category_perm_subq = category_perm_subq.where(Categories.id == category_id).subquery()
    else:
        category_perm_subq = category_perm_subq.subquery()

    owner_subq = (
        select(UserNotes.note_id, Users.name, Users.last_name)
        .join(UserNotes, UserNotes.user_id == Users.id)
        .where(
            UserNotes.note_id == Notes.id,
            UserNotes.permission == 3
        )
        .subquery()
    )
    
    stmt = (
        select(
            Notes.id,
            Notes.title,
            owner_subq.c.name.label("owner_first_name"),
            owner_subq.c.last_name.label("owner_last_name"),
            func.greatest(
                func.coalesce(user_perm_subq.c.user_permission, 0),
                func.coalesce(category_perm_subq.c.category_permission, 0)
            ).label("permission"),
            func.aggregate_strings(Categories.name, separator=" | ").label("categories")
        )
            .outerjoin(CategoryNotes, CategoryNotes.note_id == Notes.id)
            .outerjoin(Categories, Categories.id == CategoryNotes.category_id)
            .outerjoin(user_perm_subq)
            .outerjoin(category_perm_subq)
            .outerjoin(owner_subq)
            .group_by(
                Notes.id, 
                Notes.title,
                owner_subq.c.name,
                owner_subq.c.last_name
        )
            .where(
                (func.coalesce(user_perm_subq.c.user_permission, 0) > 0) |
                (func.coalesce(category_perm_subq.c.category_permission, 0) > 0)
        )
    )
        
    try:
        results = session.execute(stmt).all()
    except Exception as e:
        raise HTTPException(status_code=404, detail="Error while fetching notes: {e}")
    
    return [
        NoteLabel.model_validate(result) 
        for result in results 
    ]
    
