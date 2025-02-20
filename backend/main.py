from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware  # ✅ Import CORS Middleware
from pydantic import BaseModel, Field
from pymongo import MongoClient
from passlib.context import CryptContext
import jwt
from datetime import datetime, timedelta, timezone

# ✅ Initialize FastAPI app
app = FastAPI()

# ✅ Allow CORS for frontend (Modify URL in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Replace "*" with specific frontend URL for better security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Database Setup (MongoDB)
client = MongoClient("mongodb://localhost:27017/")
db = client["auth_db"]
users_collection = db["users"]

# ✅ Password Hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ✅ JWT Config
SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"

# ✅ Pydantic Model for User Registration/Login
class User(BaseModel):
    username: str
    password: str

# ✅ Register User
@app.post("/register")
async def register(user: User):
    existing_user = users_collection.find_one({"username": user.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    hashed_password = pwd_context.hash(user.password)
    users_collection.insert_one({"username": user.username, "password": hashed_password})
    return {"message": "User registered successfully"}

# ✅ Login User & Generate JWT
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

# ✅ GPU Booking Database
db = client["gpu_booking"]
gpu_collection = db["gpus"]

# ✅ Ensure GPU Exists in MongoDB
if not gpu_collection.find_one({"gpu_id": "gpu-1"}):
    gpu_collection.insert_one({"gpu_id": "gpu-1", "name": "NVIDIA A100", "bookings": []})

# ✅ Pydantic Model for Booking Requests (Fix datetime issue)
class BookingRequest(BaseModel):
    user: str
    start_time: str  # ✅ Store as string to avoid Pydantic issues
    end_time: str    # ✅ Store as string to avoid Pydantic issues

# ✅ Fetch GPU Details
@app.get("/gpu")
def get_gpu():
    """Fetch GPU details including bookings."""
    gpu = gpu_collection.find_one({"gpu_id": "gpu-1"}, {"_id": 0})
    if not gpu:
        raise HTTPException(status_code=404, detail="GPU not found")
    return gpu

# ✅ Book a GPU with Conflict Check
@app.post("/book")
def book_gpu(request: BookingRequest):
    """Book the GPU if it's available."""
    gpu = gpu_collection.find_one({"gpu_id": "gpu-1"})
    if not gpu:
        raise HTTPException(status_code=404, detail="GPU not found")

    request_start = datetime.fromisoformat(request.start_time).replace(tzinfo=timezone.utc)
    request_end = datetime.fromisoformat(request.end_time).replace(tzinfo=timezone.utc)

    # ✅ Check for Conflicting Bookings
    for booking in gpu["bookings"]:

        existing_start = datetime.fromisoformat(booking["start_time"]).replace(tzinfo=timezone.utc)
        existing_end = datetime.fromisoformat(booking["end_time"]).replace(tzinfo=timezone.utc)


        if request_start < existing_end and request_end > existing_start:
            raise HTTPException(
                status_code=400,
                detail=f"GPU is already booked from {existing_start} to {existing_end}",
            )

    # ✅ Store Booking in Database
    new_booking = {
        "user": request.user,
        "start_time": request.start_time,  # ✅ Save as string
        "end_time": request.end_time,      # ✅ Save as string
    }

    gpu_collection.update_one(
        {"gpu_id": "gpu-1"},
        {"$push": {"bookings": new_booking}}
    )

    return {"status": "GPU booked successfully", "booking": new_booking}
