"""
Smart RAG Engine for CampusMind AI.
Features:
- Instant Conversational Routing (0ms latency for greetings and small talk)
- Natural, Human-like Student Peer/Mentor Persona (No robotic profile recitation)
- Primary Model: Gemini 3.8 Flash (with seamless Gemini 3.x resilient fallback)
- Dynamic metadata filtering based on the student's branch, year, and batch
- Contextual fallback to campus-wide policies (applicable_to == 'all')
- Strict zero-hallucination factual grounding for academic queries
- Multilingual assistance (Hindi, Telugu, Tamil, Spanish, French, German, English, etc.)
- Selective citation tracking (only when official records are referenced)
"""

import os
import random
from pathlib import Path
from typing import List, Dict, Any, Tuple
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")
load_dotenv(BASE_DIR / "backend" / ".env")
os.environ.pop("GEMINI_API_KEY", None)

import chromadb
from chromadb.utils import embedding_functions
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate

CHROMA_DIR = BASE_DIR / "backend" / "chroma_db"
COLLECTION_NAME = "campusmind_knowledge"
PRIMARY_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")

# Seamless fallback hierarchy across Gemini 3.x Flash models
MODEL_HIERARCHY = [
    PRIMARY_MODEL,
    "gemini-3.7-flash",
    "gemini-3.6-flash",
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-2.5-flash"
]

# Singleton references
_chroma_client = None
_collection = None
_default_ef = None

def get_embedding_function():
    global _default_ef
    if _default_ef is None:
        _default_ef = embedding_functions.DefaultEmbeddingFunction()
    return _default_ef

def get_chroma_collection():
    global _chroma_client, _collection
    if _collection is None:
        _chroma_client = chromadb.PersistentClient(path=str(CHROMA_DIR))
        _collection = _chroma_client.get_or_create_collection(
            name=COLLECTION_NAME,
            embedding_function=get_embedding_function()
        )
    return _collection

def extract_content_text(content: Any) -> str:
    """Safely extracts clean string text from str, dict, or list of content blocks."""
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for item in content:
            if isinstance(item, dict) and "text" in item:
                parts.append(item["text"])
            elif isinstance(item, str):
                parts.append(item)
            elif hasattr(item, "text"):
                parts.append(str(item.text))
        return "\n".join(parts)
    if isinstance(content, dict) and "text" in content:
        return content["text"]
    return str(content)

# -------------------------------------------------------------
# FAST INTENT ROUTER: Instant greetings & conversational handling
# -------------------------------------------------------------

CASUAL_RESPONSES = {
    "hi": [
        "Hey {name}! 👋 How's your day going? What can I help you with today on campus?",
        "Hi {name}! Great to see you. Looking for exam schedules, fee details, syllabus, or anything else?",
        "Hey {name}! What's on your mind today? Ready to help you with anything academic or campus-related!"
    ],
    "hello": [
        "Hello {name}! 👋 Hope classes are treating you well. What can I look up for you today?",
        "Hi {name}! How can I help you today with your courses, exams, or hostel details?",
        "Hello there! What would you like to check out today?"
    ],
    "hey": [
        "Hey {name}! What can I help you find today?",
        "Hey there! How's your week going? Let me know what you need help with."
    ],
    "how are you": [
        "I'm doing great, thank you for asking! 😊 Ready to help you navigate anything on campus. How are you doing today?",
        "Doing fantastic! Excited to help you out. What's on your agenda today, {name}?"
    ],
    "who are you": [
        "I'm **CampusMind AI**, your personal university assistant! I have direct access to your department's curriculum, exam calendars, fee breakdown, hostel guidelines, and university policies so you never have to search through circulars.",
        "I'm **CampusMind AI** — built to make college life effortless. You can ask me about your exam schedules, fee due dates, electives, hostel rules, or placement criteria anytime!"
    ],
    "thanks": [
        "You're very welcome, {name}! 😊 Feel free to ask if you need anything else.",
        "Glad I could help! Good luck with your studies, {name}!",
        "Anytime! I'm always here if you have more questions."
    ],
    "thank you": [
        "You're very welcome, {name}! 😊 Let me know whenever you need anything else.",
        "Happy to help! Have a great day ahead!",
        "Anytime, {name}! Keep up the great work!"
    ],
    "bye": [
        "Goodbye {name}! Have an awesome day ahead and good luck with your classes! 🚀",
        "See you later! Feel free to message me whenever you have questions."
    ]
}

def detect_instant_casual(query: str, first_name: str) -> str:
    """Returns an immediate, warm response for common greetings without invoking LLM or RAG."""
    clean_q = query.strip().lower().rstrip("?!.,")
    
    # Check exact casual keys
    if clean_q in CASUAL_RESPONSES:
        template = random.choice(CASUAL_RESPONSES[clean_q])
        return template.format(name=first_name)
    
    # Short variants like "hi there", "hello!", "hey bot"
    for key, responses in CASUAL_RESPONSES.items():
        if clean_q.startswith(key + " ") or clean_q.endswith(" " + key):
            # Check there are no academic words in the query
            academic_terms = {"exam", "fee", "fees", "syllabus", "hostel", "mess", "curfew", "attendance", "date", "credit", "grade"}
            if not any(term in clean_q for term in academic_terms):
                return random.choice(responses).format(name=first_name)
                
    return None

def is_college_query(query: str) -> bool:
    """Detects if query is an academic or university-specific inquiry needing RAG."""
    clean_q = query.lower()
    college_keywords = {
        "exam", "exams", "internal", "endsem", "test", "schedule", "timetable", "date", "dates",
        "fee", "fees", "tuition", "payment", "due", "deadline", "cost", "penalty", "scholarship",
        "syllabus", "subject", "subjects", "course", "courses", "credit", "credits", "elective", "basket", "core", "curriculum",
        "hostel", "mess", "dining", "room", "food", "warden", "curfew", "in-time", "intime", "gate", "block a", "block b",
        "attendance", "condonation", "medical", "detain", "detainment", "grade", "cgpa", "sgpa", "gpa", "library", "book",
        "placement", "internship", "capstone", "project", "company", "recruit", "package", "lpa", "dean", "rule", "rules", "policy"
    }
    return any(k in clean_q for k in college_keywords)

# -------------------------------------------------------------
# VECTOR SEARCH & RETRIEVAL
# -------------------------------------------------------------

def query_vector_store(
    query: str,
    user_branch: str,
    user_year: str,
    top_k: int = 5
) -> Tuple[List[str], List[Dict[str, Any]]]:
    """
    Performs dynamic metadata filtered search in ChromaDB.
    Retrieves the targeted chunks matching user's branch and year (or campus-wide docs).
    """
    collection = get_chroma_collection()
    
    where_filter = {
        "$and": [
            {"$or": [{"branch": user_branch.upper()}, {"applicable_to": "all"}]},
            {"$or": [{"year": user_year}, {"year": "all"}]}
        ]
    }
    
    enhanced_query = f"{query} {user_branch} {user_year} Year"
    
    results = None
    try:
        results = collection.query(
            query_texts=[enhanced_query],
            n_results=top_k,
            where=where_filter
        )
    except Exception as e:
        print(f"[RAG] Filtered query notice: {e}, falling back to branch-only or unrestricted search")
        try:
            results = collection.query(
                query_texts=[enhanced_query],
                n_results=top_k,
                where={"$or": [{"branch": user_branch.upper()}, {"applicable_to": "all"}]}
            )
        except Exception:
            pass

    documents = []
    metadatas = []
    
    if results and results.get("documents") and len(results["documents"][0]) > 0:
        documents = results["documents"][0]
        metadatas = results["metadatas"][0]
    else:
        fallback_results = collection.query(
            query_texts=[enhanced_query],
            n_results=top_k
        )
        if fallback_results.get("documents") and len(fallback_results["documents"][0]) > 0:
            documents = fallback_results["documents"][0]
            metadatas = fallback_results["metadatas"][0]

    return documents, metadatas

async def get_search_query(query: str, preferred_language: str = None) -> str:
    """Translates regional non-ASCII script (e.g. Hindi, Telugu) to English search terms."""
    if all(ord(c) < 128 for c in query):
        return query

    if preferred_language and preferred_language.lower() == "english":
        return query

    for model_name in MODEL_HIERARCHY:
        try:
            llm = ChatGoogleGenerativeAI(model=model_name, temperature=0.1, max_retries=0)
            translation_prompt = (
                "Translate the following question into 3-5 concise English search keywords for university documents. "
                f"Question: {query}"
            )
            resp = await llm.ainvoke(translation_prompt)
            text = extract_content_text(resp.content).strip()
            if text:
                return text
        except Exception:
            continue

    return query

async def invoke_llm_with_fallback(prompt: ChatPromptTemplate, question: str) -> str:
    """Invokes primary model with fast seamless fallback across Gemini 3.x family."""
    last_err = None
    for model_name in MODEL_HIERARCHY:
        try:
            llm = ChatGoogleGenerativeAI(
                model=model_name,
                temperature=0.3,
                max_retries=0
            )
            chain = prompt | llm
            response = await chain.ainvoke({"question": question})
            text = extract_content_text(response.content)
            if text and len(text.strip()) > 0:
                return text
        except Exception as e:
            err_msg = str(e)
            print(f"[RAG Engine] Switching from '{model_name}' due to: {err_msg[:100]}")
            last_err = e
            continue

    if last_err:
        raise last_err
    return "I couldn't generate a response. Please try asking again."

# -------------------------------------------------------------
# MAIN RAG ENTRYPOINT
# -------------------------------------------------------------

async def generate_rag_response(
    query: str,
    user_profile: Dict[str, Any],
    preferred_language: str = None
) -> Dict[str, Any]:
    """
    Smart conversational pipeline:
    1. Fast route for greetings/small talk (0ms latency, no vector search).
    2. RAG route for academic/campus questions (targeted 3 chunks, friendly peer persona).
    """
    user_name = user_profile.get("full_name", "Student")
    first_name = user_name.split()[0] if user_name else "there"
    user_branch = user_profile.get("branch", "General")
    user_year = user_profile.get("current_year", "1st")
    user_batch = user_profile.get("batch", "2024-2028")
    hostel_status = user_profile.get("hostel_status", "Day Scholar")
    student_id = user_profile.get("student_id", "")

    # STEP 1: Check instant casual response for greetings/small talk
    instant_reply = detect_instant_casual(query, first_name)
    if instant_reply:
        return {
            "answer": instant_reply,
            "source": "",  # No source for casual greeting
            "branch": user_branch,
            "year": user_year
        }

    # STEP 2: Check if this is a general conversational chat (not college-specific)
    is_academic = is_college_query(query)

    if not is_academic:
        # Conversational query: Ask LLM without vector search (fast, zero document overhead)
        conversational_prompt = ChatPromptTemplate.from_messages([
            ("system", f"""You are CampusMind AI, a warm, friendly, and helpful university AI companion for college students.
You are chatting with {first_name}, who is a student in {user_branch}.
Speak naturally, conversationally, and warmly like a friendly, encouraging senior student or mentor.
Do NOT mechanically list their profile or recitation of facts.
Keep your response concise and conversational (1-3 sentences).
Do not cite any sources."""),
            ("human", "{question}")
        ])
        try:
            answer = await invoke_llm_with_fallback(conversational_prompt, query)
            return {
                "answer": answer,
                "source": "",
                "branch": user_branch,
                "year": user_year
            }
        except Exception as e:
            return {
                "answer": f"Hey {first_name}! How can I help you today with your courses, exams, or campus life?",
                "source": "",
                "branch": user_branch,
                "year": user_year
            }

    # STEP 3: Academic / Campus inquiry -> Execute targeted RAG
    search_query = await get_search_query(query, preferred_language)

    # Retrieve top targeted chunks for rich, complete context
    docs, metadatas = query_vector_store(
        query=search_query,
        user_branch=user_branch,
        user_year=user_year,
        top_k=5
    )

    formatted_context_list = []
    sources_set = set()
    
    for doc_text, meta in zip(docs, metadatas):
        doc_title = meta.get("title", meta.get("source", "Official College Record"))
        sources_set.add(doc_title)
        formatted_context_list.append(f"--- Document: {doc_title} ---\n{doc_text}")

    context_str = "\n\n".join(formatted_context_list) if formatted_context_list else "No official records found."
    primary_source = ", ".join(list(sources_set)[:2]) if sources_set else "Official College Records"

    # Multilingual instruction
    lang_instruction = ""
    if preferred_language and preferred_language.lower() != "auto":
        lang_instruction = f"IMPORTANT: Respond fluently and naturally in {preferred_language}."
    else:
        lang_instruction = "If the user asks in Hindi, Telugu, Tamil, Spanish, French, or another language, reply fluently in that same language. Otherwise, reply in clear, friendly English."

    # Natural, Human-like Persona: NO robotic recitation of profile!
    system_prompt = f"""You are CampusMind AI, a friendly, intelligent university copilot and mentor for college students.

Student Context (Use this context silently to answer with the right branch/year facts; DO NOT recite their profile back to them):
- Student Name: {user_name} (Call them {first_name})
- Branch: {user_branch}
- Current Year: {user_year} Year
- Batch: {user_batch}
- Residence: {hostel_status}

GUIDELINES:
1. Tone: Warm, supportive, conversational, and direct — like a smart senior friend or helpful academic advisor.
2. CRITICAL: DO NOT start your response with a robotic recitation of their profile (e.g. NEVER say: "Hello [Name]! As a [Branch] [Year] student residing in [Hostel]..."). Jump straight to the answer in a friendly, conversational way!
3. Ground your facts (dates, fees, courses, rules) strictly in the Official College Records context below.
4. If asked about exam schedules, timetables, fees, or curricula, ALWAYS directly present the actual dates, milestones, subjects, or tables from the context (e.g. for exam roadmaps, detail CAT-1, CAT-2, Lab, and End-Sem dates and subject allocations for both Odd and Even Semesters). Do NOT withhold the dates or tell them to check the document if the dates are present in the context!
5. If a specific detail is genuinely not found in the records, politely state: "I couldn't find the exact details for this in the current records, so it's best to check with the administration or department office."
6. Format key dates or amounts clearly using bold text, tables, or bullet points where helpful.
7. {lang_instruction}
8. At the very end, append the citation on a new line:
   `🏷️ Source: [Name of the document used]`

Official College Records Context:
{context_str}
"""

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "{question}")
    ])

    try:
        answer_text = await invoke_llm_with_fallback(prompt, query)
        
        return {
            "answer": answer_text,
            "source": primary_source,
            "branch": user_branch,
            "year": user_year
        }
    except Exception as e:
        print(f"[RAG] Error invoking LLM: {e}")
        return {
            "answer": f"I ran into an issue retrieving that detail right now. Please try asking again in a moment.",
            "source": "",
            "branch": user_branch,
            "year": user_year
        }
