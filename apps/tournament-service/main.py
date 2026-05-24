from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Tournament Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check route
@app.get("/health")
def health():
    return {"status": "UP", "service": "Tournament Service"}

# Matchmaking request schema
class MatchmakingRequest(BaseModel):
    user_id: str
    tournament_id: str

# Queue matchmaking route placeholder
@app.post("/matchmake")
def queue_matchmaking(request: MatchmakingRequest):
    return {
        "success": False,
        "message": "Tournament Service - Queue matchmaking endpoint skeleton (Add logic)"
    }
