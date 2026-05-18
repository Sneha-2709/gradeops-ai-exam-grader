from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import Base, engine
from routes import router
from upload import router as upload_router
from rubric import router as rubric_router
from grading import router as grading_router
import os

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(router)
app.include_router(upload_router)
app.include_router(rubric_router)
app.include_router(grading_router)

@app.get("/")
def home():
    return {"message": "GradeOps backend is running!"}