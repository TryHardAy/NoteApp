from users.models import User
from sqlalchemy.orm import Session
from sqlalchemy import select, exists, update
from sqlalchemy.exc import NoResultFound
from jose import jwt
from fastapi import HTTPException
from core.models import Users




def login_user(token: str, session: Session) -> User:
    decoded = jwt.get_unverified_claims(token)

    try:
        user = User(
            id=decoded["sub"],
            name=decoded["given_name"],
            last_name=decoded["family_name"],
            email=decoded["email"]
        )
    except Exception as e:
        raise HTTPException(status_code=401, detail="Missing data in token")

    stmt = select(exists().where(Users.id == user.id))
    is_user = session.scalars(stmt).one()

    if not is_user:
        session.add(Users(**user.model_dump()))

    return user


def get_user(user_id: str, session: Session) -> Users:
    stmt = select(Users).where(Users.id == user_id)

    try:
        user = session.scalars(stmt).one()
    except NoResultFound as e:
        raise HTTPException(status_code=404, detail="User not found")

    return user


def update_user(user: User, session: Session) -> User:
    stmt = (
        update(Users)
        .where(Users.id == user.id)
        .values(**user.model_dump())
    )
    result = session.execute(stmt)

    return User.model_validate(result.fetchone())


def delete_user(user_id: str, session: Session) -> None:
    user = get_user(user_id, session)
    
    session.delete(user)


def get_users_except(prefix: str, user_id: str, session: Session) -> list[User]:
        
    stmt = (
        select(Users)
        .where(
            ((Users.name + " " + Users.last_name).like(f"{prefix}%") | 
            (Users.last_name + " " + Users.name).like(f"{prefix}%")) &
            (Users.id != user_id)
        )
    )

    users = session.scalars(stmt).all()

    return [User.model_validate(user) for user in users]


# async def get_user(user_id: str, db: Session) -> User:
#     stmt = select(Users).where(Users.id == user_id)
#     user = db.scalars(stmt).one()
#     if not user:
#         raise HTTPException(status_code=404, detail="User not found")
#     return user


# def create_user(user: User, db: Session):
#     query1 = """
# SELECT * FROM Users WHERE id = %s;
# """
#     # Sprawdzanie czy uzytkownik istnieje
#     cursor.execute(query1, (user.id))
#     rows = cursor.fetchall()
#     if len(rows) == 1:
#         return False  # Uzytkownik juz istnieje

#     # Dodawanie uzytkownika do bazy danych
#     print("Dodawanie uzytkownika do bazy danych")


#     query2 = """
# INSERT INTO Users (id, name, last_name, email)
# VALUES (%s, %s, %s, %s);
# """
#     # Zapisywanie uzytkownika
#     values = (user.id, user.name, user.last_name, user.email)
#     cursor.execute(query2, values)


# def does_user_exist(cursor: Cursor, user_id: str) -> bool:
#     cursor.execute(
#         "SELECT id FROM Users WHERE id = %s", 
#         (user_id)
#         )
#     rows = cursor.fetchall()
#     return len(rows) == 1


# Sprawdzenie, czy użytkownik już istnieje w bazie danych
# def check_existing_user(cursor, user_id: str):
#     cursor.execute("SELECT * FROM Users WHERE id = %s", (user_id,))
#     return cursor.fetchone()

# Zapisanie nowego użytkownika w bazie danych
# def create_keycloak_user(cursor, user: KeycloakUserCreate):
#     cursor.execute("""
#         INSERT INTO Users (id, name, last_name, email)
#         VALUES (%s, %s, %s, %s);
#     """, (user.userId, user.firstName, user.lastName, user.email))
    
#     cursor.connection.commit()  # Zatwierdzamy zmiany w bazie danych

#     # Pobieramy ID zapisanego użytkownika (po wstawieniu)
#     cursor.execute("SELECT id FROM Users WHERE id = %s", (user.userId,))
#     return cursor.fetchone()[0]  # Zwracamy ID użytkownika


# def save_user_to_db(cursor: Cursor, user_id: str, name: str, lastname: str, email: str) -> bool:
#     # Sprawdzenie, czy użytkownik już istnieje
#     cursor.execute("SELECT id FROM Users WHERE id = %s", (user_id,))
#     rows = cursor.fetchall()

#     if len(rows) > 0:
#         return False  # Użytkownik już istnieje, nie zapisujemy

#     # Zapisujemy nowego użytkownika
#     query = """
#     INSERT INTO Users (id, name, last_name, email)
#     VALUES (%s, %s, %s, %s);
#     """
#     values = (user_id, name, lastname, email)
#     cursor.execute(query, values)

#     return True


# def decode_token_and_save_user(cursor: Cursor, token: str) -> bool:
#     try:
#         # Dekodowanie tokenu (zakładając, że nie weryfikujemy podpisu w tej funkcji)
#         decoded = jwt.decode(token, options={"verify_signature": False})
        
#         user_id = decoded.get("sub")
#         name = decoded.get("given_name")
#         lastname = decoded.get("family_name")
#         email = decoded.get("email")

#         # Sprawdzamy, czy wszystkie wymagane dane istnieją
#         if not user_id or not name or not lastname or not email:
#             print("Brak wymaganych danych w tokenie.")
#             return False

#         # Zapisujemy użytkownika w bazie danych
#         if save_user_to_db(cursor, user_id, name, lastname, email):
#             print(f"Użytkownik {name} {lastname} zapisany do bazy.")
#             return True
#         else:
#             print("Użytkownik już istnieje w bazie.")
#             return False

#     except (jwt.ExpiredSignatureError, jwt.InvalidTokenError) as e:
#         print(f"Token błąd: {str(e)}")
#         return False











