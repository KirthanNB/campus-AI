"""
CampusMind AI - FastAPI Backend Application
Hyper-personalized, Multilingual AI Assistant for College Students.
Includes JWT Authentication, Profile Management, SQLite Database, and Smart RAG Engine.
"""

import os
import sys
import uuid
from datetime import datetime
from pathlib import Path
from typing import List, Optional
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
from backend.database import engine, Base, get_db, run_migrations
from backend.models import User, ChatMessage, Ticket, ChatSession
from backend.schemas import (
    UserRegisterRequest,
    UserLoginRequest,
    TokenResponse,
    UserProfileResponse,
    ChatRequest,
    ChatResponse,
    ChatMessageItem,
    ChatSessionResponse,
    ChatSessionCreateRequest,
    FirebaseStatusResponse,
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
from backend.seed_users import seed_demo_accounts
from backend.student_context import (
    get_student_attendance_summary,
    get_student_tickets_summary,
    get_campus_news_summary,
    build_or_load_student_persona,
    get_student_courses
)
from backend.firebase_service import (
    init_firebase,
    is_firebase_configured,
    get_firebase_status,
    save_user_to_firebase,
    save_persona_to_firebase,
    save_ticket_to_firebase,
    save_chat_session_to_firebase,
    save_chat_message_to_firebase,
    get_chat_sessions_from_firebase,
    get_session_messages_from_firebase,
    delete_chat_session_from_firebase
)

# 2. Initialize Database tables & auto-seed demo accounts
Base.metadata.create_all(bind=engine)
try:
    run_migrations()
    seed_demo_accounts()
except Exception as e:
    print(f"[Database] Startup seed/migration notice: {e}")

# Attempt Firebase connection on startup
init_firebase()

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
# AUTHENTICATION & PERSONA ENDPOINTS
# -------------------------------------------------------------

@app.post("/api/auth/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register_user(req: UserRegisterRequest, db: Session = Depends(get_db)):
    """Registers a new student, creates structured persona (courses & attendance), and syncs with Firebase."""
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

    # Build and persist structured student persona to Firebase Firestore
    user_dict = {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "student_id": user.student_id,
        "branch": user.branch,
        "current_year": user.current_year,
        "batch": user.batch,
        "hostel_status": user.hostel_status,
        "phone_number": user.phone_number
    }
    save_user_to_firebase(user_dict)
    build_or_load_student_persona(user_dict, db)

    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserProfileResponse.model_validate(user)
    )

@app.post("/api/auth/login", response_model=TokenResponse)
def login_user(req: UserLoginRequest, db: Session = Depends(get_db)):
    """Authenticates student credentials, loads persona memory, and returns JWT."""
    user = db.query(User).filter(User.email == req.email.lower().strip()).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )

    # Ensure student persona is loaded/saved in Firebase Firestore
    user_dict = {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "student_id": user.student_id,
        "branch": user.branch,
        "current_year": user.current_year,
        "batch": user.batch,
        "hostel_status": user.hostel_status,
        "phone_number": user.phone_number
    }
    save_user_to_firebase(user_dict)
    build_or_load_student_persona(user_dict, db)

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

@app.get("/api/firebase/status", response_model=FirebaseStatusResponse)
def check_firebase_status():
    """Returns the current Firebase connection & Firestore status."""
    return get_firebase_status()

# -------------------------------------------------------------
# CHAT SESSIONS & RAG ENDPOINTS
# -------------------------------------------------------------

def get_or_create_chat_session(user_id: int, session_id: Optional[str], initial_title: str, db: Session) -> ChatSession:
    """Helper to retrieve existing session or generate a new unique session."""
    if session_id:
        existing = db.query(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == user_id).first()
        if existing:
            return existing

    # Create new session
    new_id = f"sess_{uuid.uuid4().hex[:12]}"
    clean_title = (initial_title[:32] + "...") if len(initial_title) > 32 else (initial_title or "New Chat")
    new_sess = ChatSession(
        id=new_id,
        user_id=user_id,
        title=clean_title
    )
    db.add(new_sess)
    db.commit()
    db.refresh(new_sess)

    # Sync session to Firebase Firestore
    save_chat_session_to_firebase({
        "id": new_id,
        "user_id": user_id,
        "title": clean_title,
        "created_at": new_sess.created_at.isoformat(),
        "updated_at": new_sess.updated_at.isoformat()
    })
    return new_sess

@app.get("/api/chat/sessions", response_model=List[ChatSessionResponse])
def get_chat_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves all chat sessions for the logged in student (for navbar history dropdown)."""
    sessions = (
        db.query(ChatSession)
        .filter(ChatSession.user_id == current_user.id)
        .order_by(ChatSession.updated_at.desc())
        .all()
    )
    results = []
    for s in sessions:
        last_msg = (
            db.query(ChatMessage)
            .filter(ChatMessage.session_id == s.id)
            .order_by(ChatMessage.created_at.desc())
            .first()
        )
        msg_count = db.query(ChatMessage).filter(ChatMessage.session_id == s.id).count()
        results.append(ChatSessionResponse(
            id=s.id,
            user_id=s.user_id,
            title=s.title,
            created_at=s.created_at,
            updated_at=s.updated_at,
            last_message=last_msg.content[:60] if last_msg else None,
            message_count=msg_count
        ))
    return results

@app.post("/api/chat/sessions", response_model=ChatSessionResponse)
def create_new_chat_session(
    req: ChatSessionCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Explicitly initializes a new blank chat session."""
    session = get_or_create_chat_session(current_user.id, None, req.title or "New Chat", db)
    return ChatSessionResponse(
        id=session.id,
        user_id=session.user_id,
        title=session.title,
        created_at=session.created_at,
        updated_at=session.updated_at,
        last_message=None,
        message_count=0
    )

@app.get("/api/chat/sessions/{session_id}/messages", response_model=List[ChatMessageItem])
def get_session_messages(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves all conversation messages for a specific session."""
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == current_user.id, ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )
    return [ChatMessageItem.model_validate(m) for m in messages]

@app.delete("/api/chat/sessions/{session_id}")
def delete_chat_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deletes a specific chat session and its associated messages."""
    session = db.query(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id).first()
    if session:
        db.delete(session)
        db.commit()
    delete_chat_session_from_firebase(session_id)
    return {"message": "Chat session deleted successfully."}

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(
    req: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Core RAG Endpoint:
    1. Attaches/creates user chat session
    2. Builds live rich student context (exact courses, live attendance, grievances, campus announcements)
    3. Injects student profile and queries vector store
    4. Invokes Gemini for factual response
    5. Saves conversation to SQLite and Firebase Firestore
    """
    session = get_or_create_chat_session(current_user.id, req.session_id, req.message, db)

    # 1. Save student's user message
    user_msg = ChatMessage(
        session_id=session.id,
        user_id=current_user.id,
        role="user",
        content=req.message
    )
    db.add(user_msg)
    db.commit()
    db.refresh(user_msg)

    # Sync message to Firebase Firestore
    save_chat_message_to_firebase(session.id, {
        "id": user_msg.id,
        "session_id": session.id,
        "user_id": current_user.id,
        "role": "user",
        "content": req.message,
        "created_at": user_msg.created_at.isoformat()
    })

    # 2. Build live rich student context using student's actual student_id
    attendance_summary = get_student_attendance_summary(
        branch=current_user.branch,
        current_year=current_user.current_year,
        student_id=current_user.student_id
    )
    tickets_summary = get_student_tickets_summary(current_user.id, db)
    news_summary = get_campus_news_summary()
    courses_list = get_student_courses(current_user.branch, current_user.current_year)

    profile_dict = {
        "full_name": current_user.full_name,
        "student_id": current_user.student_id,
        "branch": current_user.branch,
        "current_year": current_user.current_year,
        "batch": current_user.batch,
        "hostel_status": current_user.hostel_status,
        "courses": courses_list,
        "attendance_summary": attendance_summary,
        "tickets": tickets_summary,
        "campus_news": news_summary
    }

    # 3. Generate response using Smart RAG Engine
    rag_result = await generate_rag_response(
        query=req.message,
        user_profile=profile_dict,
        preferred_language=req.preferred_language
    )

    # 4. Save AI assistant message
    ai_msg = ChatMessage(
        session_id=session.id,
        user_id=current_user.id,
        role="assistant",
        content=rag_result["answer"],
        source=rag_result["source"]
    )
    session.updated_at = datetime.utcnow()
    db.add(ai_msg)
    db.commit()
    db.refresh(ai_msg)

    # Sync AI message to Firebase Firestore
    save_chat_message_to_firebase(session.id, {
        "id": ai_msg.id,
        "session_id": session.id,
        "user_id": current_user.id,
        "role": "assistant",
        "content": rag_result["answer"],
        "source": rag_result["source"],
        "created_at": ai_msg.created_at.isoformat()
    })

    return ChatResponse(
        answer=rag_result["answer"],
        source=rag_result["source"],
        branch=current_user.branch,
        year=current_user.current_year,
        session_id=session.id
    )

@app.get("/api/chat/history", response_model=List[ChatMessageItem])
def get_chat_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves recent chat messages across active sessions for current student."""
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
    db.query(ChatSession).filter(ChatSession.user_id == current_user.id).delete()
    db.commit()
    return {"message": "Chat history cleared successfully."}

@app.get("/api/student/attendance")
def get_student_attendance(current_user: User = Depends(get_current_user)):
    """Returns dynamic subject attendance, percentages, and bunk margins for logged in student."""
    return get_student_attendance_summary(
        branch=current_user.branch,
        current_year=current_user.current_year,
        student_id=current_user.student_id
    )

@app.get("/api/student/courses")
def get_student_course_catalog(current_user: User = Depends(get_current_user)):
    """Returns official course catalog for the student's branch and year."""
    return get_student_courses(current_user.branch, current_user.current_year)

@app.get("/api/student/news")
def get_student_news():
    """Returns active verified university announcements and circulars."""
    return get_campus_news_summary()

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
    Persists to SQLite and Firebase Firestore.
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

    # Sync ticket to Firebase Firestore
    save_ticket_to_firebase({
        "id": ticket.id,
        "ticket_number": ticket.ticket_number,
        "user_id": current_user.id,
        "student_id": current_user.student_id,
        "student_name": current_user.full_name,
        "category": ticket.category,
        "title": ticket.title,
        "description": ticket.description,
        "location": ticket.location,
        "priority": ticket.priority,
        "status": ticket.status,
        "estimated_sla": ticket.estimated_sla,
        "offline_option": ticket.offline_option,
        "created_at": ticket.created_at.isoformat()
    })

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

# -------------------------------------------------------------
# DOCUMENT & CITATION VIEWER ENDPOINT (PDF PRINT / HTML VIEW)
# -------------------------------------------------------------

from fastapi.responses import HTMLResponse

@app.get("/api/documents/view/{document_name:path}", response_class=HTMLResponse)
def view_document(document_name: str):
    """
    Renders official institutional documents from knowledge_base as a clean printable PDF / HTML page.
    """
    import html
    kb_dir = BASE_DIR.parent / "knowledge_base"
    if not kb_dir.exists():
        kb_dir = BASE_DIR / "knowledge_base"
    
    clean_name = document_name.strip().strip("[]*`")
    if not clean_name.endswith(".md"):
        target_file = kb_dir / f"{clean_name}.md"
    else:
        target_file = kb_dir / clean_name
        
    doc_path = None
    if target_file.exists():
        doc_path = target_file
    else:
        # Search for closest matching filename in knowledge_base
        search_terms = clean_name.replace("_", " ").replace("-", " ").lower().split()
        all_mds = list(kb_dir.glob("*.md"))
        best_match = None
        highest_score = 0
        
        for md_file in all_mds:
            fname_lower = md_file.stem.lower()
            score = sum(1 for term in search_terms if term in fname_lower)
            if score > highest_score:
                highest_score = score
                best_match = md_file
                
        if best_match:
            doc_path = best_match
        elif all_mds:
            doc_path = all_mds[0]

    if not doc_path or not doc_path.exists():
        fallback_path = kb_dir / "academic_policies_and_attendance.md"
        if fallback_path.exists():
            doc_path = fallback_path
        else:
            raise HTTPException(status_code=404, detail="Document not found.")

    raw_content = doc_path.read_text(encoding="utf-8")
    
    # Strip frontmatter if present
    doc_content = raw_content
    if raw_content.startswith("---"):
        parts = raw_content.split("---", 2)
        if len(parts) >= 3:
            doc_content = parts[2].strip()

    title_line = doc_path.stem.replace("_", " ").title()

    # Convert basic markdown tables and headers to clean HTML
    lines = doc_content.split("\n")
    html_body = []
    in_table = False
    
    for line in lines:
        line_str = line.strip()
        if line_str.startswith("# "):
            html_body.append(f"<h1 class='text-2xl font-bold text-slate-900 mt-6 mb-3 border-b pb-2 border-slate-200'>{html.escape(line_str[2:])}</h1>")
        elif line_str.startswith("## "):
            html_body.append(f"<h2 class='text-xl font-bold text-indigo-700 mt-5 mb-2.5'>{html.escape(line_str[3:])}</h2>")
        elif line_str.startswith("### "):
            html_body.append(f"<h3 class='text-lg font-semibold text-slate-800 mt-4 mb-2'>{html.escape(line_str[4:])}</h3>")
        elif line_str.startswith("|") and "|" in line_str[1:]:
            if "---" in line_str:
                continue
            cols = [c.strip() for c in line_str.split("|")[1:-1]]
            if not in_table:
                in_table = True
                html_body.append("<div class='overflow-x-auto my-4'><table class='w-full text-left border-collapse border border-slate-200 text-sm'><thead><tr class='bg-slate-100 text-slate-700 font-semibold'>")
                for c in cols:
                    html_body.append(f"<th class='border border-slate-200 px-3 py-2'>{html.escape(c)}</th>")
                html_body.append("</tr></thead><tbody>")
            else:
                html_body.append("<tr class='hover:bg-slate-50 text-slate-800'>")
                for c in cols:
                    html_body.append(f"<td class='border border-slate-200 px-3 py-2'>{html.escape(c)}</td>")
                html_body.append("</tr>")
        else:
            if in_table:
                in_table = False
                html_body.append("</tbody></table></div>")
            if line_str.startswith("- "):
                html_body.append(f"<li class='ml-6 list-disc text-slate-700 my-1'>{html.escape(line_str[2:])}</li>")
            elif line_str:
                html_body.append(f"<p class='text-slate-700 my-2 leading-relaxed'>{html.escape(line_str)}</p>")

    if in_table:
        html_body.append("</tbody></table></div>")

    rendered_content = "\n".join(html_body)

    full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title_line} - CampusMind Document Archive</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @media print {{
            .no-print {{ display: none !important; }}
            body {{ background: white !important; padding: 0 !important; }}
            .paper {{ shadow: none !important; border: none !important; padding: 0 !important; }}
        }}
    </style>
</head>
<body class="bg-slate-100 min-h-screen text-slate-800 py-8 px-4 font-sans">
    <div class="max-w-4xl mx-auto">
        <!-- Print Header & Controls -->
        <div class="no-print flex items-center justify-between mb-6 bg-white p-4 rounded-xl shadow-xs border border-slate-200">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                    🎓
                </div>
                <div>
                    <h2 class="font-bold text-slate-900 text-sm">CampusMind Institutional Repository</h2>
                    <p class="text-xs text-slate-500">Official Verified Circular & Academic Regulation</p>
                </div>
            </div>
            <button onclick="window.print()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition cursor-pointer flex items-center gap-2">
                🖨️ Print / Save as PDF
            </button>
        </div>

        <!-- Document Paper View -->
        <div class="paper bg-white p-8 sm:p-12 rounded-2xl shadow-md border border-slate-200">
            <!-- Header Stamp -->
            <div class="border-b-2 border-indigo-600 pb-4 mb-6 flex justify-between items-end">
                <div>
                    <div class="text-xs font-bold text-indigo-600 uppercase tracking-widest">CampusMind University Records</div>
                    <h1 class="text-2xl font-extrabold text-slate-900 mt-1">{title_line}</h1>
                </div>
                <div class="text-right text-xs text-slate-400 font-mono">
                    REF: {doc_path.name}<br>
                    VERIFIED & APPROVED
                </div>
            </div>

            <!-- Content -->
            <div class="prose max-w-none">
                {rendered_content}
            </div>

            <!-- Document Footer -->
            <div class="mt-12 pt-4 border-t border-slate-200 text-xs text-slate-400 flex justify-between items-center">
                <span>Official Institutional Record • CampusMind AI Platform</span>
                <span>GEARS 2026 Academic Archive</span>
            </div>
        </div>
    </div>
</body>
</html>"""
    return HTMLResponse(content=full_html)

@app.get("/")
def health_check():
    return {
        "status": "healthy",
        "app": "CampusMind AI Backend",
        "version": "2.0.0",
        "ai_model": os.getenv("GEMINI_MODEL", "gemini-3.8-flash")
    }

