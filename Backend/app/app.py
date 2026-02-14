import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine
from . import wells, interpret, chat

app = FastAPI(title="OneGeo API")


Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "OneGeo Backend", "status": "online"}

@app.get("/check")
def health():
    return {"status": "healthy"}

app.include_router(wells.router)
app.include_router(interpret.router)
app.include_router(chat.router)
