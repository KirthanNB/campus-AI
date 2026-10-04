# CampusMind AI
### Hyper-Personalized, Multilingual AI Copilot for College Students

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![ChromaDB](https://img.shields.io/badge/ChromaDB-Vector_Store-FF6F00?style=flat)](https://www.trychroma.com/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-3.8_Flash-4285F4?style=flat&logo=google&logoColor=white)](https://ai.google.dev/)

---

## Overview

**CampusMind AI** is a production-grade, full-stack AI copilot designed to solve student information fragmentation. Rather than acting as a generic, robotic chatbot, CampusMind AI delivers **zero-hallucination, hyper-personalized answers** tailored directly to each student's branch, academic year, admission batch, and residential status.

---

## Key Features

### 1. Dual-Path Cognitive Engine
- **Instant Small-Talk Routing (<0.06s):** Greetings (`"hi"`, `"how are you?"`, `"who are you?"`), gratitude, and goodbyes respond immediately without invoking heavy vector searches or consuming LLM quota.
- **Deep Academic RAG:** Real campus questions dynamically trigger ChromaDB vector similarity search filtered by student metadata.

### 2. Hyper-Personalized Zero-Shot Context Injection
- Captures 9 essential student attributes during onboarding:
  - **Full Name, Student ID / Roll Number**
  - **Branch:** CSE, ECE, MECH, EEE, CIVIL, IT
  - **Current Year:** 1st, 2nd, 3rd, 4th Year
  - **Admission Batch:** 2024–2028, 2023–2027, 2022–2026
  - **Hostel / Residence:** Day Scholar, Hostel Block A, Hostel Block B
  - **Contact:** Email, Phone Number
- **Silent Injection:** Context is passed silently to the AI so it never asks *"Which branch are you in?"* and never repeats the profile back robotically.

### 3. Complete Academic Year Exam Timetables
- Comprehensive roadmaps covering **both Odd and Even Semesters**:
  - **Odd Semester (Autumn):** CAT-1 (Oct), CAT-2 (Nov), Lab Exams (Dec), FAT Finals (Dec)
  - **Even Semester (Spring):** CAT-1 (March), CAT-2 (April/May), Lab Exams (May), Spring FAT (May/June)
  - **Day 1 to Day 4 Subject Allocations:** Maps exact course codes and titles per branch and year (e.g., DSA, OS, Web Tech, RDBMS, AI/ML).

### 4. Dynamic Fee Calculations
- Differentiated tuition fees, lab consumables, digital library access, tech/cloud fees, admission caution deposits, and 4th-year capstone fees across all 6 engineering departments.
- Hostel Block A & Block B boarding and multi-cuisine mess charges.

### 5. Multilingual Assistance
- Native language translation and response generation for **Hindi, Telugu, Tamil, Spanish, French, German**, and English.
- Queries in regional languages are matched against English records and answered fluently in the requested language.

### 6. Resilient Model Fallback Architecture
- Primary model: **Gemini 3.8 Flash**.
- Automatic failover across Google's high-efficiency model tiers (`gemini-3.7-flash` ➔ `gemini-3.6-flash` ➔ `gemini-3.5-flash-lite` ➔ `gemini-3.1-flash-lite` ➔ `gemini-2.5-flash`) ensuring 100% uptime even under high traffic or rate limits.

---

##  Architecture & Data Strategy

```
                          ┌────────────────────────┐
                          │   React + Vite UI      │
                          │ (Modern Glassmorphic)  │
                          └───────────┬────────────┘
                                      │ HTTP / JSON (JWT Auth)
                                      ▼
                          ┌────────────────────────┐
                          │    FastAPI Backend     │
                          └─────┬────────────┬─────┘
                                │            │
                Fast Route (<0.06s)          │ Academic RAG
                                │            ▼
            ┌───────────────────┴──┐  ┌────────────────────────┐
            │ Instant Response     │  │ Metadata Filtered RAG  │
            │ (Greetings & Casual) │  │  Branch + Year Filter  │
            └──────────────────────┘  └───────────┬────────────┘
                                                  │
                                      ┌───────────┴────────────┐
                                      │  ChromaDB Vector Store │
                                      │ 171 Docs / 876 Chunks  │
                                      └───────────┬────────────┘
                                                  │
                                      ┌───────────▼────────────┐
                                      │ Google Gemini Flash    │
                                      │ (Zero Hallucination)   │
                                      └────────────────────────┘
```

The knowledge base is synthesized from the official curriculum (`base_curriculum.pdf`) via [`seed_data.py`](seed_data.py), producing **171 structured markdown documents** in [`knowledge_base/`](knowledge_base/):
- **24 Examination Schedules** (6 Branches × 4 Years)
- **72 Fee Structures** (6 Branches × 3 Batches × 4 Years)
- **72 Syllabi & Curricula** (6 Branches × 3 Batches × 4 Years)
- **Hostel & Campus Regulations** (Curfews, mess timings, penalties)
- **Academic & Attendance Policies** (75% mandatory attendance, 65%–74% medical condonation, 10-point GPA scale)
- **Placement & Internship Regulations** (6.5 CGPA, tiers: Standard, Dream, Super Dream)

> For full details, see the [Judge & Tester Knowledge Catalog](CAMPUSMIND_KNOWLEDGE_BASE_GUIDE.md).

---

## Tech Stack

- **Frontend:** React 19, Vite 8, Tailwind CSS, Lucide React, Zustand, Framer Motion, React Markdown, Remark GFM
- **Backend:** FastAPI, Python 3.13, SQLAlchemy, SQLite, Pydantic v2, Bcrypt, PyJWT
- **Vector Database:** ChromaDB (Local persistent ONNX embeddings)
- **LLM:** Google Gemini 3.8 Flash (with resilient Gemini 3.x Flash fallback)

---

## Getting Started

### Prerequisites
- **Node.js** (v18 or higher) & **npm**
- **Python** (v3.10 or higher)
- **Google Gemini API Key** (Free tier from [Google AI Studio](https://aistudio.google.com/))

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/rohith-m06/campus-AI.git
cd campus-AI
```

---

### Option A: 1-Click Automated Launch (Recommended)

1. Paste your Gemini API key inside `.env` (copied from `.env.example`).
2. Run the automated launcher:
   - **On Windows**: Double-click **`run_app.bat`** (or type `.\run_app.bat` in terminal).
   - **On macOS / Linux**: Run `chmod +x run_app.sh && ./run_app.sh`.

*This script automatically installs all dependencies, seeds the database and knowledge base, and boots up both the backend and frontend!*

---

### Option B: Step-by-Step Manual Setup
Copy the template `.env.example` files:
```bash
# Root environment file
cp .env.example .env

# Backend environment file
cp backend/.env.example backend/.env
```

Open `.env` (and `backend/.env`) and add your Gemini API key:
```env
GOOGLE_API_KEY=your_actual_gemini_api_key_here
GEMINI_MODEL=gemini-3.8-flash
JWT_SECRET=super_secret_jwt_random_key_12345
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

---

### Step 3: Backend Setup
```bash
# Create and activate virtual environment
python -m venv backend/venv

# Windows:
backend\venv\Scripts\activate
# macOS / Linux:
source backend/venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Generate the synthetic knowledge base (172 documents)
python seed_data.py

# Ingest and index documents into ChromaDB
python ingest_data.py

# Seed official demo student accounts into SQLite
python -m backend.seed_users

# Start the FastAPI backend server
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be live at: `http://127.0.0.1:8000/docs`

---

### Step 4: Frontend Setup
In a new terminal window:
```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```
Open your browser at: `http://localhost:5173/`

---

### Step 5: Run Automated Tests
```bash
# Windows:
backend\venv\Scripts\python.exe tests/test_rag.py
backend\venv\Scripts\python.exe tests/test_e2e.py

# macOS / Linux:
python tests/test_rag.py
python tests/test_e2e.py
```

---

## Testing Personas for Evaluators & Judges

You can register with any profile or use these sample student profiles to test personalization:

| Student Name | Branch & Year | Key Query to Test | Expected Behavior |
| :--- | :--- | :--- | :--- |
| **Kavya Patel** | CSE 2nd Year (Hostel Block A) | *"What are all my exam dates and subjects for this whole year?"* | Returns Odd Sem (Oct 10–15 CAT-1) and Even Sem (March 15–20 CAT-1) with exact 2nd Year subjects (DSA, OS, Web Tech, RDBMS). |
| **Rohan Verma** | ECE 1st Year (Day Scholar) | *"When are my CAT-1 exams and what is the fee?"* | Distinguishes ECE start date (Oct 12 vs CSE Oct 10) and calculates ₹2,10,000 tuition. |
| **Any Student** | Any Branch | *"hi"* or *"how are you?"* | Responds **instantly (<0.06s)** without querying vector database, no source badges. |
| **Any Student** | Any Branch | *"मेरी अटेंडेंस 70% हो गई तो क्या होगा?"* | Fluently explains the 75% rule and medical condonation in Hindi. |

---

## Project Structure

```
campus-AI/
├── .env.example                            # Root environment variable template
├── .gitignore                              # Production git ignore configuration
├── CAMPUSMIND_KNOWLEDGE_BASE_GUIDE.md      # Comprehensive judge & tester guide
├── README.md                               # Project documentation
├── base_curriculum.pdf                     # Source university curriculum
├── seed_data.py                            # Multi-branch synthetic data generator
├── ingest_data.py                          # ChromaDB vector embedding ingester
├── main.py                                 # Root entry point
│
├── backend/
│   ├── .env.example                        # Backend environment template
│   ├── auth.py                             # Password hashing & JWT token handler
│   ├── database.py                         # SQLite engine & session management
│   ├── models.py                           # SQLAlchemy User model
│   ├── schemas.py                          # Pydantic request & response schemas
│   ├── rag_engine.py                       # Smart RAG pipeline & Gemini fallback
│   ├── requirements.txt                    # Python dependencies
│   └── main.py                             # FastAPI routes & endpoints
│
├── frontend/
│   ├── package.json                        # Frontend dependencies & scripts
│   ├── vite.config.js                      # Vite configuration
│   ├── index.html                          # Single-page application template
│   └── src/
│       ├── App.jsx                         # Main router & theme provider
│       ├── index.css                       # Design system & Tailwind utilities
│       ├── pages/
│       │   ├── AuthPage.jsx                # Login / Registration with demo prefill
│       │   └── ChatPage.jsx                # Premium Chat UI with language switcher
│       ├── services/
│       │   └── api.js                      # Axios client with JWT interceptor
│       └── store/
│           └── authStore.js                # Zustand state persistence
│
├── knowledge_base/                         # 171 Generated Institutional Markdown Docs
│   ├── exam_schedule_*.md                  # Branch & Year exam roadmaps
│   ├── fee_structure_*.md                  # Branch, Year & Batch fee tables
│   ├── syllabus_*.md                       # Curriculum & credit distribution
│   ├── academic_policies_and_attendance.md # Attendance & grading regulations
│   ├── hostel_and_campus_rules.md          # Hostel gates, mess timings, rules
│   └── placement_and_internship_policy.md  # Placement eligibility & tiers
│
└── tests/
    ├── test_conversational.py              # Fast small-talk router test
    ├── test_rag.py                         # Branch & year filtering test
    └── test_e2e.py                         # Complete API flow verification test
```

---

## License

Open sourced under the [MIT License](LICENSE).
