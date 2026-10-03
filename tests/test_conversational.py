"""
Test conversational responsiveness and non-robotic RAG answering.
"""

import asyncio
import time
from backend.rag_engine import generate_rag_response

async def test():
    student = {
        "full_name": "Aarav Sharma",
        "student_id": "23BCSE104",
        "branch": "CSE",
        "current_year": "3rd",
        "batch": "2023-2027",
        "hostel_status": "Hostel Block B"
    }

    print("=" * 60)
    print("Testing Casual & Academic Intent Flow")
    print("=" * 60)

    # Test 1: Casual 'hi'
    t0 = time.time()
    res1 = await generate_rag_response("hi", student)
    print(f"\n[Test 1] Query: 'hi' in {time.time()-t0:.3f}s")
    print(f"Reply:  {res1['answer']}")
    print(f"Source: '{res1['source']}' (should be empty)")
    assert res1['source'] == "", "Casual response should have no source!"

    # Test 2: Casual 'how are you?'
    t0 = time.time()
    res2 = await generate_rag_response("how are you?", student)
    print(f"\n[Test 2] Query: 'how are you?' in {time.time()-t0:.3f}s")
    print(f"Reply:  {res2['answer']}")
    print(f"Source: '{res2['source']}' (should be empty)")
    assert res2['source'] == "", "Casual response should have no source!"

    # Test 3: Academic question 'When is my Internal 1 exam?'
    t0 = time.time()
    res3 = await generate_rag_response("When is my Internal 1 exam?", student)
    print(f"\n[Test 3] Query: 'When is my Internal 1 exam?' in {time.time()-t0:.3f}s")
    print(f"Reply:  {res3['answer']}")
    print(f"Source: '{res3['source']}'")
    assert res3['source'] != "", "Academic response should have official source!"

    print("\n✅ All Intent & Responsiveness Tests Passed!")

if __name__ == "__main__":
    asyncio.run(test())
