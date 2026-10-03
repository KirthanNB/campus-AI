"""
CampusMind AI - Timetable & News Generator Script
Generates 24 realistic branch & year timetable markdown files and news circular files
in /knowledge_base directory for ChromaDB vector store indexing and PDF viewing.
"""

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
KB_DIR = BASE_DIR / "knowledge_base"
KB_DIR.mkdir(parents=True, exist_ok=True)

BRANCHES = ["CSE", "ECE", "MECH", "EEE", "CIVIL", "IT"]
YEARS = ["1styr", "2ndyr", "3rdyr", "4thyr"]
YEAR_NAMES = {"1styr": "1st", "2ndyr": "2nd", "3rdyr": "3rd", "4thyr": "4th"}

# Authentic engineering subjects mapped per branch & year
SUBJECTS_MAP = {
  "CSE": {
    "1styr": [
      ("PHY101", "Engineering Physics", "Dr. A. K. Sharma", "Block 1 - Room 101"),
      ("MTH101", "Calculus & Linear Algebra", "Prof. R. Deshmukh", "Block 1 - Room 101"),
      ("CSE101", "Programming in C/C++", "Dr. S. Nair", "Block 1 - Room 102"),
      ("ENG101", "Technical Communication", "Prof. M. Kapoor", "Block 2 - Room 204"),
      ("CSL101", "C Programming Lab", "Dr. S. Nair & TAs", "Computing Lab 1"),
    ],
    "2ndyr": [
      ("CSE201", "Data Structures & Algorithms", "Dr. V. Ramanathan", "CS Block - Room 201"),
      ("CSE202", "Discrete Mathematics", "Prof. S. Meenakshi", "CS Block - Room 201"),
      ("CSE203", "Object Oriented Programming (Java)", "Dr. K. Swaminathan", "CS Block - Room 202"),
      ("CSE204", "Digital Logic & Computer Architecture", "Prof. T. Reddy", "CS Block - Room 203"),
      ("CSL201", "Data Structures Lab", "Dr. V. Ramanathan & TAs", "Database Lab 1"),
    ],
    "3rdyr": [
      ("CSE301", "Database Management Systems", "Dr. V. Ramanathan", "CS Block 2 - Room 301"),
      ("CSE302", "Operating Systems", "Prof. S. Meenakshi", "CS Block 2 - Room 301"),
      ("CSE303", "Design & Analysis of Algorithms", "Dr. K. Swaminathan", "CS Block 2 - Room 302"),
      ("CSE304", "Artificial Intelligence & ML", "Dr. N. Bannerjee", "CS Block 2 - Room 305"),
      ("CSE305", "Computer Networks", "Prof. T. Reddy", "CS Block 2 - Room 303"),
      ("CSL301", "DBMS & SQL Lab", "Dr. V. Ramanathan", "Database Lab 2"),
    ],
    "4thyr": [
      ("CSE401", "Cloud Computing & DevOps", "Dr. A. Sengupta", "CS Block 3 - Room 401"),
      ("CSE402", "Compiler Design", "Prof. P. Iyengar", "CS Block 3 - Room 401"),
      ("CSE403", "Cybersecurity & Cryptography", "Dr. H. Rastogi", "CS Block 3 - Room 402"),
      ("PRJ401", "Major Capstone Project Phase II", "Senior Project Panel", "Innovation Centre"),
    ],
  },
  "ECE": {
    "1styr": [
      ("PHY101", "Engineering Physics", "Dr. A. K. Sharma", "Block 1 - Room 101"),
      ("MTH101", "Calculus & Linear Algebra", "Prof. R. Deshmukh", "Block 1 - Room 101"),
      ("ECE101", "Basic Electronics Engineering", "Dr. R. Sundaram", "ECE Block - Room 101"),
      ("ENG101", "Technical Communication", "Prof. M. Kapoor", "Block 2 - Room 204"),
      ("ECL101", "Basic Electronics Lab", "Dr. R. Sundaram & TAs", "Electronics Lab 1"),
    ],
    "2ndyr": [
      ("ECE201", "Electronic Circuits & Devices", "Dr. G. Ananth", "ECE Block - Room 201"),
      ("ECE202", "Signals & Systems", "Prof. N. Kulkarni", "ECE Block - Room 201"),
      ("ECE203", "Network Theory & Analysis", "Dr. S. Mukherjee", "ECE Block - Room 202"),
      ("ECE204", "Digital Electronics & Logic Design", "Prof. R. P. Singh", "ECE Block - Room 203"),
      ("ECL201", "Analog Circuits Lab", "Dr. G. Ananth", "Circuit Lab 2"),
    ],
    "3rdyr": [
      ("ECE301", "Microprocessors & Microcontrollers", "Dr. M. Chawla", "ECE Block 2 - Room 301"),
      ("ECE302", "VLSI Design & Embedded Systems", "Prof. S. Nambiar", "ECE Block 2 - Room 301"),
      ("ECE303", "Digital Communication Systems", "Dr. D. Bose", "ECE Block 2 - Room 302"),
      ("ECE304", "Electromagnetic Waves & Waveguides", "Prof. K. Subramanian", "ECE Block 2 - Room 305"),
      ("ECL301", "Microcontroller & VLSI Lab", "Dr. M. Chawla", "VLSI CAD Lab"),
    ],
    "4thyr": [
      ("ECE401", "Wireless & Mobile Communication", "Dr. V. Natesan", "ECE Block 3 - Room 401"),
      ("ECE402", "Optical Fiber Communication", "Prof. L. Bhatnagar", "ECE Block 3 - Room 401"),
      ("ECE403", "RF & Microwave Engineering", "Dr. R. K. Pillai", "ECE Block 3 - Room 402"),
      ("PRJ401", "Major Capstone Hardware Project", "Senior ECE Faculty", "Embedded Systems Lab"),
    ],
  },
  "MECH": {
    "1styr": [
      ("PHY101", "Engineering Physics", "Dr. A. K. Sharma", "Block 1 - Room 101"),
      ("MTH101", "Calculus & Linear Algebra", "Prof. R. Deshmukh", "Block 1 - Room 101"),
      ("MEC101", "Engineering Graphics & Drawing", "Prof. K. Verma", "CAD Studio 2"),
      ("MEC102", "Basic Mechanical Engineering", "Dr. S. Chatterjee", "Mech Block - Room 102"),
      ("MEL101", "Workshop Practice & Fitting Lab", "Instructors", "Central Workshop"),
    ],
    "2ndyr": [
      ("MEC201", "Engineering Thermodynamics", "Dr. S. Chatterjee", "Mech Block - Room 201"),
      ("MEC202", "Mechanics of Solids (Strength of Materials)", "Prof. A. Sridhar", "Mech Block - Room 201"),
      ("MEC203", "Fluid Mechanics & Hydraulics", "Dr. N. Tripathi", "Mech Block - Room 202"),
      ("MEC204", "Manufacturing Processes I", "Prof. B. Raut", "Mech Block - Room 203"),
      ("MEL201", "Solid Mechanics & Strength Lab", "Prof. A. Sridhar", "SOM Lab"),
    ],
    "3rdyr": [
      ("MEC301", "Kinematics & Dynamics of Machinery", "Dr. P. R. Rao", "Mech Block 2 - Room 301"),
      ("MEC302", "Heat & Mass Transfer", "Prof. S. K. Mahapatra", "Mech Block 2 - Room 301"),
      ("MEC303", "Design of Machine Elements", "Dr. U. N. Das", "Mech Block 2 - Room 302"),
      ("MEC304", "Metrology & Quality Control", "Prof. G. Hegde", "Mech Block 2 - Room 305"),
      ("MEC305", "IC Engines & Thermal Engineering", "Dr. S. Chatterjee", "Mech Block 2 - Room 303"),
      ("MEL301", "Heat Transfer & IC Engines Lab", "Prof. S. K. Mahapatra", "Thermal Engg Lab"),
    ],
    "4thyr": [
      ("MEC401", "CAD/CAM/CIM & Robotics", "Dr. T. Venkat", "Mech Block 3 - Room 401"),
      ("MEC402", "Power Plant Engineering", "Prof. R. Soman", "Mech Block 3 - Room 401"),
      ("MEC403", "Mechatronics & Automation", "Dr. A. Gokhale", "Mech Block 3 - Room 402"),
      ("PRJ401", "Major Mechanical Capstone Project", "Mech Review Panel", "Robotics Lab"),
    ],
  },
  "EEE": {
    "1styr": [
      ("PHY101", "Engineering Physics", "Dr. A. K. Sharma", "Block 1 - Room 101"),
      ("MTH101", "Calculus & Linear Algebra", "Prof. R. Deshmukh", "Block 1 - Room 101"),
      ("EEE101", "Basic Electrical Engineering", "Prof. V. Gupta", "EEE Block - Room 101"),
      ("ENG101", "Technical Communication", "Prof. M. Kapoor", "Block 2 - Room 204"),
      ("EEL101", "Basic Electrical Lab", "Prof. V. Gupta & TAs", "Electrical Lab 1"),
    ],
    "2ndyr": [
      ("EEE201", "Electric Circuit Analysis", "Dr. M. R. Menon", "EEE Block - Room 201"),
      ("EEE202", "Electrical Machines I (DC Machines)", "Prof. C. H. Reddi", "EEE Block - Room 201"),
      ("EEE203", "Electromagnetic Fields & Waves", "Dr. S. Parida", "EEE Block - Room 202"),
      ("EEE204", "Analog & Digital Electronics", "Prof. T. K. Roy", "EEE Block - Room 203"),
      ("EEL201", "Electrical Machines Lab I", "Prof. C. H. Reddi", "Machines Lab A"),
    ],
    "3rdyr": [
      ("EEE301", "Electrical Machines II (AC Machines)", "Prof. C. H. Reddi", "EEE Block 2 - Room 301"),
      ("EEE302", "Power Systems Analysis & Protection", "Dr. K. V. S. Murthy", "EEE Block 2 - Room 301"),
      ("EEE303", "Control Systems Engineering", "Dr. A. Nandi", "EEE Block 2 - Room 302"),
      ("EEE304", "Power Electronics & Drives", "Prof. S. R. Samant", "EEE Block 2 - Room 305"),
      ("EEL301", "Power Electronics & Control Lab", "Prof. S. R. Samant", "Power Elec Lab"),
    ],
    "4thyr": [
      ("EEE401", "High Voltage Engineering", "Dr. P. K. Swain", "EEE Block 3 - Room 401"),
      ("EEE402", "Renewable Energy & Smart Grid", "Prof. V. Nambisan", "EEE Block 3 - Room 401"),
      ("EEE403", "Electric Vehicles & Battery Tech", "Dr. S. Mohapatra", "EEE Block 3 - Room 402"),
      ("PRJ401", "Major EEE Capstone Project", "EEE Senior Faculty", "High Voltage Lab"),
    ],
  },
  "CIVIL": {
    "1styr": [
      ("PHY101", "Engineering Physics", "Dr. A. K. Sharma", "Block 1 - Room 101"),
      ("MTH101", "Calculus & Linear Algebra", "Prof. R. Deshmukh", "Block 1 - Room 101"),
      ("CIV101", "Engineering Mechanics", "Dr. S. K. Das", "Civil Block - Room 101"),
      ("CIV102", "Basic Civil Engineering & Surveying", "Prof. H. N. Rao", "Civil Block - Room 102"),
      ("CVL101", "Surveying Workshop & Field Lab", "Prof. H. N. Rao", "Survey Field Ground"),
    ],
    "2ndyr": [
      ("CIV201", "Mechanics of Structures", "Dr. S. K. Das", "Civil Block - Room 201"),
      ("CIV202", "Fluid Mechanics & Open Channel Flow", "Prof. P. C. Jha", "Civil Block - Room 201"),
      ("CIV203", "Advanced Surveying & GIS", "Dr. M. Patnaik", "Civil Block - Room 202"),
      ("CIV204", "Building Construction & Planning", "Prof. V. K. Jain", "Civil Block - Room 203"),
      ("CVL201", "Hydraulics & Fluid Lab", "Prof. P. C. Jha", "Hydraulics Lab"),
    ],
    "3rdyr": [
      ("CIV301", "Structural Analysis I & II", "Dr. S. K. Das", "Civil Block 2 - Room 301"),
      ("CIV302", "Concrete Technology & Design", "Prof. R. K. Behera", "Civil Block 2 - Room 301"),
      ("CIV303", "Geotechnical & Soil Mechanics", "Dr. A. B. Chaudhuri", "Civil Block 2 - Room 302"),
      ("CIV304", "Transportation Engineering", "Prof. S. S. Mohanty", "Civil Block 2 - Room 305"),
      ("CVL301", "Geotechnical & Concrete Testing Lab", "Dr. A. B. Chaudhuri", "Soil Mechanics Lab"),
    ],
    "4thyr": [
      ("CIV401", "Design of Steel Structures", "Dr. S. K. Das", "Civil Block 3 - Room 401"),
      ("CIV402", "Environmental Engineering & Waste Mgmt", "Prof. T. R. Pradhan", "Civil Block 3 - Room 401"),
      ("CIV403", "Construction Project Management", "Dr. N. C. Panda", "Civil Block 3 - Room 402"),
      ("PRJ401", "Major Civil Engineering Capstone", "Civil Review Panel", "Structural CAD Lab"),
    ],
  },
  "IT": {
    "1styr": [
      ("PHY101", "Engineering Physics", "Dr. A. K. Sharma", "Block 1 - Room 101"),
      ("MTH101", "Calculus & Linear Algebra", "Prof. R. Deshmukh", "Block 1 - Room 101"),
      ("ITN101", "Python Programming for Engineers", "Dr. J. Bhattacharya", "IT Block - Room 101"),
      ("ENG101", "Technical Communication", "Prof. M. Kapoor", "Block 2 - Room 204"),
      ("ITL101", "Python Programming Lab", "Dr. J. Bhattacharya", "IT Lab 1"),
    ],
    "2ndyr": [
      ("ITN201", "Data Structures & Algorithms", "Dr. S. K. Dey", "IT Block - Room 201"),
      ("ITN202", "Object Oriented Software Engineering", "Prof. R. G. Shah", "IT Block - Room 201"),
      ("ITN203", "Database Systems & Web Tech", "Dr. A. K. Paul", "IT Block - Room 202"),
      ("ITN204", "Digital Principles & Microcontrollers", "Prof. S. R. Somayaji", "IT Block - Room 203"),
      ("ITL201", "Web Technologies & Database Lab", "Dr. A. K. Paul", "Web Tech Lab"),
    ],
    "3rdyr": [
      ("ITN301", "Computer Networks & Security", "Dr. S. K. Dey", "IT Block 2 - Room 301"),
      ("ITN302", "Software Testing & QA", "Prof. R. G. Shah", "IT Block 2 - Room 301"),
      ("ITN303", "Mobile Application Development", "Dr. M. S. Varma", "IT Block 2 - Room 302"),
      ("ITN304", "Information & Cyber Security", "Prof. K. L. Narayana", "IT Block 2 - Room 305"),
      ("ITL301", "Mobile App & Security Lab", "Dr. M. S. Varma", "Mobile App Lab"),
    ],
    "4thyr": [
      ("ITN401", "Big Data Analytics & Data Science", "Dr. S. K. Dey", "IT Block 3 - Room 401"),
      ("ITN402", "Cloud Infrastructure & Services", "Prof. A. N. Murthy", "IT Block 3 - Room 401"),
      ("ITN403", "Cyber Forensics & Incident Response", "Dr. P. V. Raman", "IT Block 3 - Room 402"),
      ("PRJ401", "Major IT Capstone Software Project", "IT Review Board", "Cloud Computing Lab"),
    ],
  },
}

DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

def generate_timetable_markdown(branch: str, year_key: str):
  year_name = YEAR_NAMES[year_key]
  filename = f"timetable_{branch}_{year_key}_2026.md"
  filepath = KB_DIR / filename
  subjects = SUBJECTS_MAP[branch][year_key]

  content = []
  content.append("---")
  content.append(f'{{"branch": "{branch}", "year": "{year_name}", "batch": "2023-2027", "doc_type": "timetable", "applicable_to": "{branch}_{year_key}"}}')
  content.append("---")
  content.append(f"# Official Weekly Class Timetable - {branch} {year_name} Year (Autumn Semester 2026)\n")
  content.append(f"**Department:** Department of {branch} Engineering  ")
  content.append(f"**Academic Year:** {year_name} Year | **Effective Date:** October 2026  ")
  content.append(f"**Class Room / Lab Allocations:** {branch} Academic Block\n")

  content.append("## Weekly Schedule Overview\n")
  content.append("| Day | Time Slot | Course Code | Course Title | Room / Venue | Faculty In-Charge |")
  content.append("|---|---|---|---|---|---|")

  # Generate 5 days of structured schedules from subjects
  for day_idx, day in enumerate(DAYS):
    # Rotate subjects for variety per day
    day_subjects = [subjects[(day_idx + i) % len(subjects)] for i in range(4)]
    time_slots = [
      "09:00 AM - 10:00 AM",
      "10:00 AM - 11:00 AM",
      "11:15 AM - 12:15 PM",
      "01:15 PM - 04:15 PM (Lab)",
    ]

    for slot, subj in zip(time_slots, day_subjects):
      code, title, faculty, room = subj
      content.append(f"| {day} | {slot} | **{code}** | {title} | {room} | {faculty} |")

  content.append("\n## Academic Attendance & Punctuality Policy\n")
  content.append("- **Minimum Attendance:** 75% attendance mandatory per course to qualify for End-Semester FAT Examinations.")
  content.append("- **Lab Sessions:** Attendance in 3-hour practical lab sessions is strictly compulsory.")
  content.append("- **Class Representatives:** Contact Head of Department (HOD) for any room re-allocations.")

  filepath.write_text("\n".join(content), encoding="utf-8")
  print(f"  -> Created timetable markdown: {filename}")

def generate_news_notices():
  notices = [
    {
      "filename": "google_microsoft_placement_drive_2026.md",
      "title": "Google & Microsoft Off-Campus Internship & Capstone Placement Drive 2026",
      "category": "Placements",
      "content": """---
{"doc_type": "circular", "category": "Placements", "applicable_to": "all"}
---
# Official Notice: Google & Microsoft Off-Campus Placement & Internship Drive 2026

**Issued By:** Department of Training & Placements (T&P Cell)  
**Date:** October 03, 2026  
**Reference:** TP/OFF/2026/104  

## Overview & Eligibility
The Training and Placement Cell is pleased to announce the off-campus recruitment drive for **Google India** and **Microsoft Development Center**.

### Key Highlights:
- **Eligible Batches:** 3rd Year (Internship 2027) & 4th Year (Full-time FTE 2026)
- **Eligible Branches:** CSE, IT, ECE, EEE, MECH, CIVIL (Minimum CGPA: 6.5+, No active backlogs)
- **Super Dream CTC:** ₹42.0 LPA (FTE) | ₹1.25 Lakh/month (Stipend)
- **Selection Process:** 
  1. Online Coding Round (Data Structures, Algorithms, Problem Solving)
  2. Technical Interview Round I (System Design & Code Review)
  3. Technical Interview Round II (Problem Solving & Core Fundamentals)
  4. HR & Cultural Fitment Assessment

## How to Register
All interested students must update their resume on the CampusMind Training & Placement Portal before **October 10, 2026, 05:00 PM**.
"""
    },
    {
      "filename": "student_innovation_and_project_expo.md",
      "title": "Annual Student Innovation & AI Project Expo Regulations",
      "category": "Events",
      "content": """---
{"doc_type": "circular", "category": "Events", "applicable_to": "all"}
---
# Official Circular: Annual Student Innovation & AI Project Expo

**Issued By:** Dean of Student Affairs & AI Innovation Cell  
**Date:** September 28, 2026  
**Reference:** UNI/2026/EVE-09  

## Event Details
The Annual Student Innovation & Project Expo is the flagship national project and research exhibition hosted at CampusMind University.

### Prize Pool & Categories:
- **Total Cash Prize Pool:** ₹5,00,000 INR
- **Track 1: AI Copilots & LLM Applications** (1st Prize: ₹1,50,000)
- **Track 2: Smart Campus & Automation Solutions** (1st Prize: ₹1,00,000)
- **Track 3: Hardware, Embedded & IoT Innovations** (1st Prize: ₹1,00,000)

## Registration Rules
- Teams must consist of 2 to 4 registered university students.
- All projects must be demonstrated with working prototypes.
- Prototype submission link closes on **October 15, 2026**.
"""
    }
  ]

  for n in notices:
    path = KB_DIR / n["filename"]
    path.write_text(n["content"], encoding="utf-8")
    print(f"  -> Created news notice markdown: {n['filename']}")

def main():
  print("=" * 60)
  print("🚀 Generating 24 Branch & Year Timetables + News Circulars")
  print("=" * 60)

  for branch in BRANCHES:
    for year_key in YEARS:
      generate_timetable_markdown(branch, year_key)

  generate_news_notices()
  print("\n✅ Finished generating 24 branch timetables and news circular files!")

if __name__ == "__main__":
  main()
