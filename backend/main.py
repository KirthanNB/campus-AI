"""
CampusMind AI - FastAPI Backend Application
Hyper-personalized, Multilingual AI Assistant for College Students.
Includes JWT Authentication, Profile Management, SQLite Database, and Smart RAG Engine.
"""

import os
import sys
from pathlib import Path
from typing import List
from dotenv import load_dotenv

# Ensure proper encoding
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

# 1. Load environment variables
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")
load_dotenv(BASE_DIR.parent / ".env")
os.environ.pop("GEMINI_API_KEY", None)

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

# Local application imports
from backend.database import engine, Base, get_db
from backend.models import User, ChatMessage, Ticket
from backend.schemas import (
    UserRegisterRequest,
    UserLoginRequest,
    TokenResponse,
    UserProfileResponse,
    ChatRequest,
    ChatResponse,
    ChatMessageItem,
    TicketCreateRequest,
    TicketResponse
)
from backend.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user
)
from backend.rag_engine import generate_rag_response

# 2. Initialize Database tables
Base.metadata.create_all(bind=engine)

# 3. Create FastAPI application
app = FastAPI(
    title="CampusMind AI API",
    description="Hyper-personalized, multilingual AI assistant for college students (GEARS 2026)",
    version="2.0.0"
)

# 4. Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins in dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------
# AUTHENTICATION ENDPOINTS
# -------------------------------------------------------------

@app.post("/api/auth/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register_user(req: UserRegisterRequest, db: Session = Depends(get_db)):
    """Registers a new student, saves full profile context, and issues JWT."""
    # Check if email is already registered
    existing_email = db.query(User).filter(User.email == req.email.lower()).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # Check if student ID / Roll Number is already registered
    existing_sid = db.query(User).filter(User.student_id == req.student_id.upper()).first()
    if existing_sid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this Student ID / Roll Number already exists."
        )

    hashed_pw = get_password_hash(req.password)
    user = User(
        full_name=req.full_name.strip(),
        email=req.email.lower().strip(),
        hashed_password=hashed_pw,
        student_id=req.student_id.upper().strip(),
        branch=req.branch.upper().strip(),
        current_year=req.current_year.strip(),
        batch=req.batch.strip(),
        hostel_status=req.hostel_status.strip(),
        phone_number=req.phone_number.strip() if req.phone_number else None
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserProfileResponse.model_validate(user)
    )

@app.post("/api/auth/login", response_model=TokenResponse)
def login_user(req: UserLoginRequest, db: Session = Depends(get_db)):
    """Authenticates student credentials and returns access token + profile."""
    user = db.query(User).filter(User.email == req.email.lower().strip()).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )

    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserProfileResponse.model_validate(user)
    )

@app.get("/api/user/profile", response_model=UserProfileResponse)
def get_user_profile(current_user: User = Depends(get_current_user)):
    """Fetches full profile context of the logged-in student."""
    return UserProfileResponse.model_validate(current_user)

# -------------------------------------------------------------
# CHAT & RAG ENDPOINTS
# -------------------------------------------------------------

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(
    req: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Core RAG Endpoint:
    1. Injects student profile as hidden context
    2. Dynamically queries ChromaDB filtered by branch and year
    3. Invokes Gemini 2.5 Flash for factual, hallucination-free answer
    4. Persists message conversation to database
    5. Returns answer along with source document citation
    """
    # 1. Save student's user message
    user_msg = ChatMessage(
        user_id=current_user.id,
        role="user",
        content=req.message
    )
    db.add(user_msg)
    db.commit()

    # 2. Build profile dict for hidden prompt injection
    profile_dict = {
        "full_name": current_user.full_name,
        "student_id": current_user.student_id,
        "branch": current_user.branch,
        "current_year": current_user.current_year,
        "batch": current_user.batch,
        "hostel_status": current_user.hostel_status
    }

    # 3. Generate response using Smart RAG Engine
    rag_result = await generate_rag_response(
        query=req.message,
        user_profile=profile_dict,
        preferred_language=req.preferred_language
    )

    # 4. Save AI assistant message
    ai_msg = ChatMessage(
        user_id=current_user.id,
        role="assistant",
        content=rag_result["answer"],
        source=rag_result["source"]
    )
    db.add(ai_msg)
    db.commit()

    return ChatResponse(
        answer=rag_result["answer"],
        source=rag_result["source"],
        branch=current_user.branch,
        year=current_user.current_year
    )

@app.get("/api/chat/history", response_model=List[ChatMessageItem])
def get_chat_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves previous chat messages for current student."""
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == current_user.id)
        .order_by(ChatMessage.created_at.asc())
        .limit(50)
        .all()
    )
    return [ChatMessageItem.model_validate(m) for m in messages]

@app.delete("/api/chat/history")
def clear_chat_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Clears conversation history for 'New Chat' functionality."""
    db.query(ChatMessage).filter(ChatMessage.user_id == current_user.id).delete()
    db.commit()
    return {"message": "Chat history cleared successfully."}

# -------------------------------------------------------------
# STUDENT GRIEVANCE & COMPLAINT TICKET ENDPOINTS
# -------------------------------------------------------------

@app.post("/api/tickets/create", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
def create_ticket(
    req: TicketCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submits an official student grievance / maintenance ticket directly from chat.
    Auto-assigns tracking ID, SLA turnaround, and offline office location.
    """
    import random
    import time
    
    ticket_seq = int(time.time()) % 100000 + random.randint(100, 999)
    prefix = "HSTL" if "hostel" in req.category.lower() else ("MESS" if "mess" in req.category.lower() else "ACAD")
    ticket_number = f"#{prefix}-{ticket_seq}"
    
    # Auto-assign SLA & Offline resolution desk based on category
    sla = "24 Hours" if "hostel" in req.category.lower() or "electrical" in req.category.lower() else "48 Hours"
    offline_desk = (
        "Hostel Caretaker Desk (Ground Floor Block B, 9 AM - 6 PM)"
        if "hostel" in req.category.lower()
        else ("Chief Warden Office (Admin Block Room 104)" if "mess" in req.category.lower() else "Dean of Academics Office (Block 1, 2nd Floor)")
    )
    
    resolved_loc = req.location or current_user.hostel_status

    ticket = Ticket(
        ticket_number=ticket_number,
        user_id=current_user.id,
        category=req.category,
        title=req.title,
        description=req.description,
        location=resolved_loc,
        priority=req.priority or "Medium",
        status="Submitted",
        estimated_sla=sla,
        offline_option=offline_desk
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket

@app.get("/api/tickets/my-tickets", response_model=List[TicketResponse])
def get_my_tickets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves all tickets raised by the current student."""
    return (
        db.query(Ticket)
        .filter(Ticket.user_id == current_user.id)
        .order_by(Ticket.created_at.desc())
        .all()
    )

@app.get("/")
def health_check():
    return {
        "status": "healthy",
        "app": "CampusMind AI Backend",
        "version": "2.0.0",
        "ai_model": os.getenv("GEMINI_MODEL", "gemini-3.8-flash")
    }
