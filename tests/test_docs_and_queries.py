import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

docs = [
    'google_microsoft_placement_drive_2026.md',
    'exam_schedule_CSE_3rdyr_2026.md',
    'hostel_and_campus_rules.md',
    'student_innovation_and_project_expo.md',
    'academic_policies_and_attendance.md'
]

print("--- Testing Document Content API ---")
for d in docs:
    res = client.get(f"/api/documents/content/{d}")
    assert res.status_code == 200, f"Content failed for {d}: {res.status_code}"
    data = res.json()
    assert len(data["content"]) > 50, f"Content empty for {d}"
    print(f"Content API: {d} -> Title: {data['title'][:35]}...")

print("\n--- Testing Document HTML View API ---")
for d in docs:
    res = client.get(f"/api/documents/view/{d}")
    assert res.status_code == 200, f"View failed for {d}: {res.status_code}"
    assert "CampusMind" in res.text, f"Brand missing in HTML for {d}"
    print(f"View HTML API: {d} -> Status: 200 OK")

print("\n--- Testing 4 Suggested Queries Source Backing ---")
from backend.rag_engine import generate_rag_response

prompts = [
    "Current attendance status of every subjects.",
    "Provide syllabus of this sem of mine and a tailored roadmap to achieve 9+ gpa.",
    "Any recent placement updates?",
    "Hostel Wi-Fi high packet loss status and maintenance update"
]

mock_user = {
    "name": "Alex Mercer",
    "branch": "CSE",
    "current_year": "3rd",
    "residence_type": "Hostel Block B"
}

import asyncio

for p in prompts:
    resp = asyncio.run(generate_rag_response(p, mock_user))
    src = resp.get("source", "")
    assert src != "", f"Empty source for: {p}"
    print(f"Query: '{p[:40]}...' -> Source: [{src}]")

print("\nALL VERIFICATIONS PASSED!")
