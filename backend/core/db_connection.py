from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError
from fastapi import HTTPException
import os

DB_HOST = os.getenv("MYSQL_HOST")
DB_USER = os.getenv("MYSQL_USER")
DB_PASSWORD = os.getenv("MYSQL_PASSWORD")
DB_NAME = os.getenv("MYSQL_DATABASE")

if None in (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME):
    raise ValueError("One or more environment variables are not set.")

DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"

engine = create_engine(DATABASE_URL, echo=False)

print("Database engine created successfully.")


def get_db():
    try:
        db = Session(engine)
    
    except OperationalError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Database connection error: {e}",
        )
    
    yield db
    
    try:
        if has_pending_changes(db):
            db.commit()
            print("Database changes committed successfully.")
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Database commit error: {e}",
        )
    finally:
        db.close()


def has_pending_changes(session: Session) -> bool:
    return (
        session.new or 
        session.dirty or 
        session.deleted or 
        session.info.get("was_flushed", False) or 
        session.info.get("has_changes", False)
    )


@event.listens_for(Session, "after_flush")
def receive_after_flush(session: Session, flush_context):
    session.info["was_flushed"] = True

@event.listens_for(Session, "after_commit")
def receive_after_commit(session: Session):
    session.info["was_flushed"] = False
    session.info["has_changes"] = False

