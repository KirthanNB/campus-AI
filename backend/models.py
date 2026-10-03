"""
SQLAlchemy models for User onboarding and Chat history.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(120), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    student_id = Column(String(60), unique=True, index=True, nullable=False)
    branch = Column(String(50), nullable=False)  # CSE, ECE, MECH, EEE, CIVIL, IT
    current_year = Column(String(20), nullable=False)  # 1st, 2nd, 3rd, 4th
    batch = Column(String(30), nullable=False)  # 2022, 2023, 2024
    hostel_status = Column(String(50), nullable=False)  # Day Scholar, Hostel Block A, Hostel Block B
    phone_number = Column(String(30), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    messages = relationship("ChatMessage", back_populates="user", cascade="all, delete-orphan")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String(20), nullable=False)  # 'user' or 'assistant'
    content = Column(Text, nullable=False)
    source = Column(String(255), nullable=True)  # Citation source document name
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="messages")

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    ticket_number = Column(String(50), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category = Column(String(60), nullable=False)  # Hostel Maintenance, Mess Food, Academic Grievance, etc.
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    location = Column(String(150), nullable=True)  # e.g., Hostel Block B, Room 304
    priority = Column(String(20), default="Medium")  # Low, Medium, High, Urgent
    status = Column(String(30), default="Submitted")  # Submitted, In Progress, Resolved
    estimated_sla = Column(String(50), default="24-48 Hours")
    offline_option = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

