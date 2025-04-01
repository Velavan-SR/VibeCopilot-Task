from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import jwt
from passlib.context import CryptContext

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
SECRET_KEY = "your-secret-key-here"
ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Sample data
SAMPLE_SERVICES = [
    {
        "id": 1,
        "serviceName": "mo",
        "building": "Digi",
        "floor": "2nd Floor",
        "unit": "Vibe Workforce",
        "createdBy": "Akshat Shrawat",
        "createdOn": "11/26/2024, 10:13:16 PM"
    },
    {
        "id": 2,
        "serviceName": "Washroom",
        "building": "Digi",
        "floor": "1st Floor",
        "unit": "Copilot, Connect",
        "createdBy": "Anurag Sharma",
        "createdOn": "10/16/2024, 8:32:29 PM"
    },
    {
        "id": 3,
        "serviceName": "Cabin -Anurag",
        "building": "Digi",
        "floor": "1st Floor",
        "unit": "Connect",
        "createdBy": "Anurag Sharma",
        "createdOn": "10/15/2024, 8:35:00 PM"
    }
]

SAMPLE_CHECKLISTS = [
    {
        "id": 1,
        "name": "Mob Checklist Testing",
        "startDate": "2025-03-11",
        "endDate": "2025-03-31",
        "priorityLevel": "High",
        "frequency": "hourly",
        "noOfGroups": 2,
        "associations": "Associate"
    },
    {
        "id": 2,
        "name": "Testing dor dup",
        "startDate": "2025-02-22",
        "endDate": "2025-02-27",
        "priorityLevel": "Medium",
        "frequency": "half yearly",
        "noOfGroups": 1,
        "associations": "Associate"
    },
    {
        "id": 3,
        "name": "Tes 1232322",
        "startDate": "2025-02-22",
        "endDate": "2025-02-27",
        "priorityLevel": "",
        "frequency": "daily",
        "noOfGroups": 1,
        "associations": "Associate"
    }
]

SAMPLE_TASKS = [
    {
        "id": 1,
        "serviceName": "Mopping",
        "checklistName": "Mob Checklist Testing",
        "startDate": "30 Mar 2025",
        "status": "pending",
        "assignedTo": "Vibe User"
    },
    {
        "id": 2,
        "serviceName": "Mopping",
        "checklistName": "Mob Checklist Testing",
        "startDate": "30 Mar 2025",
        "status": "pending",
        "assignedTo": "Vibe User"
    },
    {
        "id": 3,
        "serviceName": "Mopping",
        "checklistName": "Mob Checklist Testing",
        "startDate": "30 Mar 2025",
        "status": "completed",
        "assignedTo": "Vibe User"
    }
]

# Models
class User(BaseModel):
    email: str
    password: str

class Service(BaseModel):
    id: int
    serviceName: str
    building: str
    floor: str
    unit: str
    createdBy: str
    createdOn: str

class Checklist(BaseModel):
    id: int
    name: str
    startDate: str
    endDate: str
    priorityLevel: str
    frequency: str
    noOfGroups: int
    associations: str

class Task(BaseModel):
    id: int
    serviceName: str
    checklistName: str
    startDate: str
    status: str
    assignedTo: str

# Helper functions
def create_access_token(data: dict):
    encoded_jwt = jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Routes
@app.post("/api/login")
async def login(user: User):
    if user.email == "sham@gmail.com" and user.password == "123456":
        access_token = create_access_token(data={"sub": user.email})
        return {"access_token": access_token, "token_type": "bearer"}
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.get("/api/services", response_model=List[Service])
async def get_services():
    return SAMPLE_SERVICES

@app.get("/api/checklists", response_model=List[Checklist])
async def get_checklists():
    return SAMPLE_CHECKLISTS

@app.get("/api/tasks", response_model=List[Task])
async def get_tasks():
    return SAMPLE_TASKS 