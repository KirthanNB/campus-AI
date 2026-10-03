"""
Unified Smart RAG Engine for CampusMind AI.
Architecture:
- 100% LLM-First: Every user query is directly analyzed and processed by Google Gemini.
- Zero Hardcoded Dictionaries: Gemini dynamically reasons about intent (casual small talk vs. academic inquiry).
- Silent Personalization: Injects student profile (name, branch, year, batch, residence) without robotic recitation.
- Targeted Vector Search: Retrieves official university records matching the student's branch and year.
- Factual Grounding: Uses official records with document citations when academic details are requested.
- Free-form Intelligence: Answers general knowledge, advice, and conversation using Gemini's native brain.
- Resilient Multi-Tier Model Fallback: Gemini 3.8 Flash -> 3.7 Flash -> 3.6 Flash -> 3.5 Flash Lite -> 3.1 Flash Lite -> 2.5 Flash.
- Multilingual Support: Native multi-language comprehension (Hindi, Telugu, Tamil, French, Spanish, etc.).
"""

import os
import re
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

# Seamless fallback hierarchy across Gemini Flash models
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

async def invoke_llm_with_fallback(prompt: ChatPromptTemplate, question: str) -> str:
    """Invokes primary model with fast seamless fallback across Gemini Flash family."""
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
# MAIN INTELLIGENT AI ENTRYPOINT (100% GEMINI-POWERED)
# -------------------------------------------------------------

async def generate_rag_response(
    query: str,
    user_profile: Dict[str, Any],
    preferred_language: str = None
) -> Dict[str, Any]:
    """
    Intelligent AI Pipeline:
    Every query is analyzed and answered by Google Gemini.
    Gemini autonomously determines:
    1. Casual Conversation / Small Talk / Advice / Unrelated Questions -> Responds conversationally with its own brain (No citations).
    2. Campus & Academic Queries -> Grounds answers in the retrieved official documents with citations.
    """
    user_name = user_profile.get("full_name", "Student")
    first_name = user_name.split()[0] if user_name else "there"
    user_branch = user_profile.get("branch", "General")
    user_year = user_profile.get("current_year", "1st")
    user_batch = user_profile.get("batch", "2024-2028")
    hostel_status = user_profile.get("hostel_status", "Day Scholar")
    student_id = user_profile.get("student_id", "")

    # Retrieve relevant institutional records from ChromaDB (fast local HNSW search)
    docs, metadatas = query_vector_store(
        query=query,
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
    fallback_source = list(sources_set)[0] if sources_set else "Official College Record"

    # Multilingual instruction
    lang_instruction = ""
    if preferred_language and preferred_language.lower() != "auto":
        lang_instruction = f"IMPORTANT: Respond fluently and naturally in {preferred_language}."
    else:
        lang_instruction = "If the user asks in Hindi, Telugu, Tamil, Spanish, French, or another language, reply fluently in that same language. Otherwise, reply in clear, friendly English."

    # Unified System Prompt: Gemini reasons about intent and formulates response
    system_prompt = f"""You are CampusMind AI, an intelligent, empathetic, and friendly university AI copilot and mentor for college students.

Student Profile (Known context about the student; DO NOT recite their profile back to them robotically):
- Student Name: {user_name} (Address them warmly as {first_name})
- Department / Branch: {user_branch}
- Current Year: {user_year} Year
- Admission Batch: {user_batch}
- Living Status: {hostel_status}

Official Institutional Records (Context available to answer university-specific questions):
{context_str}

HOW TO REASON AND RESPOND:
1. INTELLIGENT INTENT RECOGNITION:
   - For Casual Conversation, Greetings & General Topics:
     If the user is saying "hi", "hello", "how are you", checking in, sharing their feelings, asking for general advice, asking technical or programming questions, or talking about anything NOT requiring institutional college records:
     -> Use your own natural intelligence, warmth, personality, and humor! Be an inspiring, friendly senior student or campus mentor.
     -> Answer directly and conversationally.
     -> DO NOT mention, invent, or cite any document sources for casual or general knowledge questions. Leave citations out completely.

   - For University-Specific Inquiries:
     If the student is asking about official academic calendars, exam schedules, dates, tuition fees, course curricula, hostel curfews, mess timings, attendance rules (75% rule), medical condonations, or placement rules:
     -> Rely strictly on the Official Institutional Records provided above.
     -> Provide specific, clear details: list out actual dates, semesters, course codes, and monetary figures using neat bullet points or Markdown tables.
     -> At the very end of your response on a new line, attach the source citation:
        `🏷️ Source: [Official Document Title]`

2. TONE & STYLE:
   - Warm, supportive, conversational, and direct.
   - Never say: "Hello {user_name}! As a {user_year} student in {user_branch} residing in {hostel_status}...". Jump straight into answering naturally!
   - {lang_instruction}
"""

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "{question}")
    ])

    try:
        raw_response = await invoke_llm_with_fallback(prompt, query)
        
        # Parse citation if Gemini determined this was an academic/institutional query
        extracted_source = ""
        clean_answer = raw_response.strip()

        # Look for 🏷️ Source: [Document Name] or Source: [Document Name] at the end
        source_pattern = r'(?:🏷️\s*)?Source:\s*\[?(.*?)\]?$'
        match = re.search(source_pattern, clean_answer, re.IGNORECASE | re.MULTILINE)
        
        if match:
            extracted_source = match.group(1).strip().strip("[]*`")
            # If the extracted source matched a placeholder, clean it
            if not extracted_source or extracted_source.lower() in ("official document title", "official document used", "none"):
                extracted_source = fallback_source
        
        return {
            "answer": clean_answer,
            "source": extracted_source,
            "branch": user_branch,
            "year": user_year
        }
    except Exception as e:
        print(f"[RAG] Error invoking LLM: {e}")
        return {
            "answer": f"Hey {first_name}! I encountered a momentary hiccup connecting to the AI model. Please try asking again in a moment!",
            "source": "",
            "branch": user_branch,
            "year": user_year
        }
