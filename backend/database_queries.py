# from pymysql.cursors import Cursor
# from models import (
#     Note,
#     Category,
#     NewPermissionsForm,
#     KeycloakUserCreate
# )
# import jwt

# ==============================
# 🚀 USER SECTION 🚀
# ==============================

#region USER SECTION







#zmienione

# def check_existing_user(cursor, user_id: str):
#     cursor.execute("SELECT * FROM Users WHERE id = %s", (user_id,))
#     return cursor.fetchone()

# def create_keycloak_user(cursor, user: KeycloakUserCreate):
#     cursor.execute("""
#         INSERT INTO Users (id, name, last_name, email)
#         VALUES (%s, %s, %s, %s);
#     """, (user.userId, user.firstName, user.lastName, user.email))
    
#     cursor.connection.commit()

#     cursor.execute("SELECT id FROM Users WHERE id = %s", (user.userId,))
#     return cursor.fetchone()[0]  # Zwracamy ID użytkownika


# def save_user_to_db(cursor: Cursor, user_id: str, name: str, lastname: str, email: str) -> bool:
#     cursor.execute("SELECT id FROM Users WHERE id = %s", (user_id,))
#     rows = cursor.fetchall()

#     if len(rows) > 0:
#         return False

#     query = """
#     INSERT INTO Users (id, name, last_name, email)
#     VALUES (%s, %s, %s, %s);
#     """
#     values = (user_id, name, lastname, email)
#     cursor.execute(query, values)

#     return True


# def decode_token_and_save_user(cursor: Cursor, token: str) -> bool:
#     try:
#         decoded = jwt.decode(token, options={"verify_signature": False})
        
#         user_id = decoded.get("sub")
#         name = decoded.get("given_name")
#         lastname = decoded.get("family_name")
#         email = decoded.get("email")

#         if not user_id or not name or not lastname or not email:
#             print("Brak wymaganych danych w tokenie.")
#             return False

#         if save_user_to_db(cursor, user_id, name, lastname, email):
#             print(f"Użytkownik {name} {lastname} zapisany do bazy.")
#             return True
#         else:
#             print("Użytkownik już istnieje w bazie.")
#             return False

#     except (jwt.ExpiredSignatureError, jwt.InvalidTokenError) as e:
#         print(f"Token błąd: {str(e)}")
#         return False




#endregion


