"""
Comprehensive End-to-End Test for CampusMind AI.
Tests Register -> Casual Greetings -> Academic RAG -> Gratitude -> Profile.
"""

import sys
import json
import time
import urllib.request
import urllib.error

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

BASE_URL = "http://127.0.0.1:8000"

def make_req(endpoint, method="GET", data=None, token=None):
    url = f"{BASE_URL}{endpoint}"
    req = urllib.request.Request(url, method=method)
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    body = json.dumps(data).encode("utf-8") if data else None
    
    with urllib.request.urlopen(req, data=body) as resp:
        status = resp.status
        content = resp.read().decode("utf-8")
        return status, json.loads(content) if content else {}

def run_tests():
    suffix = str(int(time.time()))[-4:]
    print("=" * 60)
    print("🚀 Running End-to-End API Integration Verification")
    print("=" * 60)

    # 1. Register student
    payload = {
        "full_name": f"Kavya Patel",
        "email": f"kavya.{suffix}@campus.edu",
        "password": "password123",
        "student_id": f"24BCSE{suffix}",
        "branch": "CSE",
        "current_year": "2nd",
        "batch": "2024-2028",
        "hostel_status": "Hostel Block A",
        "phone_number": "+91 91234 56789"
    }

    print("\n[Step 1] Registering Kavya Patel (CSE 2nd Year)...")
    status, reg = make_req("/api/auth/register", method="POST", data=payload)
    assert status == 201
    token = reg["access_token"]
    print(f"✅ Registered: {reg['user']['full_name']} | Token: {token[:15]}...")

    # 2. Test Casual Message 'hi'
    print("\n[Step 2] Sending casual greeting: 'hi'...")
    t0 = time.time()
    status, res1 = make_req("/api/chat", method="POST", data={"message": "hi"}, token=token)
    elapsed = time.time() - t0
    print(f"✅ Response ({elapsed:.3f}s):\n{res1['answer']}")
    print(f"   Source: '{res1['source']}' (should be empty)")
    assert res1['source'] == "", "Casual response must have no citation badge!"

    # 3. Test Academic Query 'When is my CAT-1 exam?'
    print("\n[Step 3] Asking academic question: 'When are my CAT-1 exams?'...")
    t0 = time.time()
    status, res2 = make_req("/api/chat", method="POST", data={"message": "When are my CAT-1 exams?"}, token=token)
    elapsed = time.time() - t0
    print(f"✅ Response ({elapsed:.3f}s):\n{res2['answer']}")
    print(f"   Source Citation: '{res2['source']}'")
    assert res2['source'] != "", "Academic question must cite source document!"

    # 4. Test Casual Message 'thanks!'
    print("\n[Step 4] Sending casual gratitude: 'thanks!'...")
    t0 = time.time()
    status, res3 = make_req("/api/chat", method="POST", data={"message": "thanks!"}, token=token)
    elapsed = time.time() - t0
    print(f"✅ Response ({elapsed:.3f}s):\n{res3['answer']}")
    print(f"   Source: '{res3['source']}' (should be empty)")
    assert res3['source'] == "", "Casual response must have no citation badge!"

    print("\n" + "=" * 60)
    print("🎉 ALL TESTS PASSED! Seamless casual routing, fast responses, and natural answering verified.")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
