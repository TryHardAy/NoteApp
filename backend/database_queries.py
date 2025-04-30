from pymysql.cursors import Cursor
from models import (
    User,
    Note,
    Category,
    NewPermissionsForm
)


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


def delete_note(cursor: Cursor, note_id: int):
    cursor.execute(
        "DELETE FROM UserNotes WHERE note_id = %s;", 
        (note_id))
    cursor.execute(
        "DELETE FROM CategoryNotes WHERE note_id = %s;", 
        (note_id))
    cursor.execute(
        "DELETE FROM Notes WHERE id = %s;", 
        (note_id))


def get_user_notes(cursor: Cursor, user_id: str) -> list[tuple[int, str]]:
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
    # Zapisywanie kategorii
    cursor.execute(query, (category.name))


def get_categories(cursor: Cursor) -> list[tuple[int, str]]:
    cursor.execute("SELECT * FROM Categories")
    return list(cursor.fetchall())

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



