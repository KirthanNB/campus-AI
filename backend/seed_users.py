import os
import sys

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from backend.database import SessionLocal
from backend.models import User
from backend.auth import get_password_hash

def seed_demo_accounts():
    db = SessionLocal()

    demo_users = [
        {
            "full_name": "Arjun Sharma",
            "email": "arjun.sharma@campus.edu",
            "password": "Campus@123",
            "student_id": "24CSE101",
            "branch": "CSE",
            "current_year": "1st",
            "batch": "2024-2028",
            "hostel_status": "Hostel Block B (Room 304)",
            "phone_number": "+91 98765 43210"
        },
        {
            "full_name": "Priya Patel",
            "email": "priya.patel@campus.edu",
            "password": "Campus@123",
            "student_id": "23ECE205",
            "branch": "ECE",
            "current_year": "2nd",
            "batch": "2023-2027",
            "hostel_status": "Hostel Block A (Room 112)",
            "phone_number": "+91 98765 12345"
        },
        {
            "full_name": "Rahul Verma",
            "email": "rahul.verma@campus.edu",
            "password": "Campus@123",
            "student_id": "22MECH310",
            "branch": "MECH",
            "current_year": "3rd",
            "batch": "2022-2026",
            "hostel_status": "Day Scholar",
            "phone_number": "+91 98111 22334"
        }
    ]

    for u in demo_users:
        existing = db.query(User).filter(User.email == u["email"]).first()
        if existing:
            existing.hashed_password = get_password_hash(u["password"])
            existing.full_name = u["full_name"]
            existing.branch = u["branch"]
            existing.current_year = u["current_year"]
            existing.batch = u["batch"]
            existing.hostel_status = u["hostel_status"]
            print(f"Updated account: {u['email']}")
        else:
            new_u = User(
                full_name=u["full_name"],
                email=u["email"],
                hashed_password=get_password_hash(u["password"]),
                student_id=u["student_id"],
                branch=u["branch"],
                current_year=u["current_year"],
                batch=u["batch"],
                hostel_status=u["hostel_status"],
                phone_number=u["phone_number"]
            )
            db.add(new_u)
            print(f"Created account: {u['email']}")

    db.commit()
    db.close()
    print("Demo accounts seeded successfully!")

if __name__ == "__main__":
    seed_demo_accounts()
