from pymysql.cursors import Cursor
from models import (
    User,
    Note,
    NoteTitle,
    Category,
    NewPermissionsForm,
    KeycloakUserCreate
)
import jwt

# ==============================
# 🚀 USER SECTION 🚀
# ==============================

#region USER SECTION

def get_some_users(cursor: Cursor, prefix: str, user_id: str) -> list[tuple[str, str, str, str]]:
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
        return users


def create_user(cursor: Cursor, user: User):
    query1 = """
SELECT * FROM Users WHERE id = %s;
"""
    # Sprawdzanie czy uzytkownik istnieje
    cursor.execute(query1, (user.id))
    rows = cursor.fetchall()
    if len(rows) == 1:
        return False  # Uzytkownik juz istnieje

    # Dodawanie uzytkownika do bazy danych
    print("Dodawanie uzytkownika do bazy danych")


    query2 = """
INSERT INTO Users (id, name, last_name, email)
VALUES (%s, %s, %s, %s);
"""
    # Zapisywanie uzytkownika
    values = (user.id, user.name, user.last_name, user.email)
    cursor.execute(query2, values)


def does_user_exist(cursor: Cursor, user_id: str) -> bool:
    cursor.execute(
        "SELECT id FROM Users WHERE id = %s", 
        (user_id)
        )
    rows = cursor.fetchall()
    return len(rows) == 1

#zmienione

def check_existing_user(cursor, user_id: str):
    cursor.execute("SELECT * FROM Users WHERE id = %s", (user_id,))
    return cursor.fetchone()

def create_keycloak_user(cursor, user: KeycloakUserCreate):
    cursor.execute("""
        INSERT INTO Users (id, name, last_name, email)
        VALUES (%s, %s, %s, %s);
    """, (user.userId, user.firstName, user.lastName, user.email))
    
    cursor.connection.commit()

    cursor.execute("SELECT id FROM Users WHERE id = %s", (user.userId,))
    return cursor.fetchone()[0]  # Zwracamy ID użytkownika


def save_user_to_db(cursor: Cursor, user_id: str, name: str, lastname: str, email: str) -> bool:
    cursor.execute("SELECT id FROM Users WHERE id = %s", (user_id,))
    rows = cursor.fetchall()

    if len(rows) > 0:
        return False

    query = """
    INSERT INTO Users (id, name, last_name, email)
    VALUES (%s, %s, %s, %s);
    """
    values = (user_id, name, lastname, email)
    cursor.execute(query, values)

    return True


def decode_token_and_save_user(cursor: Cursor, token: str) -> bool:
    try:
        decoded = jwt.decode(token, options={"verify_signature": False})
        
        user_id = decoded.get("sub")
        name = decoded.get("given_name")
        lastname = decoded.get("family_name")
        email = decoded.get("email")

        if not user_id or not name or not lastname or not email:
            print("Brak wymaganych danych w tokenie.")
            return False

        if save_user_to_db(cursor, user_id, name, lastname, email):
            print(f"Użytkownik {name} {lastname} zapisany do bazy.")
            return True
        else:
            print("Użytkownik już istnieje w bazie.")
            return False

    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError) as e:
        print(f"Token błąd: {str(e)}")
        return False


#endregion

# ==============================
# 🚀 NOTE SECTION 🚀
# ==============================

#region NOTE SECTION

def create_note(cursor: Cursor, note: Note, user_id: str):
    cursor.execute(
        "CALL CreateNote (%s, %s, %s);",
        (note.title, note.content, user_id)
        )


def update_note(cursor: Cursor, note: Note, note_id: int):
    # Query to update both title and content
    query = """
UPDATE Notes
SET title = %s, content = %s
WHERE id = %s;
"""
    cursor.execute(
         query, 
         (note.title, note.content, note_id)
         )


def get_note(cursor: Cursor, note_id: int) -> str:
    cursor.execute(
        "SELECT content FROM Notes WHERE id = %s", 
        (note_id)
        )
    return cursor.fetchone()[0]


def delete_note(cursor: Cursor, note_id: int, user_id: str):
    query_check_owner = """
    SELECT permission
    FROM UserNotes
    WHERE note_id = %s AND user_id = %s;
    """
    cursor.execute(query_check_owner, (note_id, user_id))
    result = cursor.fetchone()

    if result is None:
        return {"message": "Brak uprawnień do usunięcia notatki."}

    permission = result[0]

    if permission == 3:
        query_delete_access = """
        DELETE FROM UserNotes WHERE note_id = %s;
        """
        cursor.execute(query_delete_access, (note_id,))

        query_delete_note = """
        DELETE FROM Notes WHERE id = %s;
        """
        cursor.execute(query_delete_note, (note_id,))

        return {"message": "Notatka została całkowicie usunięta."}

    query_delete_access = """
    DELETE FROM UserNotes WHERE note_id = %s AND user_id = %s;
    """
    cursor.execute(query_delete_access, (note_id, user_id))

    return {"message": "Usunięto dostęp do notatki."}



def get_user_notes(cursor: Cursor, user_id: str) -> list[tuple[int, str, int, str]]:
    query1 = """
SELECT Notes.id, Notes.title, UserNotes.permission, Categories.name AS category
FROM Notes
INNER JOIN UserNotes ON Notes.id = UserNotes.note_id
LEFT JOIN CategoryNotes ON Notes.id = CategoryNotes.note_id
LEFT JOIN Categories ON CategoryNotes.category_id = Categories.id
INNER JOIN Users ON UserNotes.user_id = %s
WHERE UserNotes.permission > 0;
"""
    cursor.execute(query1, (user_id))
    notes1 = cursor.fetchall()

    query2 = """
SELECT Notes.id, Notes.title, CategoryNotes.permission, Categories.name AS category
FROM Notes
INNER JOIN CategoryNotes ON Notes.id = CategoryNotes.note_id
LEFT JOIN Categories ON CategoryNotes.category_id = Categories.id
INNER JOIN UserCategories ON Categories.id = UserCategories.category_id
INNER JOIN Users ON UserCategories.user_id = %s
WHERE CategoryNotes.permission > 0;
"""
    cursor.execute(query2, (user_id))
    notes2 = cursor.fetchall()

    # Łączymy oba zestawy wyników i usuwamy duplikaty
    all_notes = list(dict.fromkeys(notes1 + notes2))

    # Zwracamy id, title, permission oraz category
    return [
        {
            "id": note[0],
            "title": note[1],
            "permission": note[2],  # Nowa kolumna - permission
            "category": note[3] if note[3] else "Prywatny"
        }
        for note in all_notes
    ]


#endregion

# ==============================
# 🚀 CATEGORY SECTION 🚀
# ==============================

#region CATEGORY SECTION

def create_category(cursor: Cursor, category: Category):
    query = """
INSERT INTO Categories (name)
VALUES (%s);
"""
    cursor.execute(query, (category.name))


#stare
def get_categories(cursor: Cursor) -> list[tuple[int, str]]:
    cursor.execute("SELECT id, name FROM Categories")
    return list(cursor.fetchall())

# def get_notes_by_categories(cursor: Cursor, categorie_id: int) -> list[tuple[int, str]]:
#     query = """
#     SELECT Notes.id, Notes.title, Notes.permission
#     FROM Notes
#     INNER JOIN CategoryNotes ON Notes.id = CategoryNotes.note_id
#     WHERE CategoryNotes.category_id = %s
#     """
#     cursor.execute(query, (categorie_id,))
#     return cursor.fetchall()

def get_notes_by_categories(cursor: Cursor, categorie_id: int) -> list[NoteTitle]:
    query = """
    SELECT id, title, permission FROM Notes
    INNER JOIN CategoryNotes ON Notes.id = CategoryNotes.note_id
    WHERE CategoryNotes.category_id = %s
    """
    cursor.execute(query, (categorie_id,))
    notes = cursor.fetchall()

    return [NoteTitle(id=note[0], title=note[1], permission=note[2]) for note in notes]



#endregion

# ==============================
# 🚀 PERMISSION SECTION 🚀
# ==============================

#region PERMISSION SECTION

def add_category_user_permission(cursor: Cursor, data: NewPermissionsForm):
    template = """
INSERT INTO {table}({column}, note_id, permission)
VALUES (%s, %s, %s)
ON DUPLICATE KEY UPDATE
permission = %s;
"""
    if data.category_id != 0:
        query = template.format(
            table='CategoryNotes', 
            column='category_id'
            )
        cursor.execute(query, (
            data.category_id,
            data.note_id,
            data.category_permission,
            data.category_permission
            ))
        print("Przypisano Categorie do Notatki")
    
    if data.user_id != "0":
        query = template.format(
            table='UserNotes', 
            column='user_id'
            )
        cursor.execute(query, (
            data.user_id,
            data.note_id,
            data.user_permission,
            data.user_permission
            ))
        print("Przypisano Usera do Notatki")

#endregion



