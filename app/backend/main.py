from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
import random
from api import routes

app = FastAPI()

# Habilita CORS para seu frontend (assumindo localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclui o router definido em telemetry.py
app.include_router(routes.router)