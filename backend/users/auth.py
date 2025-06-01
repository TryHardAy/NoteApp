import os
import httpx
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from users.models import User
from typing import Annotated
from jose import jwt
from jose.exceptions import JWTError



bearer_scheme = HTTPBearer()

KEYCLOAK_URL = os.getenv("KEYCLOAK_URL")
REALM = os.getenv("KEYCLOAK_REALM")

OPENID_CONFIG_URL = f"{KEYCLOAK_URL}/realms/{REALM}/.well-known/openid-configuration"

cached_jwks = None

async def get_jwks():
    global cached_jwks
    if cached_jwks:
        return cached_jwks

    async with httpx.AsyncClient() as client:
        openid = await client.get(OPENID_CONFIG_URL)
        jwks_uri = openid.json()["jwks_uri"]
        keys_response = await client.get(jwks_uri)
        cached_jwks = keys_response.json()
        return cached_jwks

async def verify_jwt(token: str) -> dict:
    jwks = await get_jwks()

    unverified_header = jwt.get_unverified_header(token)
    kid = unverified_header.get("kid")

    key = next((k for k in jwks["keys"] if k["kid"] == kid), None)
    if not key:
        raise HTTPException(status_code=401, detail="Invalid token header")
    
    url = KEYCLOAK_URL if KEYCLOAK_URL != "http://keycloak:8080" else "http://localhost:8080"

    try:
        payload = jwt.decode(
            token,
            key,
            algorithms=[key["alg"]],
            audience="account",
            issuer=f"{url}/realms/{REALM}",
        )
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Token validation error: {str(e)}")

    return payload

async def authenticate_user(token_data: Annotated[HTTPAuthorizationCredentials, Depends(bearer_scheme)]) -> User:
    decoded = await verify_jwt(token_data.credentials)
    try:
        user = User(
            id=decoded["sub"],
            name=decoded["given_name"],
            last_name=decoded["family_name"],
            email=decoded["email"]
        )
    except Exception as e:
        raise HTTPException(status_code=401, detail="Missing data in token")
    
    return user

