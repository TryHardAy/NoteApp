from fastapi import FastAPI, Form
from pymysql import connect
from pymysql.cursors import Cursor
from fastapi.middleware.cors import CORSMiddleware
from typing import Annotated, Callable, Any
import database_queries as dq
import requests
from fastapi import HTTPException, Header
from dotenv import load_dotenv
from jose import jwt
import os
from models import (
    User,
    Note,
    NoteTitle,
    Category,
    NewPermissionsForm,
    KeycloakUserCreate,
    DeleteNoteRequest
)


app = FastAPI()

config = {
    "host": "db",
    "user": "root",
    "password": "password",
    "database": "NotesDB",
}

origins = [
    "http://localhost:5173",  # frontend
    #"http://localhost:5000" #backend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Możesz dodać więcej URLi, jeśli potrzebujesz
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==============================
# 🚀 POST FUNCTIONS SECTION 🚀
# ==============================

#region POST FUNCTIONS

@app.post("/user/create")
async def create_user(user: Annotated[User, Form()]) -> str:
    query_db(dq.create_user, user)
    return "Zapisano użytkownika"


@app.post("/category/create")
async def create_category(category: Category):
    query_db(dq.create_category, category)
    return "Zapisano kategorię"


@app.post("/note/create/{user_id}")  
async def create_note(note: Note, user_id: str):
    query_db(dq.create_note, note, user_id)
    return "Zapisano notatkę"

#zmienione
@app.post("/user/keycloak/create")
async def create_user_from_keycloak(user: KeycloakUserCreate):
    # Sprawdzamy, czy użytkownik już istnieje w bazie danych
    existing_user = query_db(dq.check_existing_user, user.userId)

    if existing_user:
        raise HTTPException(status_code=400, detail="Użytkownik już istnieje.")

    # Zapisujemy użytkownika w bazie danych
    user_id = query_db(dq.create_keycloak_user, user)

    return {"id": user_id}


#endregion

# ==============================
# 🚀 GET FUNCTIONS SECTION 🚀
# ==============================

#region GET FUNCTIONS

@app.get("/user/login/{token}")
async def login_user(token: str) -> User:
    decoded = jwt.get_unverified_claims(token)
    user = User(
        id=decoded["sub"],
        name=decoded["given_name"],
        last_name=decoded["family_name"],
        email=decoded["email"]
    )
    query_db(dq.create_user, user)
    print(user)
    return user

@app.get("/notes/{user_id}")
async def get_user_notes(user_id: str) -> list[NoteTitle]:
    notes: list[dict] = query_db(dq.get_user_notes, user_id)
    # Zwracamy zaktualizowaną odpowiedź, uwzględniając permission
    return [
        NoteTitle(id=note["id"], title=note["title"], permission=note["permission"])
        for note in notes
    ]




@app.get("/note/{note_id}")
async def get_note(note_id: int) -> dict[str, str]:
    note: str = query_db(dq.get_note, note_id)
    if note:
        return {"content": note}
    return {"error": "Notatka nie istnieje"}


@app.get("/categories")
async def get_categories() -> list[Category]:
    categories: list[tuple[int, str]] = query_db(dq.get_categories)
    return [Category(id=category[0], name=category[1]) 
            for category in categories]


@app.get("/users/some/{user_id}")
async def get_some_users(prefix: str, user_id: str) -> list[User]:
    users: list[tuple[str, str, str, str]] = query_db(
        dq.get_some_users, prefix, user_id
        )
    return [User(id=user[0], name=user[1], last_name=user[2], email=user[3]) 
            for user in users]


@app.get("/notes/some/{user_id}")
async def get_some_notes(prefix: str, user_id: str) -> list[NoteTitle]:
    notes: list[tuple[int, str]] = query_db(dq.get_user_notes, user_id)
    prefix = prefix.lower()
    return [NoteTitle(id=note[0], title=note[1]) 
            for note in notes 
            if note[1].lower().startswith(prefix)]


@app.get("/user/{user_id}")
async def does_user_exist(user_id: str) -> bool:
    return query_db(dq.does_user_exist, user_id)

@app.get("/notes/categories/{categorie_id}")
async def get_notes_by_categories(categorie_id: int) -> list[NoteTitle]:
    notes: list[tuple[int, str]] = query_db(dq.get_notes_by_categories, categorie_id)
    return [NoteTitle(id=note[0], title=note[1]) for note in notes]


#endregion

# ==============================
# 🚀 PUT FUNCTIONS SECTION 🚀
# ==============================

#region PUT FUNCTIONS

"""@app.put("/note/{note_id}")
async def update_note(note_id: int, note: dict):
    with connect(**config) as connection:
        cursor = connection.cursor()
        cursor.execute("UPDATE Notes SET content = %s WHERE id = %s", (note["content"], note_id))
        connection.commit()
        cursor.close()
    return {"message": f"Notatka {note_id} została zaktualizowana"}"""


@app.put("/note/{note_id}")
async def update_note(note_id: int, note: Note):
    query_db(dq.update_note, note, note_id)
    return {"message": f"Notatka {note_id} została zaktualizowana"}


@app.put("/note/category/add")
async def add_category_user_permission(data: Annotated[NewPermissionsForm, Form()]) -> str:
    if data.category_id == 0 and data.user_id == "0":
        return "Brak danych do zapisania"
    
    query_db(dq.add_category_user_permission, data)
    return "Zapisano uprawnienia poprawnie"

#endregion

# ==============================
# 🚀 DELETE FUNCTIONS SECTION 🚀
# ==============================

#region DELETE FUNCTIONS

@app.delete("/note/{note_id}")
async def delete_note(note_id: int, user_id: str):
    result = query_db(dq.delete_note, note_id, user_id)
    return result





#endregion

# ==============================
# 🚀 WYBRYKI NATURY SECTION 🚀
# ==============================

#region WYBRYKI NATURY FUNCTIONS

def query_db(fun: Callable[[Cursor,], Any], *args, **kwargs) -> Any:
    with connect(**config) as connection:
        with connection.cursor() as cursor:
            data = fun(cursor, *args, **kwargs)
        connection.commit()
    return data

# Loading users from Auth0 
load_dotenv()

# Sprawdzenie wartości zmiennych
AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN", "Brak wartości")
CLIENT_ID = os.getenv("AUTH0_CLIENT_ID", "Brak wartości")
CLIENT_SECRET = os.getenv("AUTH0_CLIENT_SECRET", "Brak wartości")

AUDIENCE = f"https://{AUTH0_DOMAIN}/api/v2/"
API_URL = f"https://{AUTH0_DOMAIN}/api/v2/users"


# Function to get the Auth0 Management API Access Token
def get_management_api_token():
    url = f"https://{AUTH0_DOMAIN}/oauth/token"
    payload = {
        "grant_type": "client_credentials",
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "audience": AUDIENCE
    }
    headers = {"Content-Type": "application/json"}

    response = requests.post(url, json=payload, headers=headers)

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="Failed to get token")
    
    return response.json()['access_token']

@app.get("/users")
async def get_users():
    try:
        token = get_management_api_token()  # Get token from Auth0
        headers = {"Authorization": f"Bearer {token}"}
        
        # Make the request to Auth0 Management API to fetch users
        response = requests.get(API_URL, headers=headers)
        
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch users")
        
        users = response.json()
        print(users)
        return users
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
#endregion




