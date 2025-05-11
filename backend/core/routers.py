from fastapi import FastAPI, APIRouter
from users.router import router as users_router
from notes.router import router as notes_router
from categories.router import router as categories_router
from permissions.router import router as permissions_router


routes: list[APIRouter] = [
    users_router,
    notes_router,
    categories_router,
    permissions_router,
    # Add more routers here as needed
]



def add_routes(app: FastAPI) -> None:
    for route in routes:
        app.include_router(route)

