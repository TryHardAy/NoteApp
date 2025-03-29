from fastapi import FastAPI, Form
from pydantic import BaseModel
from pymysql import connect
from pymysql.cursors import Cursor
from collections import defaultdict
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Request
from typing import Annotated
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


class User2(BaseModel):
    id: int
    name: str
    last_name: str
    email: str


class Note(BaseModel):
    title: str = "Abc"
    content: str


class NoteTitle(BaseModel):
    id: int
    title: str


class NewNote(BaseModel):
    #title: str
    content: str


class Category(BaseModel):
    name: str


class Category2(BaseModel):
    id: int
    name: str


class NewPermissionsForm(BaseModel):
    note_id: int
    category_id: int = 0
    category_permission: int = 0
    user_id: int = 0
    user_permission: int = 0


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


def save_note(note: Note, user_id: int, cursor: Cursor):
    query1 = """
INSERT INTO Notes (title, content)
VALUES (%s, %s);
"""
    query2 = """
INSERT INTO UserNotes (user_id, note_id, permission)
VALUES (%s, LAST_INSERT_ID(), 3);
"""
    cursor.execute(query1, (note.title, note.content))
    cursor.execute(query2, (user_id))


@app.post("/note/create/{user_id}")  
async def create_note(note: Note, user_id: int):
    with connect(**config) as connection:
        cursor = connection.cursor()
        save_note(note, user_id, cursor)  # Save the entire note object, including title and content
        cursor.close()
        connection.commit()
    
    return {"msg": "Zapisano notatkę"}


@app.get("/notes/{user_id}")
async def get_user_notes(user_id: int) -> list[NoteTitle]:
    with connect(**config) as connection:
        cursor = connection.cursor()

        notes = get_user_notes_titles(user_id, cursor)
        cursor.close()
        
    return [NoteTitle(id=note[0], title=note[1]) for note in notes]


def get_user_notes_titles(user_id: int, cursor: Cursor) -> list[tuple[int, str]]:
    query1 = """
SELECT Notes.id, Notes.title FROM Notes
INNER JOIN UserNotes ON Notes.id = UserNotes.note_id
INNER JOIN Users ON UserNotes.user_id = %s
WHERE UserNotes.permission > 0;
"""
    
    cursor.execute(query1, (user_id))
    notes1 = cursor.fetchall()

    query2 = """
SELECT Notes.id, Notes.title FROM Notes
INNER JOIN CategoryNotes ON Notes.id = CategoryNotes.note_id
INNER JOIN Categories ON CategoryNotes.category_id = Categories.id
INNER JOIN UserCategories ON Categories.id = UserCategories.category_id
INNER JOIN Users ON UserCategories.user_id = %s
WHERE CategoryNotes.permission > 0;
"""

    cursor.execute(query2, (user_id))
    notes2 = cursor.fetchall()
    
    return list(dict.fromkeys(notes1 + notes2))


@app.get("/note/{note_id}")
async def get_note(note_id: int):
    with connect(**config) as connection:
        cursor = connection.cursor()
        cursor.execute("SELECT content FROM Notes WHERE id = %s", (note_id,))
        note = cursor.fetchone()
        cursor.close()
    if note:
        return {"content": note[0]}
    return {"error": "Notatka nie istnieje"}


@app.delete("/note/{note_id}")
async def delete_note(note_id: int):
    with connect(**config) as connection:
        cursor = connection.cursor()
        cursor.execute("DELETE FROM UserNotes WHERE note_id = %s;", (note_id))
        cursor.execute("DELETE FROM CategoryNotes WHERE note_id = %s;", (note_id))
        cursor.execute("DELETE FROM Notes WHERE id = %s;", (note_id))
        connection.commit()
        cursor.close()
    return {"message": f"Notatka {note_id} została usunięta"}


@app.put("/note/{note_id}")
async def update_note(note_id: int, note: dict):
    with connect(**config) as connection:
        cursor = connection.cursor()
        cursor.execute("UPDATE Notes SET content = %s WHERE id = %s", (note["content"], note_id))
        connection.commit()
        cursor.close()
    return {"message": f"Notatka {note_id} została zaktualizowana"}


@app.put("/note/category/add")
async def add_category_user_permission(data: Annotated[NewPermissionsForm, Form()]) -> str:
    if data.category_id == 0 and data.user_id == 0:
        return "Brak danych do zapisania"
    
    with connect(**config) as connection:
        cursor = connection.cursor()

        template = """
INSERT INTO {table}({column}, note_id, permission)
VALUES (%s, %s, %s)
ON DUPLICATE KEY UPDATE
    permission = %s;
"""
        if data.category_id != 0:
            query = template.format(table='CategoryNotes', column='category_id')
            cursor.execute(query, (
                data.category_id,
                data.note_id,
                data.category_permission,
                data.category_permission
                ))
            print("Przypisano Categorie do Notatki")
        
        if data.user_id != 0:
            query = template.format(table='UserNotes', column='user_id')
            cursor.execute(query, (
                data.user_id,
                data.note_id,
                data.user_permission,
                data.user_permission
                ))
            print("Przypisano Usera do Notatki")

        connection.commit()
        cursor.close()
    return "Zapisano uprawnienia poprawnie"


@app.get("/categories")
async def get_categories() -> list[Category2]:
    with connect(**config) as connection:
        cursor = connection.cursor()

        cursor.execute("SELECT * FROM Categories")
        categories = list(cursor.fetchall())

        connection.commit()
        cursor.close()

    return [Category2(id=x[0], name=x[1]) for x in categories]


@app.get("/Users/some/{user_id}")
async def get_some_users(prefix: str, user_id: int) -> list[User2]:
    with connect(**config) as connection:
        cursor = connection.cursor()

        query = f"""
SELECT id, name, last_name, email
FROM Users 
WHERE (name LIKE '{prefix}%' 
OR last_name LIKE '{prefix}%' 
OR CONCAT(name, ' ', last_name) LIKE '{prefix}%' 
OR CONCAT(last_name, ' ', name) LIKE '{prefix}%')
AND id != {user_id};
"""
        cursor.execute(query)
        users = list(cursor.fetchall())

        connection.commit()
        cursor.close()
    return [User2(id=x[0], name=x[1], last_name=x[2], email=x[3]) for x in users]


@app.get("/notes/some/{user_id}")
async def get_some_notes(prefix: str, user_id: int):
    with connect(**config) as connection:
        cursor = connection.cursor()

        notes = get_user_notes_titles(user_id, cursor)
        cursor.close()
    prefix = prefix.lower()
    return [NoteTitle(id=note[0], title=note[1]) for note in notes if note[1].lower().startswith(prefix)]

