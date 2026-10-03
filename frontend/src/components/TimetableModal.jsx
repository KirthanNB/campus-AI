import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, User, BookOpen, Download } from 'lucide-react';

const TIMETABLE_DATA = {
  CSE: {
    '1st': {
      Monday: [
        { time: '09:00 AM - 10:00 AM', code: 'PHY101', title: 'Engineering Physics', room: 'Block 1 - Room 101', faculty: 'Dr. A. K. Sharma' },
        { time: '10:00 AM - 11:00 AM', code: 'MTH101', title: 'Calculus & Linear Algebra', room: 'Block 1 - Room 101', faculty: 'Prof. R. Deshmukh' },
        { time: '11:15 AM - 12:15 PM', code: 'CSE101', title: 'Programming in C/C++', room: 'Block 1 - Room 102', faculty: 'Dr. S. Nair' },
        { time: '01:15 PM - 04:15 PM', code: 'CSL101', title: 'C Programming Lab', room: 'Computing Lab 1', faculty: 'Dr. S. Nair & TAs' },
      ],
      Tuesday: [
        { time: '09:00 AM - 10:00 AM', code: 'EEE101', title: 'Basic Electrical Engg', room: 'Block 1 - Room 103', faculty: 'Prof. V. Gupta' },
        { time: '10:00 AM - 11:00 AM', code: 'MTH101', title: 'Calculus & Linear Algebra', room: 'Block 1 - Room 101', faculty: 'Prof. R. Deshmukh' },
        { time: '11:15 AM - 12:15 PM', code: 'ENG101', title: 'Technical Communication', room: 'Block 2 - Room 204', faculty: 'Prof. M. Kapoor' },
        { time: '01:15 PM - 03:15 PM', code: 'EED101', title: 'Engineering Drawing', room: 'CAD Studio 2', faculty: 'Prof. K. Verma' },
      ],
      Wednesday: [
        { time: '09:00 AM - 10:00 AM', code: 'CSE101', title: 'Programming in C/C++', room: 'Block 1 - Room 102', faculty: 'Dr. S. Nair' },
        { time: '10:00 AM - 11:00 AM', code: 'PHY101', title: 'Engineering Physics', room: 'Block 1 - Room 101', faculty: 'Dr. A. K. Sharma' },
        { time: '11:15 AM - 01:15 PM', code: 'PHL101', title: 'Physics Lab', room: 'Physics Lab A', faculty: 'Dr. A. K. Sharma' },
      ],
      Thursday: [
        { time: '09:00 AM - 10:00 AM', code: 'MTH101', title: 'Calculus & Linear Algebra', room: 'Block 1 - Room 101', faculty: 'Prof. R. Deshmukh' },
        { time: '10:00 AM - 11:00 AM', code: 'EEE101', title: 'Basic Electrical Engg', room: 'Block 1 - Room 103', faculty: 'Prof. V. Gupta' },
        { time: '01:15 PM - 04:15 PM', code: 'EEL101', title: 'Electrical Hardware Workshop', room: 'Workshop 3', faculty: 'Prof. V. Gupta' },
      ],
      Friday: [
        { time: '09:00 AM - 10:00 AM', code: 'CSE101', title: 'Programming in C/C++', room: 'Block 1 - Room 102', faculty: 'Dr. S. Nair' },
        { time: '10:00 AM - 11:00 AM', code: 'ENG101', title: 'Technical Communication', room: 'Block 2 - Room 204', faculty: 'Prof. M. Kapoor' },
        { time: '11:15 AM - 01:15 PM', code: 'CHL101', title: 'Chemistry Lab', room: 'Chemistry Lab 2', faculty: 'Dr. P. Sen' },
      ],
    },
    '2nd': {
      Monday: [
        { time: '09:00 AM - 10:00 AM', code: 'CSE201', title: 'Data Structures & Algorithms', room: 'CS Block - Room 201', faculty: 'Dr. V. Ramanathan' },
        { time: '10:00 AM - 11:00 AM', code: 'CSE202', title: 'Discrete Mathematics', room: 'CS Block - Room 201', faculty: 'Prof. S. Meenakshi' },
        { time: '11:15 AM - 12:15 PM', code: 'CSE203', title: 'Object Oriented Programming (Java)', room: 'CS Block - Room 202', faculty: 'Dr. K. Swaminathan' },
        { time: '01:15 PM - 04:15 PM', code: 'CSL201', title: 'Data Structures Lab', room: 'Database Lab 1', faculty: 'Dr. V. Ramanathan' },
      ],
      Tuesday: [
        { time: '09:00 AM - 10:00 AM', code: 'CSE204', title: 'Digital Logic & Computer Architecture', room: 'CS Block - Room 203', faculty: 'Prof. T. Reddy' },
        { time: '10:00 AM - 11:00 AM', code: 'CSE201', title: 'Data Structures & Algorithms', room: 'CS Block - Room 201', faculty: 'Dr. V. Ramanathan' },
        { time: '11:15 AM - 12:15 PM', code: 'CSE202', title: 'Discrete Mathematics', room: 'CS Block - Room 201', faculty: 'Prof. S. Meenakshi' },
      ],
      Wednesday: [
        { time: '09:00 AM - 10:00 AM', code: 'CSE203', title: 'Object Oriented Programming (Java)', room: 'CS Block - Room 202', faculty: 'Dr. K. Swaminathan' },
        { time: '10:00 AM - 11:00 AM', code: 'CSE204', title: 'Digital Logic & Computer Architecture', room: 'CS Block - Room 203', faculty: 'Prof. T. Reddy' },
        { time: '01:15 PM - 03:15 PM', code: 'CSL202', title: 'Java OOP Lab', room: 'Java Lab 2', faculty: 'Dr. K. Swaminathan' },
      ],
      Thursday: [
        { time: '09:00 AM - 10:00 AM', code: 'CSE201', title: 'Data Structures & Algorithms', room: 'CS Block - Room 201', faculty: 'Dr. V. Ramanathan' },
        { time: '10:00 AM - 11:00 AM', code: 'CSE202', title: 'Discrete Mathematics', room: 'CS Block - Room 201', faculty: 'Prof. S. Meenakshi' },
      ],
      Friday: [
        { time: '09:00 AM - 10:00 AM', code: 'CSE204', title: 'Digital Logic & Computer Architecture', room: 'CS Block - Room 203', faculty: 'Prof. T. Reddy' },
        { time: '11:15 AM - 01:15 PM', code: 'CSL203', title: 'Digital Logic Hardware Lab', room: 'Logic Lab A', faculty: 'Prof. T. Reddy' },
      ],
    },
    '3rd': {
      Monday: [
        { time: '09:00 AM - 10:00 AM', code: 'CSE301', title: 'Database Management Systems', room: 'CS Block 2 - Room 301', faculty: 'Dr. V. Ramanathan' },
        { time: '10:00 AM - 11:00 AM', code: 'CSE302', title: 'Operating Systems', room: 'CS Block 2 - Room 301', faculty: 'Prof. S. Meenakshi' },
        { time: '11:15 AM - 12:15 PM', code: 'CSE303', title: 'Design & Analysis of Algorithms', room: 'CS Block 2 - Room 302', faculty: 'Dr. K. Swaminathan' },
        { time: '01:15 PM - 04:15 PM', code: 'CSL301', title: 'DBMS & SQL Lab', room: 'Database Lab 2', faculty: 'Dr. V. Ramanathan' },
      ],
      Tuesday: [
        { time: '09:00 AM - 10:00 AM', code: 'CSE304', title: 'Artificial Intelligence & ML', room: 'CS Block 2 - Room 305', faculty: 'Dr. N. Bannerjee' },
        { time: '10:00 AM - 11:00 AM', code: 'CSE301', title: 'Database Management Systems', room: 'CS Block 2 - Room 301', faculty: 'Dr. V. Ramanathan' },
        { time: '11:15 AM - 12:15 PM', code: 'CSE305', title: 'Computer Networks', room: 'CS Block 2 - Room 303', faculty: 'Prof. T. Reddy' },
      ],
      Wednesday: [
        { time: '09:00 AM - 10:00 AM', code: 'CSE302', title: 'Operating Systems', room: 'CS Block 2 - Room 301', faculty: 'Prof. S. Meenakshi' },
        { time: '10:00 AM - 11:00 AM', code: 'CSE303', title: 'Design & Analysis of Algorithms', room: 'CS Block 2 - Room 302', faculty: 'Dr. K. Swaminathan' },
        { time: '01:15 PM - 03:15 PM', code: 'CSL304', title: 'AI & Machine Learning Lab', room: 'AI GPU Lab', faculty: 'Dr. N. Bannerjee' },
      ],
      Thursday: [
        { time: '09:00 AM - 10:00 AM', code: 'CSE305', title: 'Computer Networks', room: 'CS Block 2 - Room 303', faculty: 'Prof. T. Reddy' },
        { time: '10:00 AM - 11:00 AM', code: 'CSE301', title: 'Database Management Systems', room: 'CS Block 2 - Room 301', faculty: 'Dr. V. Ramanathan' },
      ],
      Friday: [
        { time: '09:00 AM - 10:00 AM', code: 'CSE303', title: 'Design & Analysis of Algorithms', room: 'CS Block 2 - Room 302', faculty: 'Dr. K. Swaminathan' },
        { time: '10:00 AM - 11:00 AM', code: 'CSE305', title: 'Computer Networks', room: 'CS Block 2 - Room 303', faculty: 'Prof. T. Reddy' },
      ],
    },
    '4th': {
      Monday: [
        { time: '09:00 AM - 10:00 AM', code: 'CSE401', title: 'Cloud Computing & DevOps', room: 'CS Block 3 - Room 401', faculty: 'Dr. A. Sengupta' },
        { time: '10:00 AM - 11:00 AM', code: 'CSE402', title: 'Compiler Design', room: 'CS Block 3 - Room 401', faculty: 'Prof. P. Iyengar' },
        { time: '11:15 AM - 04:15 PM', code: 'PRJ401', title: 'Major Capstone Project Phase II', room: 'Innovation Centre', faculty: 'Senior Panel' },
      ],
      Tuesday: [
        { time: '09:00 AM - 10:00 AM', code: 'CSE403', title: 'Cybersecurity & Cryptography', room: 'CS Block 3 - Room 402', faculty: 'Dr. H. Rastogi' },
        { time: '10:00 AM - 11:00 AM', code: 'CSE401', title: 'Cloud Computing & DevOps', room: 'CS Block 3 - Room 401', faculty: 'Dr. A. Sengupta' },
      ],
      Wednesday: [
        { time: '09:00 AM - 04:00 PM', code: 'PRJ401', title: 'Major Capstone Industrial Sprint', room: 'Innovation Centre', faculty: 'Industry Mentors' },
      ],
      Thursday: [
        { time: '09:00 AM - 10:00 AM', code: 'CSE402', title: 'Compiler Design', room: 'CS Block 3 - Room 401', faculty: 'Prof. P. Iyengar' },
        { time: '10:00 AM - 11:00 AM', code: 'CSE403', title: 'Cybersecurity & Cryptography', room: 'CS Block 3 - Room 402', faculty: 'Dr. H. Rastogi' },
      ],
      Friday: [
        { time: '09:00 AM - 12:00 PM', code: 'SEM401', title: 'Placement & FTE Offer Guidance', room: 'Auditorium Main', faculty: 'T&P Dean' },
      ],
    },
  },
  MECH: {
    '1st': {
      Monday: [
        { time: '09:00 AM - 10:00 AM', code: 'PHY101', title: 'Engineering Physics', room: 'Block 1 - Room 101', faculty: 'Dr. A. K. Sharma' },
        { time: '10:00 AM - 11:00 AM', code: 'MTH101', title: 'Calculus & Linear Algebra', room: 'Block 1 - Room 101', faculty: 'Prof. R. Deshmukh' },
        { time: '11:15 AM - 12:15 PM', code: 'MEC102', title: 'Basic Mechanical Engineering', room: 'Mech Block - Room 102', faculty: 'Dr. S. Chatterjee' },
        { time: '01:15 PM - 04:15 PM', code: 'MEL101', title: 'Workshop Practice & Fitting Lab', room: 'Central Workshop', faculty: 'Workshop Instructors' },
      ],
      Tuesday: [
        { time: '09:00 AM - 11:00 AM', code: 'MEC101', title: 'Engineering Graphics & Drawing', room: 'CAD Studio 2', faculty: 'Prof. K. Verma' },
        { time: '11:15 AM - 12:15 PM', code: 'PHY101', title: 'Engineering Physics', room: 'Block 1 - Room 101', faculty: 'Dr. A. K. Sharma' },
      ],
      Wednesday: [
        { time: '09:00 AM - 10:00 AM', code: 'MEC102', title: 'Basic Mechanical Engineering', room: 'Mech Block - Room 102', faculty: 'Dr. S. Chatterjee' },
        { time: '10:00 AM - 11:00 AM', code: 'MTH101', title: 'Calculus & Linear Algebra', room: 'Block 1 - Room 101', faculty: 'Prof. R. Deshmukh' },
      ],
      Thursday: [
        { time: '09:00 AM - 10:00 AM', code: 'PHY101', title: 'Engineering Physics', room: 'Block 1 - Room 101', faculty: 'Dr. A. K. Sharma' },
        { time: '01:15 PM - 04:15 PM', code: 'PHL101', title: 'Physics & Measurements Lab', room: 'Physics Lab B', faculty: 'Dr. A. K. Sharma' },
      ],
      Friday: [
        { time: '09:00 AM - 11:00 AM', code: 'MEC101', title: 'Engineering Graphics & CAD Lab', room: 'CAD Studio 2', faculty: 'Prof. K. Verma' },
      ],
    },
    '2nd': {
      Monday: [
        { time: '09:00 AM - 10:00 AM', code: 'MEC201', title: 'Engineering Thermodynamics', room: 'Mech Block - Room 201', faculty: 'Dr. S. Chatterjee' },
        { time: '10:00 AM - 11:00 AM', code: 'MEC202', title: 'Mechanics of Solids (Strength of Materials)', room: 'Mech Block - Room 201', faculty: 'Prof. A. Sridhar' },
        { time: '11:15 AM - 12:15 PM', code: 'MEC203', title: 'Fluid Mechanics & Hydraulics', room: 'Mech Block - Room 202', faculty: 'Dr. N. Tripathi' },
        { time: '01:15 PM - 04:15 PM', code: 'MEL201', title: 'Solid Mechanics & SOM Lab', room: 'SOM Lab', faculty: 'Prof. A. Sridhar' },
      ],
      Tuesday: [
        { time: '09:00 AM - 10:00 AM', code: 'MEC204', title: 'Manufacturing Processes I', room: 'Mech Block - Room 203', faculty: 'Prof. B. Raut' },
        { time: '10:00 AM - 11:00 AM', code: 'MEC201', title: 'Engineering Thermodynamics', room: 'Mech Block - Room 201', faculty: 'Dr. S. Chatterjee' },
      ],
      Wednesday: [
        { time: '09:00 AM - 10:00 AM', code: 'MEC202', title: 'Mechanics of Solids', room: 'Mech Block - Room 201', faculty: 'Prof. A. Sridhar' },
        { time: '10:00 AM - 11:00 AM', code: 'MEC203', title: 'Fluid Mechanics & Hydraulics', room: 'Mech Block - Room 202', faculty: 'Dr. N. Tripathi' },
        { time: '01:15 PM - 04:15 PM', code: 'MEL202', title: 'Manufacturing Foundry & Machine Lab', room: 'Machine Shop', faculty: 'Prof. B. Raut' },
      ],
      Thursday: [
        { time: '09:00 AM - 10:00 AM', code: 'MEC204', title: 'Manufacturing Processes I', room: 'Mech Block - Room 203', faculty: 'Prof. B. Raut' },
        { time: '10:00 AM - 11:00 AM', code: 'MEC201', title: 'Engineering Thermodynamics', room: 'Mech Block - Room 201', faculty: 'Dr. S. Chatterjee' },
      ],
      Friday: [
        { time: '09:00 AM - 10:00 AM', code: 'MEC203', title: 'Fluid Mechanics & Hydraulics', room: 'Mech Block - Room 202', faculty: 'Dr. N. Tripathi' },
        { time: '01:15 PM - 04:15 PM', code: 'MEL203', title: 'Fluid Mechanics & Turbines Lab', room: 'Hydraulics Lab', faculty: 'Dr. N. Tripathi' },
      ],
    },
    '3rd': {
      Monday: [
        { time: '09:00 AM - 10:00 AM', code: 'MEC301', title: 'Kinematics & Dynamics of Machinery', room: 'Mech Block 2 - Room 301', faculty: 'Dr. P. R. Rao' },
        { time: '10:00 AM - 11:00 AM', code: 'MEC302', title: 'Heat & Mass Transfer', room: 'Mech Block 2 - Room 301', faculty: 'Prof. S. K. Mahapatra' },
        { time: '11:15 AM - 12:15 PM', code: 'MEC303', title: 'Design of Machine Elements', room: 'Mech Block 2 - Room 302', faculty: 'Dr. U. N. Das' },
        { time: '01:15 PM - 04:15 PM', code: 'MEL301', title: 'Heat Transfer & IC Engines Lab', room: 'Thermal Engg Lab', faculty: 'Prof. S. K. Mahapatra' },
      ],
      Tuesday: [
        { time: '09:00 AM - 10:00 AM', code: 'MEC304', title: 'Metrology & Quality Control', room: 'Mech Block 2 - Room 305', faculty: 'Prof. G. Hegde' },
        { time: '10:00 AM - 11:00 AM', code: 'MEC305', title: 'IC Engines & Automobile Tech', room: 'Mech Block 2 - Room 303', faculty: 'Dr. S. Chatterjee' },
        { time: '11:15 AM - 12:15 PM', code: 'MEC301', title: 'Kinematics & Dynamics of Machinery', room: 'Mech Block 2 - Room 301', faculty: 'Dr. P. R. Rao' },
      ],
      Wednesday: [
        { time: '09:00 AM - 10:00 AM', code: 'MEC302', title: 'Heat & Mass Transfer', room: 'Mech Block 2 - Room 301', faculty: 'Prof. S. K. Mahapatra' },
        { time: '10:00 AM - 11:00 AM', code: 'MEC303', title: 'Design of Machine Elements', room: 'Mech Block 2 - Room 302', faculty: 'Dr. U. N. Das' },
        { time: '01:15 PM - 04:15 PM', code: 'MEL302', title: 'Kinematics & Dynamics Machines Lab', room: 'DOM Lab', faculty: 'Dr. P. R. Rao' },
      ],
      Thursday: [
        { time: '09:00 AM - 10:00 AM', code: 'MEC305', title: 'IC Engines & Automobile Tech', room: 'Mech Block 2 - Room 303', faculty: 'Dr. S. Chatterjee' },
        { time: '10:00 AM - 11:00 AM', code: 'MEC304', title: 'Metrology & Quality Control', room: 'Mech Block 2 - Room 305', faculty: 'Prof. G. Hegde' },
      ],
      Friday: [
        { time: '09:00 AM - 10:00 AM', code: 'MEC303', title: 'Design of Machine Elements', room: 'Mech Block 2 - Room 302', faculty: 'Dr. U. N. Das' },
        { time: '01:15 PM - 04:15 PM', code: 'MEL303', title: 'Metrology & Calibration Lab', room: 'Metrology Lab', faculty: 'Prof. G. Hegde' },
      ],
    },
    '4th': {
      Monday: [
        { time: '09:00 AM - 10:00 AM', code: 'MEC401', title: 'CAD/CAM/CIM & Robotics', room: 'Mech Block 3 - Room 401', faculty: 'Dr. T. Venkat' },
        { time: '10:00 AM - 11:00 AM', code: 'MEC402', title: 'Power Plant Engineering', room: 'Mech Block 3 - Room 401', faculty: 'Prof. R. Soman' },
        { time: '11:15 AM - 04:15 PM', code: 'PRJ401', title: 'Major Mechanical Capstone Project', room: 'Robotics Lab', faculty: 'Mech Review Panel' },
      ],
      Tuesday: [
        { time: '09:00 AM - 10:00 AM', code: 'MEC403', title: 'Mechatronics & Automation', room: 'Mech Block 3 - Room 402', faculty: 'Dr. A. Gokhale' },
        { time: '10:00 AM - 11:00 AM', code: 'MEC401', title: 'CAD/CAM/CIM & Robotics', room: 'Mech Block 3 - Room 401', faculty: 'Dr. T. Venkat' },
      ],
      Wednesday: [
        { time: '09:00 AM - 04:00 PM', code: 'PRJ401', title: 'Major Mechanical Industrial Prototype', room: 'Central Workshop Lab', faculty: 'Faculty Guides' },
      ],
      Thursday: [
        { time: '09:00 AM - 10:00 AM', code: 'MEC402', title: 'Power Plant Engineering', room: 'Mech Block 3 - Room 401', faculty: 'Prof. R. Soman' },
        { time: '10:00 AM - 11:00 AM', code: 'MEC403', title: 'Mechatronics & Automation', room: 'Mech Block 3 - Room 402', faculty: 'Dr. A. Gokhale' },
      ],
      Friday: [
        { time: '09:00 AM - 12:00 PM', code: 'SEM401', title: 'Industrial Safety & Plant Visits', room: 'Auditorium Hall C', faculty: 'Safety Officer' },
      ],
    },
  },
  ECE: {
    '3rd': {
      Monday: [
        { time: '09:00 AM - 10:00 AM', code: 'ECE301', title: 'Microprocessors & Microcontrollers', room: 'ECE Block 2 - Room 301', faculty: 'Dr. M. Chawla' },
        { time: '10:00 AM - 11:00 AM', code: 'ECE302', title: 'VLSI Design & Embedded Systems', room: 'ECE Block 2 - Room 301', faculty: 'Prof. S. Nambiar' },
        { time: '11:15 AM - 12:15 PM', code: 'ECE303', title: 'Digital Communication Systems', room: 'ECE Block 2 - Room 302', faculty: 'Dr. D. Bose' },
        { time: '01:15 PM - 04:15 PM', code: 'ECL301', title: 'Microcontroller & VLSI Lab', room: 'VLSI CAD Lab', faculty: 'Dr. M. Chawla' },
      ],
      Tuesday: [
        { time: '09:00 AM - 10:00 AM', code: 'ECE304', title: 'Electromagnetic Waves & Waveguides', room: 'ECE Block 2 - Room 305', faculty: 'Prof. K. Subramanian' },
        { time: '10:00 AM - 11:00 AM', code: 'ECE301', title: 'Microprocessors & Microcontrollers', room: 'ECE Block 2 - Room 301', faculty: 'Dr. M. Chawla' },
      ],
      Wednesday: [
        { time: '09:00 AM - 10:00 AM', code: 'ECE302', title: 'VLSI Design & Embedded Systems', room: 'ECE Block 2 - Room 301', faculty: 'Prof. S. Nambiar' },
        { time: '01:15 PM - 04:15 PM', code: 'ECL302', title: 'Digital Communication Lab', room: 'Comm Lab 2', faculty: 'Dr. D. Bose' },
      ],
      Thursday: [
        { time: '09:00 AM - 10:00 AM', code: 'ECE303', title: 'Digital Communication Systems', room: 'ECE Block 2 - Room 302', faculty: 'Dr. D. Bose' },
      ],
      Friday: [
        { time: '09:00 AM - 10:00 AM', code: 'ECE304', title: 'Electromagnetic Waves', room: 'ECE Block 2 - Room 305', faculty: 'Prof. K. Subramanian' },
      ],
    },
  },
  EEE: {
    '3rd': {
      Monday: [
        { time: '09:00 AM - 10:00 AM', code: 'EEE301', title: 'Electrical Machines II (AC Machines)', room: 'EEE Block 2 - Room 301', faculty: 'Prof. C. H. Reddi' },
        { time: '10:00 AM - 11:00 AM', code: 'EEE302', title: 'Power Systems Analysis & Protection', room: 'EEE Block 2 - Room 301', faculty: 'Dr. K. V. S. Murthy' },
        { time: '11:15 AM - 12:15 PM', code: 'EEE303', title: 'Control Systems Engineering', room: 'EEE Block 2 - Room 302', faculty: 'Dr. A. Nandi' },
        { time: '01:15 PM - 04:15 PM', code: 'EEL301', title: 'Power Electronics & Drives Lab', room: 'Power Elec Lab', faculty: 'Prof. S. R. Samant' },
      ],
      Tuesday: [
        { time: '09:00 AM - 10:00 AM', code: 'EEE304', title: 'Power Electronics & Drives', room: 'EEE Block 2 - Room 305', faculty: 'Prof. S. R. Samant' },
      ],
      Wednesday: [
        { time: '09:00 AM - 10:00 AM', code: 'EEE301', title: 'Electrical Machines II', room: 'EEE Block 2 - Room 301', faculty: 'Prof. C. H. Reddi' },
      ],
      Thursday: [
        { time: '09:00 AM - 10:00 AM', code: 'EEE302', title: 'Power Systems Analysis', room: 'EEE Block 2 - Room 301', faculty: 'Dr. K. V. S. Murthy' },
      ],
      Friday: [
        { time: '09:00 AM - 10:00 AM', code: 'EEE303', title: 'Control Systems Engineering', room: 'EEE Block 2 - Room 302', faculty: 'Dr. A. Nandi' },
      ],
    },
  },
  CIVIL: {
    '3rd': {
      Monday: [
        { time: '09:00 AM - 10:00 AM', code: 'CIV301', title: 'Structural Analysis I & II', room: 'Civil Block 2 - Room 301', faculty: 'Dr. S. K. Das' },
        { time: '10:00 AM - 11:00 AM', code: 'CIV302', title: 'Concrete Technology & Design', room: 'Civil Block 2 - Room 301', faculty: 'Prof. R. K. Behera' },
        { time: '11:15 AM - 12:15 PM', code: 'CIV303', title: 'Geotechnical & Soil Mechanics', room: 'Civil Block 2 - Room 302', faculty: 'Dr. A. B. Chaudhuri' },
        { time: '01:15 PM - 04:15 PM', code: 'CVL301', title: 'Geotechnical & Concrete Testing Lab', room: 'Soil Mechanics Lab', faculty: 'Dr. A. B. Chaudhuri' },
      ],
      Tuesday: [
        { time: '09:00 AM - 10:00 AM', code: 'CIV304', title: 'Transportation Engineering', room: 'Civil Block 2 - Room 305', faculty: 'Prof. S. S. Mohanty' },
      ],
      Wednesday: [
        { time: '09:00 AM - 10:00 AM', code: 'CIV301', title: 'Structural Analysis', room: 'Civil Block 2 - Room 301', faculty: 'Dr. S. K. Das' },
      ],
      Thursday: [
        { time: '09:00 AM - 10:00 AM', code: 'CIV302', title: 'Concrete Technology', room: 'Civil Block 2 - Room 301', faculty: 'Prof. R. K. Behera' },
      ],
      Friday: [
        { time: '09:00 AM - 10:00 AM', code: 'CIV303', title: 'Geotechnical Engineering', room: 'Civil Block 2 - Room 302', faculty: 'Dr. A. B. Chaudhuri' },
      ],
    },
  },
  IT: {
    '3rd': {
      Monday: [
        { time: '09:00 AM - 10:00 AM', code: 'ITN301', title: 'Computer Networks & Security', room: 'IT Block 2 - Room 301', faculty: 'Dr. S. K. Dey' },
        { time: '10:00 AM - 11:00 AM', code: 'ITN302', title: 'Software Testing & QA', room: 'IT Block 2 - Room 301', faculty: 'Prof. R. G. Shah' },
        { time: '11:15 AM - 12:15 PM', code: 'ITN303', title: 'Mobile Application Development', room: 'IT Block 2 - Room 302', faculty: 'Dr. M. S. Varma' },
        { time: '01:15 PM - 04:15 PM', code: 'ITL301', title: 'Mobile App & Security Lab', room: 'Mobile App Lab', faculty: 'Dr. M. S. Varma' },
      ],
      Tuesday: [
        { time: '09:00 AM - 10:00 AM', code: 'ITN304', title: 'Information & Cyber Security', room: 'IT Block 2 - Room 305', faculty: 'Prof. K. L. Narayana' },
      ],
      Wednesday: [
        { time: '09:00 AM - 10:00 AM', code: 'ITN301', title: 'Computer Networks & Security', room: 'IT Block 2 - Room 301', faculty: 'Dr. S. K. Dey' },
      ],
      Thursday: [
        { time: '09:00 AM - 10:00 AM', code: 'ITN302', title: 'Software Testing & QA', room: 'IT Block 2 - Room 301', faculty: 'Prof. R. G. Shah' },
      ],
      Friday: [
        { time: '09:00 AM - 10:00 AM', code: 'ITN303', title: 'Mobile Application Development', room: 'IT Block 2 - Room 302', faculty: 'Dr. M. S. Varma' },
      ],
    },
  },
};

const DEFAULT_SCHEDULE = [
  { time: '09:00 AM - 10:00 AM', code: 'CORE301', title: 'Department Core Course I', room: 'Main Lecture Hall 1', faculty: 'Dr. Senior Professor' },
  { time: '10:00 AM - 11:00 AM', code: 'CORE302', title: 'Department Core Course II', room: 'Main Lecture Hall 1', faculty: 'Prof. Department Head' },
  { time: '11:15 AM - 12:15 PM', code: 'ELE301', title: 'Specialization Professional Elective', room: 'Block 2 - Room 202', faculty: 'Dr. Guest Specialist' },
  { time: '01:15 PM - 04:15 PM', code: 'LAB301', title: 'Practical Hardware & Software Lab', room: 'Department Lab 1', faculty: 'Lab Faculty & TAs' },
];

export default function TimetableModal({ isOpen, onClose, userProfile }) {
  const branch = (userProfile?.branch || 'CSE').toUpperCase();
  const yearRaw = (userProfile?.current_year || '3rd').toString();
  const yearKey = yearRaw.includes('1') ? '1st' : yearRaw.includes('2') ? '2nd' : yearRaw.includes('4') ? '4th' : '3rd';

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const todayIndex = new Date().getDay(); // 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri
  const defaultDay = todayIndex >= 1 && todayIndex <= 5 ? days[todayIndex - 1] : 'Monday';

  const [selectedDay, setSelectedDay] = useState(defaultDay);

  if (!isOpen) return null;

  const branchData = TIMETABLE_DATA[branch] || TIMETABLE_DATA['CSE'];
  const yearData = branchData[yearKey] || branchData['3rd'] || branchData['1st'] || Object.values(branchData)[0];
  const daySchedule = yearData[selectedDay] || DEFAULT_SCHEDULE;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">Personalized Weekly Timetable</h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {branch} • {yearKey} Year
                </span>
              </div>
              <p className="text-xs text-slate-500">Student ID: {userProfile?.student_id || '23BCSE104'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg font-bold px-2 py-1 rounded-lg hover:bg-slate-200/60 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Day Selector Pills */}
        <div className="flex border-b border-slate-200 bg-slate-100/70 p-2 gap-1.5 overflow-x-auto">
          {days.map((d) => {
            const isSelected = selectedDay === d;
            return (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition cursor-pointer text-center whitespace-nowrap ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-white text-slate-600 hover:bg-slate-200/80 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {d}
              </button>
            );
          })}
        </div>

        {/* Schedule List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {selectedDay}'s Class Schedule ({daySchedule.length} Sessions)
            </span>
            <button
              onClick={() => window.print()}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Print Timetable
            </button>
          </div>

          {daySchedule.map((slot, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-200 transition shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold shrink-0 mt-0.5">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {slot.code}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{slot.title}</h4>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {slot.faculty}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {slot.room}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shrink-0 self-start sm:self-center">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>{slot.time}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
