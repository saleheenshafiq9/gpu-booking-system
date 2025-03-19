from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware  # ✅ Import CORS Middleware
from pydantic import BaseModel, Field
from pymongo import MongoClient
from passlib.context import CryptContext
import jwt
from datetime import datetime, timedelta

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = MongoClient("mongodb://localhost:27017/")
db = client["auth_db"]
users_collection = db["users"]

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"

class User(BaseModel):
    username: str
    password: str

@app.post("/register")
async def register(user: User):
    existing_user = users_collection.find_one({"username": user.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    hashed_password = pwd_context.hash(user.password)
    users_collection.insert_one({"username": user.username, "password": hashed_password})
    return {"message": "User registered successfully"}

@app.post("/login")
async def login(user: User):
    db_user = users_collection.find_one({"username": user.username})
    if not db_user or not pwd_context.verify(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token_data = {
        "sub": user.username,
        "exp": datetime.utcnow() + timedelta(days=1),
    }
    token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)

    return {"access_token": token, "token_type": "bearer"}

db = client["gpu_booking"]
gpu_collection = db["gpus"]

if not gpu_collection.find_one({"gpu_id": "gpu-1"}):
    gpu_collection.insert_one({"gpu_id": "gpu-1", "name": "NVIDIA A100", "bookings": []})

class BookingRequest(BaseModel):
    user: str
    start_time: str  
    end_time: str    

@app.get("/gpu")
def get_gpu():
    """Fetch GPU details including bookings."""
    gpu = gpu_collection.find_one({"gpu_id": "gpu-1"}, {"_id": 0})
    if not gpu:
        raise HTTPException(status_code=404, detail="GPU not found")
    return gpu

@app.post("/book")
def book_gpu(request: BookingRequest):
    """Book the GPU if it's available."""
    gpu = gpu_collection.find_one({"gpu_id": "gpu-1"})
    if not gpu:
        raise HTTPException(status_code=404, detail="GPU not found")

    request_start = datetime.fromisoformat(request.start_time.rstrip("Z"))
    request_end = datetime.fromisoformat(request.end_time.rstrip("Z"))

    for booking in gpu["bookings"]:
        existing_start = datetime.fromisoformat(booking["start_time"].rstrip("Z"))
        existing_end = datetime.fromisoformat(booking["end_time"].rstrip("Z"))
        
        if request_start < existing_end and request_end > existing_start:
            raise HTTPException(
                status_code=400,
                detail=f"GPU is already booked from {existing_start} to {existing_end}",
            )

    new_booking = {
        "user": request.user,
        "start_time": request.start_time,
        "end_time": request.end_time,  
    }

    gpu_collection.update_one(
        {"gpu_id": "gpu-1"},
        {"$push": {"bookings": new_booking}}
    )

    return {"status": "GPU booked successfully", "booking": new_booking}
