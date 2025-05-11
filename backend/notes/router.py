from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from core.db_connection import get_db
from notes.models import Note, NoteLabel, UpsertNote
import notes.service as service


router = APIRouter(tags=["Notes"])



@router.post("/note/create/{user_id}", response_model=Note)  
async def create_note(
    note: UpsertNote, 
    user_id: str, 
    session: Session = Depends(get_db)
    ):
    return service.create_note(note, user_id, session)


@router.get("/note/{note_id}/{user_id}", response_model=Note)
async def get_note(
    note_id: int, 
    user_id: str, 
    session: Session = Depends(get_db)
    ):
    return service.get_note(note_id, user_id, session)


@router.put("/note/{note_id}/{user_id}", response_model=Note)
async def update_note(
    note_id: int, 
    user_id: str, 
    note: UpsertNote, 
    session: Session = Depends(get_db)
    ):
    return service.update_note(note_id, user_id, note, session)


@router.delete("/note/{note_id}/{user_id}", response_model=Note)
async def delete_note(
    note_id: int, 
    user_id: str, 
    session: Session = Depends(get_db)
    ):
    return service.delete_note(note_id, user_id, session)


@router.get("/notes/{user_id}", response_model=list[NoteLabel])
async def get_user_notes(
    user_id: str, 
    prefix: str = "", 
    session: Session = Depends(get_db)
    ):
    return service.get_user_notes(user_id, prefix, session)


# @router.get("/notes/{user_id}")
# async def get_user_notes(user_id: str) -> list[NoteTitle]:
#     notes: list[dict] = query_db(dq.get_user_notes, user_id)
#     # Zwracamy zaktualizowaną odpowiedź, uwzględniając permission
#     return [
#         NoteTitle(id=note["id"], title=note["title"], permission=note["permission"])
#         for note in notes
#     ]

