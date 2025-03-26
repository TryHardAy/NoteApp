from fastapi import FastAPI
from pydantic import BaseModel
from pymysql import connect
from pymysql.cursors import Cursor
from collections import defaultdict
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Request
#from mysql.connector import connect, Error 


config = {
    "host": "db",
    "user": "root",
    "password": "password",
    "database": "NotesDB",
}

origins = [
    "http://localhost:5173",  # frontend
    "http://localhost:5000" #backend
]


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Możesz dodać więcej URLi, jeśli potrzebujesz
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class User(BaseModel):
    name: str
    last_name: str
    email: str
    password: str


class Note(BaseModel):
    title: str = "Abc"
    content: str

class NewNote(BaseModel):
    #title: str
    content: str

class Category(BaseModel):
    name: str

@app.post("/newUser")
async def create_user(user: User):
    print("Hello!")
    with connect(**config) as connection:
        cursor = connection.cursor()
        save_user(user, cursor)
        cursor.close()
        connection.commit()

    return {"msg": "Zapisano użytkownika"}


def save_user(user: User, cursor: Cursor):
    query1 = """
INSERT INTO Passwords (password)
VALUES (%s);
"""

    query2 = """
INSERT INTO Users (name, last_name, email, password_id)
VALUES (%s, %s, %s, LAST_INSERT_ID());
"""
    # Zapisywanie hasla
    cursor.execute(query1, (user.password))
    
    # Zapisywanie uzytkownika
    values = (user.name, user.last_name, user.email)
    cursor.execute(query2, values)

@app.post("/newCategory")  # Endpoint do dodawania kategorii
async def create_category(category: Category):
    print("Tworzenie kategorii...")
    with connect(**config) as connection:
        cursor = connection.cursor()
        save_category(category, cursor)  # Funkcja do zapisywania kategorii
        cursor.close()
        connection.commit()

    return {"msg": "Zapisano kategorię"}


def save_category(category: Category, cursor: Cursor):
    query1 = """
INSERT INTO Categories (name)
VALUES (%s);
"""
    # Zapisywanie kategorii
    cursor.execute(query1, (category.name,))

def save_note(note: Note, cursor: Cursor):
    query = """
    INSERT INTO Notes (title, content)
    VALUES (%s, %s);
    """
    cursor.execute(query, (note.title, note.content))

@app.post("/newNote")  
async def create_note(note: Note):
    print("zaczelo sie")
    
    with connect(**config) as connection:
        cursor = connection.cursor()
        print("zapisuje")
        save_note(note, cursor)  # Save the entire note object, including title and content
        print("zapisalem")
        cursor.close()
        connection.commit()
    
    print("skonczylo sie")
    return {"msg": "Zapisano notatkę"}

@app.get("/notes")
async def get_notes():
    with connect(**config) as connection:
        cursor = connection.cursor()
        cursor.execute("SELECT id, title FROM Notes")
        rows = cursor.fetchall()
        cursor.close()
        
        notes = [{"id": row[0], "title": row[1]} for row in rows]
    return notes

@app.get("/notes/{note_id}")
async def get_note(note_id: int):
    with connect(**config) as connection:
        cursor = connection.cursor()
        cursor.execute("SELECT content FROM Notes WHERE id = %s", (note_id,))
        note = cursor.fetchone()
        cursor.close()
    if note:
        return {"content": note[0]}
    return {"error": "Notatka nie istnieje"}
    
@app.delete("/notes/{note_id}")
async def delete_note(note_id: int):
    with connect(**config) as connection:
        cursor = connection.cursor()
        cursor.execute("DELETE FROM Notes WHERE id = %s", (note_id,))
        connection.commit()
        cursor.close()
    return {"message": f"Notatka {note_id} została usunięta"}

@app.put("/notes/{note_id}")
async def update_note(note_id: int, note: dict):
    with connect(**config) as connection:
        cursor = connection.cursor()
        cursor.execute("UPDATE Notes SET content = %s WHERE id = %s", (note["content"], note_id))
        connection.commit()
        cursor.close()
    return {"message": f"Notatka {note_id} została zaktualizowana"}