from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from contextlib import asynccontextmanager
from core.routers import add_routes
import os


@asynccontextmanager
async def lifespan(app: FastAPI):
    # on_startup

    yield 

    # on_shutdown
    print("Shutting down")

app = FastAPI(docs_url="/", lifespan=lifespan)

add_routes(app)



FRONTEND_URL = os.getenv("FRONTEND_URL")
print(f'{FRONTEND_URL=}')
origins = [
    FRONTEND_URL,  # frontend
    #"http://localhost:5000" #backend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Możesz dodać więcej URLi, jeśli potrzebujesz
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


