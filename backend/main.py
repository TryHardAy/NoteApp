from fastapi import FastAPI
from pydantic import BaseModel
from pymysql import connect
from pymysql.cursors import Cursor
from collections import defaultdict


config = {
    "host": "db",
    "user": "root",
    "password": "password",
    "database": "NotesDB",
}

app = FastAPI()


class User(BaseModel):
    name: str
    last_name: str
    email: str
    password: str


class Note(BaseModel):
    id: int
    title: str
    content: str
    permission: int

    #def __init__(self, id: int, title: str, content: str, permission: int):
        #self.id = id
        #self.title = title
        #self.content = content
        #self.permission = permission
        #super().__init__()


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


@app.get("/notes")
async def get_User_Notes(email: str) -> dict[str, list[Note] | str]:
    data = "Nie udalo się pobrac Notatnikow"

    with connect(**config) as connection:
        cursor = connection.cursor()
        try:
            data = get_Notes(email, cursor)
        except:
            print("Nie udało się pobrać Notesow z bazy danych")
            
        cursor.close()
        connection.commit()

    return {"notes": data}


def get_Notes(email: str, cursor: Cursor) -> list[Note]:
    query1 = """
SELECT Notes.id, Notes.note_name, Notes.content, UserNotes.permission FROM Notes
INNER JOIN UserNotes ON Notes.id = UserNotes.note_id
INNER JOIN Users ON UserNotes.user_id = Users.id
WHERE Users.email = %s;
"""
    
    cursor.execute(query1, (email))
    notes1 = cursor.fetchall()

    query2 = """
SELECT Notes.id, Notes.note_name, Notes.content, CategoryNotes.permission FROM Notes
INNER JOIN CategoryNotes ON Notes.id = CategoryNotes.note_id
INNER JOIN Categories ON CategoryNotes.category_id = Categories.id
INNER JOIN UserCategories ON Category.id = UserCategories.category_id
INNER JOIN Users ON UserCategories.user_id = Users.id
WHERE Users.email = %s;
"""

    cursor.execute(query2, (email))
    notes2 = cursor.fetchall()

    notes: tuple[tuple[int, str, str, int]] = notes1 + notes2

    no_duplicats_notes = []
    grouped = defaultdict(list)

    for item in notes:
        grouped[item[0]].append(item)

    for key, group in grouped.items():
        max_item = max(group, key=lambda x: x[-1])
        no_duplicats_notes.append(Note(
            id=max_item[0], 
            title=max_item[1], 
            content=max_item[2], 
            permission=max_item[3]
            ))
    
    return no_duplicats_notes