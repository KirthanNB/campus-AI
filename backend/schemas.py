"""
Pydantic schemas for request validation and response serialization.
"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

# ----------------- User & Auth Schemas -----------------
class UserRegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=120)
    email: str = Field(..., min_length=3, max_length=120)
    password: str = Field(..., min_length=6, max_length=100)
    student_id: str = Field(..., min_length=2, max_length=60, description="Roll Number / Student ID")
    branch: str = Field(..., description="CSE, ECE, MECH, EEE, CIVIL, IT")
    current_year: str = Field(..., description="1st, 2nd, 3rd, 4th")
    batch: str = Field(..., description="Admission Year / Batch e.g. 2024 or 2024-2028")
    hostel_status: str = Field(..., description="Day Scholar, Hostel Block A, Hostel Block B")
    phone_number: Optional[str] = Field(None, max_length=30)

class UserLoginRequest(BaseModel):
    email: str
    password: str

class UserProfileResponse(BaseModel):
    id: int
    full_name: str
    email: str
    student_id: str
    branch: str
    current_year: str
    batch: str
    hostel_status: str
    phone_number: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfileResponse

# ----------------- Chat Schemas -----------------
class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="Student's query to CampusMind AI")
    preferred_language: Optional[str] = Field(None, description="Optional target language e.g. Hindi, Telugu, Spanish")
    session_id: Optional[str] = Field(None, description="Chat session identifier")

class ChatResponse(BaseModel):
    answer: str
    source: str
    branch: str
    year: str
    session_id: Optional[str] = None
    session_title: Optional[str] = None

class ChatSessionCreateRequest(BaseModel):
    title: Optional[str] = Field("New Conversation", max_length=255)

class ChatSessionResponse(BaseModel):
    id: str
    user_id: int
    title: str
    created_at: datetime
    updated_at: datetime
    last_message: Optional[str] = None
    message_count: Optional[int] = 0

    class Config:
        from_attributes = True

class ChatMessageItem(BaseModel):
    id: int
    session_id: Optional[str] = None
    role: str
    content: str
    source: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class FirebaseStatusResponse(BaseModel):
    configured: bool
    project_id: Optional[str] = None
    message: str

# ----------------- Ticket & Grievance Schemas -----------------
class TicketCreateRequest(BaseModel):
    category: str = Field(..., description="Hostel Maintenance, Mess Food, Academic Grievance, etc.")
    title: str = Field(..., min_length=3, max_length=255)
    description: str = Field(..., min_length=5)
    location: Optional[str] = Field(None, description="e.g. Hostel Block B Room 304")
    priority: Optional[str] = Field("Medium", description="Low, Medium, High, Urgent")

class TicketResponse(BaseModel):
    id: int
    ticket_number: str
    category: str
    title: str
    description: str
    location: Optional[str] = None
    priority: str
    status: str
    estimated_sla: str
    offline_option: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
