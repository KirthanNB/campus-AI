"""
CampusMind AI - Knowledge Base Seed Generator
Reads the real curriculum PDF and programmatically synthesizes variations across:
- Branches: CSE, ECE, MECH, EEE, CIVIL, IT
- Batches: 2022-2026 (4th Year), 2023-2027 (3rd Year), 2024-2028 (1st & 2nd Year)
- Document Types: Syllabus, Fee Structures, Exam Schedules, Hostel Rules, Academic Policies, Placements
"""

import os
import json
from pathlib import Path
import pypdf

BASE_DIR = Path(__file__).resolve().parent
KB_DIR = BASE_DIR / "knowledge_base"
KB_DIR.mkdir(parents=True, exist_ok=True)

# 1. Parse real base curriculum
def extract_base_pdf():
    pdf_candidates = [
        BASE_DIR / "base_curriculum.pdf.pdf",
        BASE_DIR / "base_curriculum.pdf",
        BASE_DIR.parent / "base_curriculum.pdf.pdf",
        BASE_DIR.parent / "base_curriculum.pdf"
    ]
    for p in pdf_candidates:
        if p.exists():
            print(f"[seed_data] Found base curriculum PDF at: {p}")
            reader = pypdf.PdfReader(str(p))
            full_text = "\n".join([page.extract_text() or "" for page in reader.pages])
            return full_text
    print("[seed_data] Warning: Base curriculum PDF not found! Using standard curriculum seed.")
    return ""

base_pdf_text = extract_base_pdf()

# Helper to write structured markdown file with metadata frontmatter
def save_doc(filename: str, metadata: dict, content: str):
    target_path = KB_DIR / filename
    header = "---\n" + json.dumps(metadata, indent=2) + "\n---\n\n"
    target_path.write_text(header + content, encoding="utf-8")
    print(f"  -> Generated: {filename} ({metadata.get('doc_type')}, Branch: {metadata.get('branch')}, Year: {metadata.get('year')})")

print(f"[seed_data] Generating rich multi-branch & multi-batch knowledge base in {KB_DIR}...")

# -------------------------------------------------------------
# 1. SYLLABUS & CURRICULUM DOCUMENTS
# -------------------------------------------------------------

branches_syllabus = {
    "CSE": {
        "name": "Computer Science and Engineering",
        "core_subjects": [
            {"code": "CSE1018", "title": "Object Oriented Programming with Java", "credits": 4, "year": "1st"},
            {"code": "CSE1017", "title": "Programming in C and C++", "credits": 4, "year": "1st"},
            {"code": "CSE2001", "title": "Data Structures and Algorithms", "credits": 4, "year": "2nd"},
            {"code": "CSE2002", "title": "Web Technology", "credits": 3, "year": "2nd"},
            {"code": "CSE2045", "title": "Algorithmic Design and Analysis", "credits": 4, "year": "2nd"},
            {"code": "CSE2046", "title": "Operating Systems with Linux Internals", "credits": 3, "year": "2nd"},
            {"code": "CSE2006", "title": "Communication Networks", "credits": 3, "year": "3rd"},
            {"code": "CSE2007", "title": "Relational Database Management System (RDBMS)", "credits": 3, "year": "2nd"},
            {"code": "CSE2008", "title": "Cloud Computing", "credits": 3, "year": "3rd"},
            {"code": "CSE1035", "title": "Fundamentals of Artificial Intelligence and Machine Learning", "credits": 3, "year": "2nd"},
            {"code": "CSE3003", "title": "Cryptography and Network Security", "credits": 3, "year": "3rd"},
            {"code": "CSE4001", "title": "B.Tech. Capstone Project", "credits": 4, "year": "4th"},
            {"code": "CSE4002", "title": "B.Tech. Industrial Internship", "credits": 6, "year": "4th"}
        ],
        "baskets": [
            "AI & Machine Learning (CSE3010, CSE3011, CSE3015 Natural Language Processing, CSE3013 Deep Neural Networks)",
            "Cyber Security (CSE3021 Ethical Hacking, CSE3022 Intrusion Detection, CSE3026 Blockchain & Web3)",
            "Data Analytics (CSE1008 Statistical Foundations, CSE2025 Predictive Analytics, CSE2028 Big Data)",
            "Full Stack Development (CSE2022 Frontend Engineering, CSE2023 Backend Engineering, CSE2041 NoSQL & RAG, CSE3018 MERN Stack)",
            "DevOps & Cloud (CSE2035 DevOps, CSE2040 CI/CD Pipelines, CSE2079 Containerization with Docker & Kubernetes)"
        ]
    },
    "IT": {
        "name": "Information Technology",
        "core_subjects": [
            {"code": "ITE1001", "title": "Programming Principles with Python & C++", "credits": 4, "year": "1st"},
            {"code": "ITE1004", "title": "Digital Logic and Computer Organization", "credits": 4, "year": "1st"},
            {"code": "ITE2001", "title": "Data Structures and Algorithm Design", "credits": 4, "year": "2nd"},
            {"code": "ITE2003", "title": "Database Systems & Enterprise SQL", "credits": 3, "year": "2nd"},
            {"code": "ITE2008", "title": "Software Engineering & Agile Methodologies", "credits": 3, "year": "2nd"},
            {"code": "ITE3001", "title": "Web Architecture and Microservices", "credits": 3, "year": "3rd"},
            {"code": "ITE3004", "title": "Computer Networks & Distributed Systems", "credits": 3, "year": "3rd"},
            {"code": "ITE3008", "title": "Information Security and Incident Management", "credits": 3, "year": "3rd"},
            {"code": "ITE4001", "title": "IT Capstone Project", "credits": 4, "year": "4th"},
            {"code": "ITE4002", "title": "Enterprise Internship", "credits": 6, "year": "4th"}
        ],
        "baskets": [
            "Enterprise Cloud & Systems (Cloud Infrastructure, Serverless Computing, AWS & Azure Administration)",
            "Full-Stack Web & Mobile (React, Node.js, Flutter, GraphQL, Redis Caching)",
            "Cyber Defence & Auditing (Network Security, Penetration Testing, SOC Operations)",
            "Data Engineering (ETL Pipelines, Apache Spark, Snowflake, Data Warehousing)"
        ]
    },
    "ECE": {
        "name": "Electronics and Communication Engineering",
        "core_subjects": [
            {"code": "ECE1001", "title": "Fundamentals of Electrical and Electronics Engineering", "credits": 4, "year": "1st"},
            {"code": "ECE1002", "title": "Elements of Electronics Engineering & Semiconductor Devices", "credits": 4, "year": "1st"},
            {"code": "ECE2001", "title": "Signals and Linear Systems", "credits": 4, "year": "2nd"},
            {"code": "ECE2003", "title": "Analog Electronics Circuits & Amplifiers", "credits": 3, "year": "2nd"},
            {"code": "ECE2005", "title": "Digital System Design & Verilog HDL", "credits": 4, "year": "2nd"},
            {"code": "ECE2006", "title": "Microprocessors, ARM Microcontrollers and Interfacing", "credits": 4, "year": "2nd"},
            {"code": "ECE3001", "title": "Analog and Digital Communication Systems", "credits": 4, "year": "3rd"},
            {"code": "ECE3004", "title": "Electromagnetic Fields, Waves & Antennas", "credits": 3, "year": "3rd"},
            {"code": "ECE3007", "title": "VLSI Design and CMOS Technology", "credits": 4, "year": "3rd"},
            {"code": "ECE3012", "title": "Digital Signal Processing (DSP) & Architecture", "credits": 3, "year": "3rd"},
            {"code": "ECE4001", "title": "B.Tech. ECE Capstone Project", "credits": 4, "year": "4th"},
            {"code": "ECE4002", "title": "Core Industry Internship", "credits": 6, "year": "4th"}
        ],
        "baskets": [
            "VLSI Design & Chip Technology (FPGA Design, ASIC Architecture, Low Power CMOS)",
            "Embedded Systems & Robotics (ARM Cortex, FreeRTOS, Drone Avionics, ROS)",
            "Wireless & 5G Communications (MIMO, Optical Communication, Satellite Systems, RF Circuit Design)",
            "Edge AI and TinyML (Machine Learning on Embedded Hardware, Computer Vision on Microcontrollers)"
        ]
    },
    "MECH": {
        "name": "Mechanical Engineering",
        "core_subjects": [
            {"code": "MEC1001", "title": "Engineering Graphics and Computer Aided Drafting (CAD)", "credits": 3, "year": "1st"},
            {"code": "MEC1002", "title": "Engineering Mechanics & Workshop Practice", "credits": 4, "year": "1st"},
            {"code": "MEC2001", "title": "Engineering Thermodynamics and Gas Dynamics", "credits": 4, "year": "2nd"},
            {"code": "MEC2003", "title": "Fluid Mechanics and Hydraulic Machinery", "credits": 4, "year": "2nd"},
            {"code": "MEC2005", "title": "Strength of Materials and Solid Mechanics", "credits": 4, "year": "2nd"},
            {"code": "MEC2008", "title": "Manufacturing Processes & Metal Casting", "credits": 3, "year": "2nd"},
            {"code": "MEC3001", "title": "Kinematics and Dynamics of Machinery", "credits": 4, "year": "3rd"},
            {"code": "MEC3004", "title": "Heat and Mass Transfer", "credits": 4, "year": "3rd"},
            {"code": "MEC3007", "title": "Design of Machine Elements & Transmission Systems", "credits": 4, "year": "3rd"},
            {"code": "MEC3011", "title": "CAD/CAM/CAE and Finite Element Analysis (FEA)", "credits": 3, "year": "3rd"},
            {"code": "MEC4001", "title": "Mechanical Engineering Capstone Project", "credits": 4, "year": "4th"},
            {"code": "MEC4002", "title": "Industrial Plant Internship", "credits": 6, "year": "4th"}
        ],
        "baskets": [
            "Thermal & Energy Engineering (Refrigeration & AC, Power Plant Engineering, Electric Vehicle Thermal Management)",
            "Automotive Engineering (Vehicle Dynamics, Hybrid Powertrain, Chassis & Suspension Design)",
            "Robotics & Automation (Hydraulics & Pneumatics, PLC Programming, Industrial Automation)",
            "Smart Manufacturing & 3D Printing (Additive Manufacturing, CNC Machining, Industry 4.0)"
        ]
    },
    "EEE": {
        "name": "Electrical and Electronics Engineering",
        "core_subjects": [
            {"code": "EEE1001", "title": "Electric Circuit Theory & Network Analysis", "credits": 4, "year": "1st"},
            {"code": "EEE1003", "title": "Electromagnetic Field Theory", "credits": 3, "year": "1st"},
            {"code": "EEE2001", "title": "Electrical Machines - I (Transformers & DC Machines)", "credits": 4, "year": "2nd"},
            {"code": "EEE2004", "title": "Analog Electronics & Linear Integrated Circuits", "credits": 4, "year": "2nd"},
            {"code": "EEE2006", "title": "Electrical Machines - II (Induction & Synchronous)", "credits": 4, "year": "2nd"},
            {"code": "EEE3001", "title": "Power System Analysis and Operation", "credits": 4, "year": "3rd"},
            {"code": "EEE3003", "title": "Power Electronics and Drives", "credits": 4, "year": "3rd"},
            {"code": "EEE3005", "title": "Control Systems Engineering & State Variable Analysis", "credits": 4, "year": "3rd"},
            {"code": "EEE3008", "title": "Microcontroller Systems for Power Conversion", "credits": 3, "year": "3rd"},
            {"code": "EEE4001", "title": "EEE Capstone Project", "credits": 4, "year": "4th"},
            {"code": "EEE4002", "title": "Electrical Grid & Industry Internship", "credits": 6, "year": "4th"}
        ],
        "baskets": [
            "Renewable Energy Systems (Solar PV Engineering, Wind Turbine Systems, Grid Integration)",
            "Electric Vehicle Systems (Battery Management Systems, EV Motor Drives, Fast Charging Infrastructure)",
            "Smart Grids & Automation (SCADA, Energy Internet, Microgrid Protection)",
            "High Voltage Engineering (Insulation Technology, Overvoltage Transients, Switchgear)"
        ]
    },
    "CIVIL": {
        "name": "Civil Engineering",
        "core_subjects": [
            {"code": "CIV1001", "title": "Engineering Mechanics and Building Materials", "credits": 4, "year": "1st"},
            {"code": "CIV1003", "title": "Surveying & Geomatics Engineering", "credits": 4, "year": "1st"},
            {"code": "CIV2001", "title": "Mechanics of Solids & Deformable Bodies", "credits": 4, "year": "2nd"},
            {"code": "CIV2003", "title": "Fluid Mechanics and Open Channel Flow", "credits": 4, "year": "2nd"},
            {"code": "CIV2005", "title": "Structural Analysis - I (Indeterminate Structures)", "credits": 4, "year": "2nd"},
            {"code": "CIV2008", "title": "Concrete Technology & Building Construction Practice", "credits": 3, "year": "2nd"},
            {"code": "CIV3001", "title": "Design of Reinforced Concrete Structures (RCC)", "credits": 4, "year": "3rd"},
            {"code": "CIV3004", "title": "Geotechnical Engineering & Soil Mechanics", "credits": 4, "year": "3rd"},
            {"code": "CIV3007", "title": "Transportation & Highway Engineering", "credits": 4, "year": "3rd"},
            {"code": "CIV3009", "title": "Water Resources & Environmental Engineering", "credits": 3, "year": "3rd"},
            {"code": "CIV4001", "title": "Civil Engineering Capstone Project", "credits": 4, "year": "4th"},
            {"code": "CIV4002", "title": "Site Construction Internship", "credits": 6, "year": "4th"}
        ],
        "baskets": [
            "Structural Engineering (Earthquake Resistant Design, Steel Structures, Prestressed Concrete)",
            "Environmental & Water Resources (Water Treatment Plant Design, Urban Hydrology, GIS)",
            "Smart Infrastructure (BIM - Building Information Modeling, Green Building, Smart Cities)",
            "Geotechnical & Foundation Engineering (Deep Foundations, Slope Stability, Soil Dynamics)"
        ]
    }
}

batches_info = {
    "2024-2028": {
        "curriculum_version": "v1.0 (AY2024-25 onwards)",
        "min_credits": 160,
        "school_core_credits": 58,
        "program_core_credits": 42,
        "discipline_elective_credits": 42,
        "open_elective_credits": 18,
        "batches_notes": "Implemented AI-integrated curriculum with mandatory RAG, Python Basket, and Cloud computing."
    },
    "2023-2027": {
        "curriculum_version": "v2.1 (AY2023-24 revision)",
        "min_credits": 164,
        "school_core_credits": 60,
        "program_core_credits": 44,
        "discipline_elective_credits": 42,
        "open_elective_credits": 18,
        "batches_notes": "Includes mandatory Industry 4.0 basket and micro-credential certification."
    },
    "2022-2026": {
        "curriculum_version": "v2.0 (AY2022-23 standard)",
        "min_credits": 168,
        "school_core_credits": 62,
        "program_core_credits": 46,
        "discipline_elective_credits": 42,
        "open_elective_credits": 18,
        "batches_notes": "Senior graduating batch. Final year dedicated to 8th Semester Industry Internship & Major Capstone."
    }
}

# Generate Syllabus docs
for branch, bdata in branches_syllabus.items():
    for batch, batinfo in batches_info.items():
        # Identify corresponding current year for typical student of this batch
        # AY 2026: 2024 batch is 2nd/3rd year, 2023 batch is 3rd/4th, 2022 batch is 4th
        # To be comprehensive, we create documents covering each year explicitly
        for yr in ["1st", "2nd", "3rd", "4th"]:
            subjects_in_year = [s for s in bdata["core_subjects"] if s["year"] == yr]
            filename = f"syllabus_{branch}_{batch.replace('-', '_')}_{yr}yr.md"
            meta = {
                "title": f"{branch} {yr} Year Syllabus ({batch} Batch)",
                "branch": branch,
                "batch": batch,
                "year": yr,
                "doc_type": "syllabus",
                "applicable_to": branch
            }
            
            content = f"""# Department of {bdata['name']} ({branch})
## Curriculum & Syllabus - Year: {yr} Year | Batch: {batch}
**Curriculum Version:** {batinfo['curriculum_version']}
**Total Degree Minimum Credits:** {batinfo['min_credits']} Credits
**Year Focus:** {yr} Year Core & Professional Foundations

### Mandatory Core Subjects for {yr} Year {branch}:
"""
            if subjects_in_year:
                for s in subjects_in_year:
                    content += f"- **{s['code']}: {s['title']}** | Credits: {s['credits']} | Status: Mandatory Core\n"
            else:
                content += f"- General Departmental Core Electives, Department Seminar, and Project Work.\n"

            content += f"""
### Specialization Elective Baskets Available for {branch}:
Students must earn specialized elective credits from the following official departmental baskets:
"""
            for b in bdata["baskets"]:
                content += f"- {b}\n"

            content += f"""
### Degree Completion Credit Breakdown ({batch} Scheme):
- School Core Basket: {batinfo['school_core_credits']} credits
- Program Core Basket: {batinfo['program_core_credits']} credits
- Discipline & Specialized Electives: {batinfo['discipline_elective_credits']} credits
- Open Electives: {batinfo['open_elective_credits']} credits
- Total Minimum Credits to Graduate: {batinfo['min_credits']} credits

### Regulations & Special Instructions:
- Minimum 75% attendance in theory and laboratory classes is strictly required to be eligible for end-semester examinations.
- Non-credit mandatory courses include Environmental Studies (CHE1001) and Co-/Extra-curricular Activities (CEA1001).
- For {batch} batch, Capstone Project Phase-1 begins in the 7th Semester and Capstone Phase-2 / Full-time Internship is in the 8th Semester.
"""
            save_doc(filename, meta, content)


# -------------------------------------------------------------
# 2. FEE STRUCTURE DOCUMENTS
# -------------------------------------------------------------

fees_by_branch = {
    "CSE": {"tuition": 185000, "lab": 20000, "library": 5000, "tech_fee": 12000},
    "IT":  {"tuition": 180000, "lab": 18000, "library": 5000, "tech_fee": 10000},
    "ECE": {"tuition": 170000, "lab": 18000, "library": 5000, "tech_fee": 9000},
    "EEE": {"tuition": 160000, "lab": 16000, "library": 5000, "tech_fee": 8000},
    "MECH":{"tuition": 145000, "lab": 18000, "library": 5000, "tech_fee": 7000},
    "CIVIL":{"tuition": 140000, "lab": 15000, "library": 5000, "tech_fee": 7000},
}

for branch, fmeta in fees_by_branch.items():
    for yr in ["1st", "2nd", "3rd", "4th"]:
        for batch in ["2024-2028", "2023-2027", "2022-2026"]:
            filename = f"fee_structure_{branch}_{batch.replace('-', '_')}_{yr}yr.md"
            meta = {
                "title": f"Fee Structure - {branch} {yr} Year ({batch} Batch)",
                "branch": branch,
                "batch": batch,
                "year": yr,
                "doc_type": "fees",
                "applicable_to": branch
            }
            
            # Additional year fees
            admission_fee = 25000 if yr == "1st" else 0
            capstone_convocation_fee = 14000 if yr == "4th" else 0
            exam_fee = 3000 * 2  # 2 semesters
            total_academic_fee = fmeta["tuition"] + fmeta["lab"] + fmeta["library"] + fmeta["tech_fee"] + admission_fee + capstone_convocation_fee + exam_fee

            content = f"""# Official Academic Fee Structure
## Branch: {branch} ({branches_syllabus[branch]['name']}) | Year: {yr} Year
**Batch:** {batch} | **Academic Year:** 2026-2027

### Annual Tuition & Academic Fees Breakdown:
| Fee Component | Amount (INR) | Payment Due Date | Notes |
| :--- | :--- | :--- | :--- |
| **Annual Tuition Fee** | ₹{fmeta['tuition']:,} | Odd Sem: Aug 10 / Even Sem: Jan 10 | Payable in two equal semester installments |
| **Laboratory & Practical Consumables** | ₹{fmeta['lab']:,} | August 10 | Specialized branch hardware & software licenses |
| **Digital Library & E-Journals Access** | ₹{fmeta['library']:,} | August 10 | IEEE Xplore, ACM, ScienceDirect access |
| **Technology & Cloud Infrastructure Fee** | ₹{fmeta['tech_fee']:,} | August 10 | High-performance computing lab & campus Wi-Fi |
| **Semester Examination Fee (2 Semesters)**| ₹{exam_fee:,} | ₹3,000 per semester before exam form deadline |
"""
            if admission_fee > 0:
                content += f"| **One-time Institutional Admission & Caution Deposit** | ₹{admission_fee:,} | At time of admission (₹10,000 refundable) |\n"
            if capstone_convocation_fee > 0:
                content += f"| **Final Year Capstone Project Evaluation & Convocation Fee** | ₹{capstone_convocation_fee:,} | Dec 15 (Final Year special fee) | Degree parchment & alumni registration |\n"

            content += f"""
### Total Academic Fee for {yr} Year {branch}:
- **Total Payable (Academic): ₹{total_academic_fee:,}**

### Hostel Accommodation & Dining Fees (If Applicable):
- **Hostel Block A (Non-AC Standard, 3-Sharing):**
  - Room Rent & Electricity: ₹48,000 per academic year
  - Mess charges (4 meals/day, vegetarian & non-veg options): ₹38,000 per academic year
  - Total Hostel Block A: **₹86,000 / year**
- **Hostel Block B (Deluxe AC, 2-Sharing with Attached Bathroom):**
  - Room Rent & Electricity: ₹72,000 per academic year
  - Mess charges: ₹38,000 per academic year
  - Total Hostel Block B: **₹1,10,000 / year**
- **Day Scholar Charges:**
  - Day scholars pay no hostel fees. Optional college bus transport pass is ₹22,000/year covering all city routes.

### Payment Guidelines & Penalties:
- Late payment attracts a penalty of ₹500 for the first 15 days, and ₹100 per day thereafter.
- Failure to clear dues before the exam registration deadline results in withholding of admit cards.
- Online payments are accepted through the Student ERP portal via UPI, Net Banking, and Credit Card.
"""
            save_doc(filename, meta, content)


# -------------------------------------------------------------
# 3. EXAM SCHEDULES & DEADLINES
# -------------------------------------------------------------

exam_dates_by_branch = {
    "CSE": {
        "int1_start": "October 10, 2026", "int1_end": "October 15, 2026",
        "int2_start": "November 20, 2026", "int2_end": "November 25, 2026",
        "endsem_start": "December 12, 2026", "endsem_end": "December 24, 2026",
        "lab_exam": "December 01 - December 07, 2026",
        "form_deadline": "September 30, 2026",
        "late_form_deadline": "October 05, 2026 (with ₹500 late fee)"
    },
    "IT": {
        "int1_start": "October 11, 2026", "int1_end": "October 16, 2026",
        "int2_start": "November 21, 2026", "int2_end": "November 26, 2026",
        "endsem_start": "December 13, 2026", "endsem_end": "December 26, 2026",
        "lab_exam": "December 02 - December 08, 2026",
        "form_deadline": "October 01, 2026",
        "late_form_deadline": "October 06, 2026 (with ₹500 late fee)"
    },
    "ECE": {
        "int1_start": "October 12, 2026", "int1_end": "October 17, 2026",
        "int2_start": "November 22, 2026", "int2_end": "November 27, 2026",
        "endsem_start": "December 14, 2026", "endsem_end": "December 27, 2026",
        "lab_exam": "December 03 - December 09, 2026",
        "form_deadline": "October 02, 2026",
        "late_form_deadline": "October 07, 2026 (with ₹500 late fee)"
    },
    "EEE": {
        "int1_start": "October 14, 2026", "int1_end": "October 19, 2026",
        "int2_start": "November 24, 2026", "int2_end": "November 29, 2026",
        "endsem_start": "December 16, 2026", "endsem_end": "December 28, 2026",
        "lab_exam": "December 04 - December 10, 2026",
        "form_deadline": "October 03, 2026",
        "late_form_deadline": "October 08, 2026 (with ₹500 late fee)"
    },
    "MECH": {
        "int1_start": "October 15, 2026", "int1_end": "October 20, 2026",
        "int2_start": "November 25, 2026", "int2_end": "November 30, 2026",
        "endsem_start": "December 17, 2026", "endsem_end": "December 29, 2026",
        "lab_exam": "December 05 - December 11, 2026",
        "form_deadline": "October 04, 2026",
        "late_form_deadline": "October 09, 2026 (with ₹500 late fee)"
    },
    "CIVIL": {
        "int1_start": "October 16, 2026", "int1_end": "October 21, 2026",
        "int2_start": "November 26, 2026", "int2_end": "December 01, 2026",
        "endsem_start": "December 18, 2026", "endsem_end": "December 30, 2026",
        "lab_exam": "December 06 - December 12, 2026",
        "form_deadline": "October 05, 2026",
        "late_form_deadline": "October 10, 2026 (with ₹500 late fee)"
    }
}

# Detailed subject mapping per branch, year, and semester for full-year exam timetables
semester_subjects_map = {
    "CSE": {
        "1st": {
            "odd": [("Day 1", "CSE1017: Programming in C and C++"), ("Day 2", "MAT1001: Linear Algebra and Calculus"), ("Day 3", "PHY1001: Physics of Opto-electronic Devices"), ("Day 4", "ENG1002: Communicative English")],
            "even": [("Day 1", "CSE1018: Object Oriented Programming with Java"), ("Day 2", "MAT1002: Differential Equations"), ("Day 3", "ECE1001: Fundamentals of Electrical Engineering"), ("Day 4", "CSE1005: Programming in Python")]
        },
        "2nd": {
            "odd": [("Day 1", "CSE2001: Data Structures and Algorithms"), ("Day 2", "CSE2002: Web Technology"), ("Day 3", "MAT2002: Discrete Mathematics"), ("Day 4", "ECE2006: Computer Architecture and Organization")],
            "even": [("Day 1", "CSE2045: Algorithmic Design and Analysis"), ("Day 2", "CSE2046: Operating Systems with Linux Internals"), ("Day 3", "CSE2007: Relational Database Management Systems"), ("Day 4", "CSE1035: Fundamentals of AI & ML")]
        },
        "3rd": {
            "odd": [("Day 1", "CSE2006: Communication Networks"), ("Day 2", "CSE2008: Cloud Computing"), ("Day 3", "CSE3003: Cryptography and Network Security"), ("Day 4", "CSE2009: Data Analytics and Visualization")],
            "even": [("Day 1", "CSE3010: AI & Machine Learning Applications"), ("Day 2", "CSE3021: Ethical Hacking & Cyber Defence"), ("Day 3", "CSE2022: Full Stack Engineering"), ("Day 4", "CSE2035: DevOps and Continuous Integration")]
        },
        "4th": {
            "odd": [("Day 1", "CSE4001: Capstone Project Phase-1 Evaluation"), ("Day 2", "CSE4005: Industrial Applications of AI"), ("Day 3", "CSE4003: Industrial Cloud Architecture"), ("Day 4", "Open Elective: Technical Management")],
            "even": [("Day 1", "CSE4002: Full-Time Industrial Internship Viva"), ("Day 2", "CSE4008: Major Capstone Defense & Project Presentation")]
        }
    },
    "IT": {
        "1st": {
            "odd": [("Day 1", "ITE1001: Programming with Python"), ("Day 2", "MAT1001: Linear Algebra"), ("Day 3", "PHY1001: Applied Physics"), ("Day 4", "ENG1002: Communicative English")],
            "even": [("Day 1", "ITE1004: Digital Logic & Computer Systems"), ("Day 2", "MAT1002: Differential Equations"), ("Day 3", "ITE1002: Object Oriented C++"), ("Day 4", "ITE1003: Web Fundamentals")]
        },
        "2nd": {
            "odd": [("Day 1", "ITE2001: Data Structures and Algorithm Design"), ("Day 2", "ITE2003: Database Systems & Enterprise SQL"), ("Day 3", "MAT2002: Discrete Mathematics"), ("Day 4", "ITE2005: Computer Networks")],
            "even": [("Day 1", "ITE2008: Software Engineering & Agile"), ("Day 2", "ITE2010: Linux System Administration"), ("Day 3", "ITE2012: Web Architecture & APIs"), ("Day 4", "ITE2015: Information Security")]
        },
        "3rd": {
            "odd": [("Day 1", "ITE3001: Web Architecture and Microservices"), ("Day 2", "ITE3004: Distributed Systems"), ("Day 3", "ITE3008: Information Security & Incident Response"), ("Day 4", "ITE3012: Cloud Systems Administration")],
            "even": [("Day 1", "ITE3015: Mobile App Development (Flutter)"), ("Day 2", "ITE3018: Big Data Engineering"), ("Day 3", "ITE3020: DevOps & Automated Deployment"), ("Day 4", "ITE3025: Enterprise Cybersecurity")]
        },
        "4th": {
            "odd": [("Day 1", "ITE4001: IT Capstone Project Phase-1"), ("Day 2", "ITE4005: Enterprise Cloud Solutions"), ("Day 3", "Open Elective: IT Governance")],
            "even": [("Day 1", "ITE4002: Full-Semester Enterprise Internship Defense")]
        }
    },
    "ECE": {
        "1st": {
            "odd": [("Day 1", "ECE1001: Fundamentals of Electrical Engineering"), ("Day 2", "MAT1001: Calculus and Matrices"), ("Day 3", "PHY1002: Semiconductor Physics"), ("Day 4", "ENG1002: Professional English")],
            "even": [("Day 1", "ECE1002: Elements of Electronics Engineering"), ("Day 2", "MAT1002: Differential Equations & Transforms"), ("Day 3", "CSE1017: Programming in C++"), ("Day 4", "ECE1008: Innovation Project with Arduino")]
        },
        "2nd": {
            "odd": [("Day 1", "ECE2001: Signals and Linear Systems"), ("Day 2", "ECE2003: Analog Electronics Circuits"), ("Day 3", "ECE2005: Digital System Design with Verilog"), ("Day 4", "MAT2001: Complex Variables")],
            "even": [("Day 1", "ECE2006: Microprocessors & ARM Microcontrollers"), ("Day 2", "ECE2008: Analog Communication Systems"), ("Day 3", "ECE2010: Transmission Lines and Waveguides"), ("Day 4", "ECE2012: Electronic Measurements")]
        },
        "3rd": {
            "odd": [("Day 1", "ECE3001: Digital Communication Systems"), ("Day 2", "ECE3004: Electromagnetic Fields & Antennas"), ("Day 3", "ECE3007: VLSI Design and CMOS Technology"), ("Day 4", "ECE3012: Digital Signal Processing (DSP)")],
            "even": [("Day 1", "ECE3015: Embedded Systems & RTOS"), ("Day 2", "ECE3018: Wireless & 5G Communications"), ("Day 3", "ECE3020: Optical Fiber Communications"), ("Day 4", "ECE3025: Microwave Integrated Circuits")]
        },
        "4th": {
            "odd": [("Day 1", "ECE4001: Capstone Design Project Phase-1"), ("Day 2", "ECE4005: Satellite Communication"), ("Day 3", "ECE4008: ASIC Architecture")],
            "even": [("Day 1", "ECE4002: Core Industrial Internship Defense")]
        }
    },
    "MECH": {
        "1st": {
            "odd": [("Day 1", "MEC1001: Engineering Graphics and CAD"), ("Day 2", "MAT1001: Linear Algebra & Calculus"), ("Day 3", "PHY1001: Engineering Physics"), ("Day 4", "ENG1002: Technical English")],
            "even": [("Day 1", "MEC1002: Engineering Mechanics & Workshop"), ("Day 2", "MAT1002: Ordinary Differential Equations"), ("Day 3", "CSE1017: Computer Programming in C"), ("Day 4", "CHE1001: Chemistry of Engineering Materials")]
        },
        "2nd": {
            "odd": [("Day 1", "MEC2001: Engineering Thermodynamics"), ("Day 2", "MEC2003: Fluid Mechanics and Hydraulic Machinery"), ("Day 3", "MEC2005: Strength of Materials"), ("Day 4", "MAT2002: Numerical Techniques")],
            "even": [("Day 1", "MEC2008: Manufacturing Technology & Metal Casting"), ("Day 2", "MEC2010: Applied Gas Dynamics"), ("Day 3", "MEC2012: Kinematics of Machinery"), ("Day 4", "MEC2015: Material Science and Metallurgy")]
        },
        "3rd": {
            "odd": [("Day 1", "MEC3001: Dynamics of Machinery"), ("Day 2", "MEC3004: Heat and Mass Transfer"), ("Day 3", "MEC3007: Design of Machine Elements"), ("Day 4", "MEC3011: CAD/CAM/CAE & FEA Simulation")],
            "even": [("Day 1", "MEC3015: Design of Transmission Systems"), ("Day 2", "MEC3018: Automobile Engineering & Hybrid Vehicles"), ("Day 3", "MEC3020: Refrigeration and Air Conditioning"), ("Day 4", "MEC3025: Robotics and Industrial Automation")]
        },
        "4th": {
            "odd": [("Day 1", "MEC4001: Mechanical Capstone Project Phase-1"), ("Day 2", "MEC4005: Power Plant Engineering"), ("Day 3", "MEC4008: Additive Manufacturing and 3D Printing")],
            "even": [("Day 1", "MEC4002: Industrial Plant Internship Presentation")]
        }
    },
    "EEE": {
        "1st": {
            "odd": [("Day 1", "EEE1001: Electric Circuit Theory"), ("Day 2", "MAT1001: Calculus and Linear Algebra"), ("Day 3", "PHY1001: Physics for Electrical Sciences"), ("Day 4", "ENG1002: Communicative English")],
            "even": [("Day 1", "EEE1003: Electromagnetic Field Theory"), ("Day 2", "MAT1002: Differential Equations"), ("Day 3", "CSE1017: Programming with C++"), ("Day 4", "ECE1001: Analog Electronics")]
        },
        "2nd": {
            "odd": [("Day 1", "EEE2001: Electrical Machines - I (Transformers & DC)"), ("Day 2", "EEE2004: Analog Electronics & Linear ICs"), ("Day 3", "EEE2005: Network Analysis and Synthesis"), ("Day 4", "MAT2001: Complex Analysis")],
            "even": [("Day 1", "EEE2006: Electrical Machines - II (Induction & AC)"), ("Day 2", "EEE2008: Digital Logic Design"), ("Day 3", "EEE2010: Generation and Transmission of Electrical Power"), ("Day 4", "EEE2012: Electrical Measurements and Instrumentation")]
        },
        "3rd": {
            "odd": [("Day 1", "EEE3001: Power System Analysis & Load Flow"), ("Day 2", "EEE3003: Power Electronics and Motor Drives"), ("Day 3", "EEE3005: Control Systems Engineering"), ("Day 4", "EEE3008: Microcontrollers for Power Systems")],
            "even": [("Day 1", "EEE3012: Power System Protection and Switchgear"), ("Day 2", "EEE3015: Renewable Energy & Solar PV Systems"), ("Day 3", "EEE3018: Electric Vehicle Systems & BMS"), ("Day 4", "EEE3022: Smart Grids and SCADA Automation")]
        },
        "4th": {
            "odd": [("Day 1", "EEE4001: EEE Capstone Project Phase-1"), ("Day 2", "EEE4005: High Voltage Engineering"), ("Day 3", "EEE4008: Power Quality Management")],
            "even": [("Day 1", "EEE4002: Electrical Grid Industry Internship Viva")]
        }
    },
    "CIVIL": {
        "1st": {
            "odd": [("Day 1", "CIV1001: Engineering Mechanics and Building Materials"), ("Day 2", "MAT1001: Linear Algebra & Calculus"), ("Day 3", "PHY1001: Applied Physics"), ("Day 4", "ENG1002: English Communication")],
            "even": [("Day 1", "CIV1003: Surveying & Geomatics Engineering"), ("Day 2", "MAT1002: Differential Equations"), ("Day 3", "MEC1001: Engineering Drawing and CAD"), ("Day 4", "CHE1001: Environmental Chemistry")]
        },
        "2nd": {
            "odd": [("Day 1", "CIV2001: Mechanics of Solids & Structures"), ("Day 2", "CIV2003: Fluid Mechanics and Open Channels"), ("Day 3", "CIV2005: Structural Analysis - I"), ("Day 4", "MAT2002: Numerical Methods")],
            "even": [("Day 1", "CIV2008: Concrete Technology & Construction Practice"), ("Day 2", "CIV2010: Structural Analysis - II (Matrix Methods)"), ("Day 3", "CIV2012: Advanced Surveying & Total Station"), ("Day 4", "CIV2015: Engineering Geology & Rock Mechanics")]
        },
        "3rd": {
            "odd": [("Day 1", "CIV3001: Design of Reinforced Concrete Structures (RCC)"), ("Day 2", "CIV3004: Geotechnical Engineering & Soil Mechanics"), ("Day 3", "CIV3007: Transportation and Highway Engineering"), ("Day 4", "CIV3009: Water Resources & Hydrology")],
            "even": [("Day 1", "CIV3012: Design of Steel Structures"), ("Day 2", "CIV3015: Foundation Engineering & Deep Foundations"), ("Day 3", "CIV3018: Environmental Engineering & Sewage Treatment"), ("Day 4", "CIV3022: Estimation, Costing and Project Valuation")]
        },
        "4th": {
            "odd": [("Day 1", "CIV4001: Civil Capstone Project Phase-1"), ("Day 2", "CIV4005: Earthquake Resistant Design of Structures"), ("Day 3", "CIV4008: Building Information Modeling (BIM)")],
            "even": [("Day 1", "CIV4002: Site Construction Internship Defense")]
        }
    }
}

for branch, edates in exam_dates_by_branch.items():
    for yr in ["1st", "2nd", "3rd", "4th"]:
        filename = f"exam_schedule_{branch}_{yr}yr_2026.md"
        meta = {
            "title": f"Complete Academic Year Examination Roadmap & Timetable - {branch} {yr} Year (AY 2026-2027)",
            "branch": branch,
            "year": yr,
            "doc_type": "exams",
            "applicable_to": branch
        }

        subj_data = semester_subjects_map.get(branch, {}).get(yr, {})
        odd_subjects = subj_data.get("odd", [])
        even_subjects = subj_data.get("even", [])

        # Build subject rows for odd and even semesters
        odd_table = ""
        for day, subj in odd_subjects:
            odd_table += f"| {day} | {subj} | Forenoon: 09:30 AM - 11:30 AM |\n"

        even_table = ""
        for day, subj in even_subjects:
            even_table += f"| {day} | {subj} | Forenoon: 09:30 AM - 11:30 AM |\n"

        content = f"""# Controller of Examinations — Comprehensive Full Year Exam Roadmap
## Department of {branches_syllabus[branch]['name']} ({branch})
**Academic Year:** 2026-2027 | **Current Year:** {yr} Year | **Branch:** {branch}

This official document covers the **COMPLETE examination timetable for the entire academic year (both Odd and Even Semesters)**, including Continuous Assessment Tests (CAT-1, CAT-2), Practical Lab Exams, and Semester End Examinations with exact subject allocations.

---

### PART 1: ODD SEMESTER (Fall / Autumn Session — July to December 2026)

#### 1. Odd Semester Major Milestones:
| Exam Event | Dates | Timings |
| :--- | :--- | :--- |
| **Continuous Assessment Test 1 (CAT-1 / Internal 1)** | **{edates['int1_start']} to {edates['int1_end']}** | Forenoon: 09:30 AM – 11:30 AM |
| **Continuous Assessment Test 2 (CAT-2 / Internal 2)** | **{edates['int2_start']} to {edates['int2_end']}** | Forenoon: 09:30 AM – 11:30 AM |
| **Practical & Laboratory End-Semester Exams** | **{edates['lab_exam']}** | Slot 1: 09:00 AM / Slot 2: 01:30 PM |
| **Semester End Theory Examinations (FAT / Final Exams)** | **{edates['endsem_start']} to {edates['endsem_end']}** | Forenoon: 10:00 AM – 01:00 PM |

#### 2. Odd Semester Subject-by-Subject Exam Schedule:
| Exam Day | Registered Subject Code & Title | Exam Session |
| :--- | :--- | :--- |
{odd_table}

- **Exam Registration Deadline (Odd Sem):** {edates['form_deadline']}
- **Late Registration Deadline (Odd Sem with ₹500 fee):** {edates['late_form_deadline']}

---

### PART 2: EVEN SEMESTER (Spring / Summer Session — January to June 2027)

#### 1. Even Semester Major Milestones:
| Exam Event | Dates | Timings |
| :--- | :--- | :--- |
| **Continuous Assessment Test 1 (CAT-1 / Spring Internal 1)** | **March 15, 2027 to March 20, 2027** | Forenoon: 09:30 AM – 11:30 AM |
| **Continuous Assessment Test 2 (CAT-2 / Spring Internal 2)** | **April 26, 2027 to May 01, 2027** | Forenoon: 09:30 AM – 11:30 AM |
| **Practical & Laboratory End-Semester Exams** | **May 10, 2027 to May 16, 2027** | Slot 1: 09:00 AM / Slot 2: 01:30 PM |
| **Semester End Theory Examinations (Spring FAT / Finals)** | **May 24, 2027 to June 05, 2027** | Forenoon: 10:00 AM – 01:00 PM |

#### 2. Even Semester Subject-by-Subject Exam Schedule:
| Exam Day | Registered Subject Code & Title | Exam Session |
| :--- | :--- | :--- |
{even_table}

- **Exam Registration Deadline (Even Sem):** February 25, 2027
- **Late Registration Deadline (Even Sem with ₹500 fee):** March 05, 2027

---

### Mandatory Examination Regulations:
1. **Attendance Requirement:** Minimum 75% attendance in theory and practical sessions is strictly required. Below 75% disqualifies entry without medical condonation.
2. **Admit Cards:** Hall tickets are released on the ERP portal 48 hours prior to the first examination date.
3. **Materials Prohibited:** Mobile phones, smart watches, and unauthorized material are strictly prohibited.
"""
        save_doc(filename, meta, content)



# -------------------------------------------------------------
# 4. HOSTEL RULES, DINING & CAMPUS REGULATIONS (Applicable to ALL)
# -------------------------------------------------------------

hostel_doc = """# Campus Residential Life & Hostel Regulations
## Official Code of Conduct for Hostel Block A & Block B Residents
**Applicable To:** All Students (Hostel Block A, Hostel Block B, and Day Scholars)
**Document Category:** Hostel Guidelines & Campus Rules

### 1. Hostel Gate Timings & Curfew:
- **Hostel Block In-Time (All Residents):** 10:00 PM strictly on weekdays (Monday to Friday).
- **Weekend In-Time:** 10:30 PM on Saturdays and Sundays.
- **Late Entry Rule:** Entry after curfew requires biometric logging and written approval from the Chief Warden. More than two late entries in a month attracts a penalty of ₹500 and parental notification.
- **Day Scholar Campus Access:** Day Scholars must vacate campus premises by 09:30 PM unless holding special written permission for cultural festivals, academic workshops, or lab project work.

### 2. Dining Hall / Mess Schedule:
Meals are served in both Block A and Block B dining halls during the following operational windows:
- **Breakfast:** 07:30 AM – 09:15 AM (Healthy Indian & Continental options, milk, eggs, fruits)
- **Lunch:** 12:15 PM – 02:00 PM (Unlimited rice, rotis, 2 curries, dal, sambar, curd, salad)
- **Evening High Tea & Snacks:** 05:00 PM – 06:15 PM (Hot tea, coffee, seasonal snacks/samosas)
- **Dinner:** 07:30 PM – 09:30 PM (Nutritious menu, non-veg served on Wednesdays and Sundays)
- *Note:* Food parceling from the dining hall to hostel rooms is strictly prohibited except in certified cases of illness.

### 3. Hostel Facilities & Room Maintenance:
- **Wi-Fi Access:** High-speed campus Wi-Fi (up to 100 Mbps per student) is active 24/7.
- **Laundry Service:** Automated laundry tokens available in basement; 30 wash cycles per semester included in hostel fee.
- **Gymnasium & Indoor Sports:** Open 06:00 AM - 08:30 AM and 04:30 PM - 08:30 PM in the Sports Complex.
- **Silent Study Hours:** 10:30 PM to 06:00 AM daily. Loud music or noisy gatherings during this period are subject to disciplinary warning.

### 4. Visitor Policy:
- Parents and registered local guardians may visit residents between 04:00 PM and 07:30 PM in the designated Visitors Lounge in Block A or Block B lobby.
- Overnight stay of external guests in student hostel rooms is strictly prohibited. Guest rooms can be booked in the Campus Guest House at ₹1,200/night subject to advance booking.
"""
save_doc("hostel_and_campus_rules.md", {
    "title": "Campus Residential Life & Hostel Regulations",
    "branch": "all",
    "year": "all",
    "batch": "all",
    "doc_type": "hostel",
    "applicable_to": "all"
}, hostel_doc)


# -------------------------------------------------------------
# 5. ACADEMIC POLICIES, ATTENDANCE & GRADING (Applicable to ALL)
# -------------------------------------------------------------

academic_doc = """# University Academic Regulations & Evaluation Policies
## Comprehensive Guidelines on Attendance, Grading, and Examinations
**Applicable To:** All Students (All Branches and Batches)
**Document Category:** Academic Policy Manual

### 1. Mandatory Attendance Policy:
- **Minimum 75% Attendance Requirement:** Every student must maintain at least 75% physical attendance in each registered theory and laboratory course.
- **Medical Condonation (65% to 74% Attendance):**
  - If a student has between 65% and 74% attendance due to documented medical hospitalization or bereavement, they may apply for condonation.
  - A condonation application along with a registered medical practitioner's certificate must be submitted to the Office of the Dean of Academic Affairs within 3 working days of resumption of classes.
  - An administrative condonation processing fee of ₹1,000 per subject applies upon approval.
- **Detainment (<65% Attendance):** Students with attendance under 65% are categorically not eligible for condonation and are awarded an 'NC' (Not Cleared / Detained) grade. They must re-register for the course in the supplementary or subsequent regular semester.

### 2. Grading System & CGPA Calculation:
The university follows a 10-point absolute and relative grading scale:
| Grade | Grade Point | Performance Level | Description |
| :--- | :--- | :--- | :--- |
| **S** | 10 | Outstanding | Top 5-10% of class or >= 90% marks |
| **A** | 9 | Excellent | 80% - 89% marks |
| **B** | 8 | Very Good | 70% - 79% marks |
| **C** | 7 | Good | 60% - 69% marks |
| **D** | 6 | Satisfactory / Average | 50% - 59% marks |
| **E** | 5 | Marginal Pass | 40% - 49% marks |
| **F** | 0 | Fail | < 40% marks (requires arrear exam) |
| **I** | 0 | Incomplete | Incomplete due to medical/authorized absence |

- **CGPA Requirement for Graduation:** A student must secure a minimum cumulative CGPA of 5.0 out of 10.0 to be awarded the B.Tech degree.

### 3. Library Timings and Borrowing Privileges:
- Central Library Hours: 08:00 AM to 11:00 PM on working days.
- 24/7 Extended Reading Hall: Operational continuously during examination weeks.
- Undergraduate students may borrow up to 4 books for 14 days, with one renewal permitted online.
"""
save_doc("academic_policies_and_attendance.md", {
    "title": "University Academic Regulations & Attendance Policy",
    "branch": "all",
    "year": "all",
    "batch": "all",
    "doc_type": "policy",
    "applicable_to": "all"
}, academic_doc)


# -------------------------------------------------------------
# 6. PLACEMENT & INTERNSHIP GUIDELINES (Applicable to 3rd & 4th Year / All)
# -------------------------------------------------------------

placement_doc = """# Career Development & Campus Placement Policy
## Eligibility Criteria, Internship Norms, and Placement Drives (2026)
**Applicable To:** 3rd Year and 4th Year Students (All Branches)
**Document Category:** Placement & Career Guidelines

### 1. Placement Eligibility Criteria:
- **General Eligibility:** Minimum CGPA of 6.0 with no active standing backlogs at the time of the recruitment drive.
- **Tier 1 / Product Companies (Dream Offer: CTC >= ₹10 LPA):** Minimum CGPA of 7.5 or above with strong competitive programming and system design track record.
- **Super Dream Companies (CTC >= ₹18 LPA):** Minimum CGPA of 8.5, zero historical backlogs, and demonstrated project/technical achievements.
- **One Student - One Offer Policy:** Once a student receives a Dream offer (>= ₹10 LPA), they are eligible to apply only for Super Dream categories.

### 2. Capstone Project & 8th Semester Internship:
- **Mandatory Final Year Capstone Project:**
  - CSE/IT: Course code CSE4001 (4 credits). Project groups of 2 to 3 members.
  - ECE: Course code ECE4001 (4 credits).
  - MECH/CIVIL/EEE: Course codes MEC4001 / CIV4001 / EEE4001 (4 credits).
- **Full Semester Internship (6 Credits):**
  - High-performing 4th year students with an aggregate CGPA >= 7.5 may undertake an external 6-month full-time industry internship in their 8th semester.
  - The internship must be approved by the Departmental Internship Committee (DIC) before joining. Monthly progress reports and an end-of-semester viva-voce examination are mandatory.
"""
save_doc("placement_and_internship_policy.md", {
    "title": "Career Development, Placement and Internship Guidelines",
    "branch": "all",
    "year": "4th",
    "batch": "all",
    "doc_type": "placement",
    "applicable_to": "all"
}, placement_doc)


# -------------------------------------------------------------
# 7. STUDENT GRIEVANCE, COMPLAINT & FEEDBACK POLICY (Applicable to ALL)
# -------------------------------------------------------------

grievance_doc = """# University Student Grievance Redressal & Complaint Procedure
## Official Mechanism for Academic, Hostel, Mess, and Administrative Complaints
**Applicable To:** All Students (All Branches, Years, and Hostels)
**Document Category:** Student Welfare & Grievance Manual

### 1. Types of Complaints & Where to File:
1. **Hostel Maintenance Complaints (Electrical, Plumbing, Wi-Fi, Furniture, Water):**
   - **Procedure:** Log into the ERP Student Portal ➔ Navigate to *Hostel Services ➔ Maintenance Ticket*.
   - **Offline Option:** Register your issue in the physical Complaint Register at the Hostel Block Reception Desk (Ground Floor).
   - **Resolution SLA:** Routine tickets are resolved within 24 hours. Urgent electrical/water issues are prioritized within 4 hours.

2. **Mess & Food Quality Complaints:**
   - **Procedure:** Submit feedback on the ERP Mess Feedback Module (available 24/7) or report directly to the Assistant Warden / Student Mess Committee.
   - Weekly menu revisions and hygiene inspections are audited by the Campus Food Safety Committee.

3. **Academic Grievances (Internal Marks, Exam Hall Issues, Attendance Discrepancies):**
   - **Step 1:** Approach your Course Faculty or Faculty Advisor within 3 working days of marks display.
   - **Step 2:** If unresolved, submit a formal grievance to the Head of the Department (HOD).
   - **Revaluation / Paper Seeing Window:** Official semester revaluation opens within 7 days of result declaration via the ERP portal (₹750 per course fee).

4. **Ragging, Bullying & Harassment (Strict Zero-Tolerance):**
   - **Immediate Action:** Contact the 24/7 Anti-Ragging Committee Helpline at **1800-180-5522** (Toll-Free) or email **antiragging@campus.edu**.
   - Any verified incident attracts immediate suspension, expulsion, and statutory police reporting as per Supreme Court / UGC guidelines.

5. **Fees, ID Cards, Transport & Administrative Queries:**
   - Visit the Student Services Centre (Ground Floor, Admin Block, Mon-Fri 09:30 AM to 05:00 PM) or email **helpdesk@campus.edu**.
"""
save_doc("student_grievance_and_complaint_policy.md", {
    "title": "University Student Grievance Redressal and Complaint Procedure",
    "branch": "all",
    "year": "all",
    "batch": "all",
    "doc_type": "policy",
    "applicable_to": "all"
}, grievance_doc)

print(f"\n[seed_data] Successfully generated {len(list(KB_DIR.glob('*.md')))} synthetic knowledge base files!")
