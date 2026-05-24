from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Lab Service (Clean Architecture)", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# StartSession request schema
class StartSessionRequest(BaseModel):
    user_id: str
    lab_id: str

# Health check route
@app.get("/health")
def health():
    return {"status": "UP", "service": "Lab Service (Clean Architecture)"}

# Start sandbox session route placeholder
@app.post("/session")
def start_session(request: StartSessionRequest):
    return {
        "success": False,
        "message": "Lab Service - Start Session endpoint skeleton (Add container execution logic)"
    }
