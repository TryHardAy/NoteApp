from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from core.db_connection import get_db
from notes.models import Note, NoteLabel, UpsertNote
from users.models import User
from users.auth import authenticate_user
import notes.service as service


router = APIRouter(tags=["Notes"])



@router.post("/note/create", response_model=Note)  
async def create_note(
    note: UpsertNote, 
    session: Session = Depends(get_db),
    _authenticated_user: User = Depends(authenticate_user)
    ):
    return service.create_note(note, _authenticated_user.id, session)


@router.get("/note/{note_id}", response_model=Note)
async def get_note(
    note_id: int, 
    session: Session = Depends(get_db),
    _authenticated_user: User = Depends(authenticate_user)
    ):
    return service.get_note(note_id, _authenticated_user.id, session)


@router.put("/note/{note_id}", response_model=Note)
async def update_note(
    note_id: int, 
    note: UpsertNote, 
    session: Session = Depends(get_db),
    _authenticated_user: User = Depends(authenticate_user)
    ):
    return service.update_note(note_id, _authenticated_user.id, note, session)


@router.delete("/note/{note_id}", response_model=Note)
async def delete_note(
    note_id: int, 
    session: Session = Depends(get_db),
    _authenticated_user: User = Depends(authenticate_user)
    ):
    return service.delete_note(note_id, _authenticated_user.id, session)


@router.get("/notes/{category_id}", response_model=list[NoteLabel])
async def get_user_notes(
    category_id: int = 0,
    prefix: str = "", 
    session: Session = Depends(get_db),
    _authenticated_user: User = Depends(authenticate_user)
    ):
    return service.get_user_notes(_authenticated_user.id, category_id, prefix, session)


