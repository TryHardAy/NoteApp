import requests
import mysql.connector
from fastapi import HTTPException


# Parametry
AUTH0_DOMAIN = "dev-r42s3taej0vvgom1.eu.auth0.com"
API_CLIENT_ID = "zAuDO7KS5MV1PGFOe4bws6WPquILzBi5"
API_CLIENT_SECRET = "aB0-vcVCN4CHBiArOyS_f1w-1OpG9iGq_XhQQQ7FNwms--O_CZMGKzz3IjNoxvNk"
API_IDENTIFIER = "67d2deb4d46aef38e446a630"
API_URL = "https://dev-r42s3taej0vvgom1.eu.auth0.com/api/v2/"

# Uzyskanie tokenu dostępu
def get_access_token():
    url = f"https://{AUTH0_DOMAIN}/oauth/token"
    headers = {'content-type': 'application/json'}
    body = {
        "client_id": API_CLIENT_ID,
        "client_secret": API_CLIENT_SECRET,
        "audience": f"https://{AUTH0_DOMAIN}/api/v2/",
        "grant_type": "client_credentials"
    }
    response = requests.post(url, json=body, headers=headers)
    
    # Logowanie odpowiedzi z serwera Auth0
    print(response.status_code)
    print(response.text)  # Możesz również użyć response.json(), jeśli odpowiedź jest w formacie JSON
    
    if response.status_code == 200:
        response_data = response.json()
        return response_data['access_token']
    else:
        # Zwróć szczegóły błędu, jeśli coś poszło nie tak
        raise HTTPException(status_code=response.status_code, detail="Error fetching access token from Auth0")


# Pobranie użytkowników
def get_users_from_auth0():
    access_token = get_access_token()
    headers = {
        'Authorization': f"Bearer {access_token}",
        'Content-Type': 'application/json'
    }
    response = requests.get(API_URL, headers=headers)
    if response.status_code == 200:
        return response.json()  # Lista użytkowników
    else:
        print(f"Error: {response.status_code}")
        return []

users = get_users_from_auth0()
for user in users:
    print(user['email'], user['given_name'], user['family_name'])


def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="your_db_user",
        password="your_db_password",
        database="NotesDB"
    )

def add_user_to_db(name, last_name, email):
    connection = get_db_connection()
    cursor = connection.cursor()

    # Dodaj dane hasła (możesz ustawić hasło domyślne lub puste, zależnie od potrzeby)
    cursor.execute("INSERT INTO Passwords (password) VALUES ('default_password')")
    password_id = cursor.lastrowid  # Pobierz ID ostatnio dodanego hasła
    
    # Dodaj użytkownika
    cursor.execute("INSERT INTO Users (name, last_name, email, password_id) VALUES (%s, %s, %s, %s)", 
                   (name, last_name, email, password_id))
    connection.commit()
    cursor.close()
    connection.close()

# Migracja użytkowników
def migrate_users(users):
    for user in users:
        name = user.get('given_name')
        last_name = user.get('family_name')
        email = user.get('email')
        add_user_to_db(name, last_name, email)

# Migracja wszystkich użytkowników
#migrate_users(users)
