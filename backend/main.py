from fastapi import FastAPI
from pydantic import BaseModel
from pymysql import connect
from pymysql.cursors import Cursor
from collections import defaultdict
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Request


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
    INSERT INTO Notes (note_name, content)
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

