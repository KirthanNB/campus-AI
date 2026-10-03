import os
import sys
import asyncio
from dotenv import load_dotenv

# Load env variables
load_dotenv()

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.rag_engine import generate_rag_response

async def test_guardrails():
    student_profile = {
        "full_name": "Arjun Sharma",
        "student_id": "24CSE101",
        "branch": "CSE",
        "batch": "2024-2028",
        "year": 1,
        "semester": 2,
        "cgpa": 8.75,
        "attendance_percentage": 88.5,
        "language_preference": "English"
    }

    test_queries = [
        "tell me a joke",
        "who is the president of India",
        "How do I file a complaint about mess food and hostel Wi-Fi?",
        "What are my exam dates for this year?"
    ]

    for q in test_queries:
        print(f"\n==========================================")
        print(f"QUERY: {q}")
        print(f"==========================================")
        result = await generate_rag_response(q, student_profile)
        print(f"CITED SOURCE: {result.get('source')}")
        print(f"ANSWER:\n{result.get('answer')}")

if __name__ == "__main__":
    asyncio.run(test_guardrails())
