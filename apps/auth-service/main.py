from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
import os

app = FastAPI(title="Auth Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# User register request model
class UserRegister(BaseModel):
    email: EmailStr
    name: str
    password: str

# Health check route
@app.get("/health")
def health():
    return {"status": "UP", "service": "Auth Service"}

# Register placeholder
@app.post("/register", status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegister):
    return {
        "success": False,
        "message": "Auth Service - Register endpoint skeleton (Add logic)"
    }

# Login placeholder
@app.post("/login")
def login():
    return {
        "success": False,
        "message": "Auth Service - Login endpoint skeleton (Add logic)"
    }

# Get current user details placeholder
@app.get("/me")
def get_me():
    return {
        "success": False,
        "message": "Auth Service - Get profile endpoint skeleton (Add logic)"
    }
