# GPU Booking Dashboard

## Overview
The **GPU Booking Dashboard** is a web application that allows users to book and manage GPU resources in real-time. Built with **Next.js**, **FastAPI**, and **MongoDB**, this system ensures a seamless experience for users to schedule their GPU access efficiently.

## Features
- 🌐 **User Authentication** – Login and logout functionality with token-based authentication.
- 🖥️ **Real-time GPU Availability** – Users can view and book GPUs with an updated list of active bookings.
- ⏳ **Booking System** – Users can schedule and manage GPU usage with **conflict prevention**.
- 🔄 **Auto-Update** – Bookings update dynamically without requiring a page refresh.

## Tech Stack
- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: FastAPI, MongoDB
- **State Management**: Zustand
- **Authentication**: JSON Web Tokens (JWT)

## Installation
### Prerequisites
Ensure you have the following installed:
- Node.js & npm
- Python 3.10+
- MongoDB

### Backend Setup (FastAPI)
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend Setup (Next.js)
```bash
cd frontend
npm install
npm run dev
```

## Usage
1. **Start MongoDB** (`mongod` if running locally).
2. **Run the FastAPI backend** (`uvicorn main:app --reload`).
3. **Run the Next.js frontend** (`npm run dev`).
4. **Access the application** at `http://localhost:3000`.

## API Endpoints
| Method | Endpoint    | Description |
|--------|------------|-------------|
| `POST` | `/register` | Registers a new user |
| `POST` | `/login` | Authenticates a user & returns a token |
| `GET`  | `/gpu` | Fetches available GPU details |
| `POST` | `/book` | Books a GPU slot (validates conflicts) |


