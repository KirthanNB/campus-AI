"""
Verification test for CampusMind AI Smart RAG Engine.
Tests personalization, branch filtering, hostel knowledge, and multilingual handling.
"""

import asyncio
import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")
load_dotenv(BASE_DIR / "backend" / ".env")
os.environ.pop("GEMINI_API_KEY", None)

from backend.rag_engine import generate_rag_response

async def run_tests():
    print("=" * 60)
    print("🧪 Running CampusMind AI RAG Engine Verification Tests")
    print("=" * 60)

    # Test Case 1: CSE 3rd Year Student asking about exams
    cse_student = {
        "full_name": "Aarav Sharma",
        "student_id": "23BCSE104",
        "branch": "CSE",
        "current_year": "3rd",
        "batch": "2023-2027",
        "hostel_status": "Hostel Block B"
    }
    print(f"\n--- Test 1: CSE Student asking about Internal Exams ---")
    res1 = await generate_rag_response(
        query="When are my Internal 1 and End-Semester exams scheduled?",
        user_profile=cse_student
    )
    print(f"Answer:\n{res1['answer']}")
    print(f"Citation Source: {res1['source']}")

    # Test Case 2: MECH 2nd Year Student asking about fees
    mech_student = {
        "full_name": "Rohan Verma",
        "student_id": "24BMECH055",
        "branch": "MECH",
        "current_year": "2nd",
        "batch": "2024-2028",
        "hostel_status": "Day Scholar"
    }
    print(f"\n--- Test 2: MECH Student asking about Tuition Fees ---")
    res2 = await generate_rag_response(
        query="How much is my annual tuition fee and when is the payment deadline?",
        user_profile=mech_student
    )
    print(f"Answer:\n{res2['answer']}")
    print(f"Citation Source: {res2['source']}")

    # Test Case 3: Multilingual Query in Hindi
    print(f"\n--- Test 3: Multilingual Query (Hindi) ---")
    res3 = await generate_rag_response(
        query="होस्टल के गेट बंद होने का क्या समय है और मेस का खाना कब मिलता है?",
        user_profile=cse_student,
        preferred_language="Hindi"
    )
    print(f"Answer:\n{res3['answer']}")
    print(f"Citation Source: {res3['source']}")

    print("\n✅ ALL TESTS EXECUTED!")

if __name__ == "__main__":
    asyncio.run(run_tests())
