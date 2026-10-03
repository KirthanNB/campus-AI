import React, { useState } from 'react';
import { motion } from 'framer-motion';

const TIMETABLE_DATA = {
  CSE: {
    '1st': {
      Monday: [
        { time: '08:30 - 09:30 AM', code: 'CS102', title: 'Programming in C', room: 'Room 402 • Academic Block 2', faculty: 'Dr. S. Nair' },
        { time: '09:45 - 11:15 AM', code: 'MA102', title: 'Calculus & Linear Algebra', room: 'Lecture Hall Complex 3', faculty: 'Prof. R. Deshmukh' },
        { time: '11:30 AM - 12:30 PM', code: 'PH101', title: 'Engineering Physics', room: 'Block 1 • Room 101', faculty: 'Dr. A. K. Sharma' },
        { time: '02:00 - 04:00 PM', code: 'CSL101', title: 'C Programming Lab', room: 'Turing Computing Lab 01', faculty: 'Dr. S. Nair & TAs' },
      ],
      Tuesday: [
        { time: '08:30 - 09:30 AM', code: 'EE101', title: 'Basic Electrical Engg', room: 'Block 1 • Room 103', faculty: 'Prof. V. Gupta' },
        { time: '09:45 - 11:15 AM', code: 'MA102', title: 'Calculus & Linear Algebra', room: 'Block 1 • Room 101', faculty: 'Prof. R. Deshmukh' },
        { time: '11:30 AM - 12:30 PM', code: 'EN101', title: 'Technical Communication', room: 'Block 2 • Room 204', faculty: 'Prof. M. Kapoor' },
        { time: '02:00 - 04:00 PM', code: 'EED101', title: 'Engineering Drawing', room: 'CAD Studio 2', faculty: 'Prof. K. Verma' },
      ],
      Wednesday: [
        { time: '08:30 - 09:30 AM', code: 'CS102', title: 'Programming in C', room: 'Block 1 • Room 102', faculty: 'Dr. S. Nair' },
        { time: '09:45 - 11:15 AM', code: 'PH101', title: 'Engineering Physics', room: 'Block 1 • Room 101', faculty: 'Dr. A. K. Sharma' },
        { time: '02:00 - 04:00 PM', code: 'PHL101', title: 'Physics Lab', room: 'Physics Lab A', faculty: 'Dr. A. K. Sharma' },
      ],
      Thursday: [
        { time: '08:30 - 09:30 AM', code: 'CS201', title: 'DBMS Lecture', room: 'Room 402 • Academic Block 2', faculty: 'Prof. K. Raman' },
        { time: '09:45 - 11:15 AM', code: 'MA102', title: 'Linear Algebra', room: 'Lecture Hall Complex 3', faculty: 'Prof. R. Deshmukh' },
        { time: '02:00 - 04:00 PM', code: 'CSL101', title: 'C Programming Lab', room: 'Turing Computing Lab 01', faculty: 'Dr. S. Nair' },
      ],
      Friday: [
        { time: '08:30 - 09:30 AM', code: 'CS102', title: 'Programming in C', room: 'Block 1 • Room 102', faculty: 'Dr. S. Nair' },
        { time: '09:45 - 11:15 AM', code: 'EN101', title: 'Technical Communication', room: 'Block 2 • Room 204', faculty: 'Prof. M. Kapoor' },
        { time: '02:00 - 04:00 PM', code: 'CHL101', title: 'Chemistry Lab', room: 'Chemistry Lab 2', faculty: 'Dr. P. Sen' },
      ],
    },
    '2nd': {
      Monday: [
        { time: '08:30 - 09:30 AM', code: 'CS201', title: 'Data Structures & Algorithms', room: 'CS Block • Room 201', faculty: 'Dr. V. Ramanathan' },
        { time: '09:45 - 11:15 AM', code: 'CS202', title: 'Discrete Mathematics', room: 'CS Block • Room 201', faculty: 'Prof. S. Meenakshi' },
        { time: '02:00 - 04:00 PM', code: 'CSL201', title: 'Data Structures Lab', room: 'Database Lab 1', faculty: 'Dr. V. Ramanathan' },
      ],
      Tuesday: [
        { time: '08:30 - 09:30 AM', code: 'CS204', title: 'Computer Architecture', room: 'CS Block • Room 203', faculty: 'Prof. T. Reddy' },
        { time: '09:45 - 11:15 AM', code: 'CS201', title: 'Data Structures & Algorithms', room: 'CS Block • Room 201', faculty: 'Dr. V. Ramanathan' },
      ],
      Wednesday: [
        { time: '08:30 - 09:30 AM', code: 'CS203', title: 'Object Oriented Java', room: 'CS Block • Room 202', faculty: 'Dr. K. Swaminathan' },
        { time: '02:00 - 04:00 PM', code: 'CSL202', title: 'Java OOP Lab', room: 'Java Lab 2', faculty: 'Dr. K. Swaminathan' },
      ],
      Thursday: [
        { time: '08:30 - 09:30 AM', code: 'CS201', title: 'Data Structures & Algorithms', room: 'CS Block • Room 201', faculty: 'Dr. V. Ramanathan' },
        { time: '09:45 - 11:15 AM', code: 'CS202', title: 'Discrete Mathematics', room: 'CS Block • Room 201', faculty: 'Prof. S. Meenakshi' },
      ],
      Friday: [
        { time: '08:30 - 09:30 AM', code: 'CS204', title: 'Computer Architecture', room: 'CS Block • Room 203', faculty: 'Prof. T. Reddy' },
        { time: '11:15 AM - 01:15 PM', code: 'CSL203', title: 'Hardware Lab', room: 'Logic Lab A', faculty: 'Prof. T. Reddy' },
      ],
    },
  },
  ECE: {
    '1st': {
      Monday: [
        { time: '08:30 - 09:30 AM', code: 'EC101', title: 'Electronic Devices & Circuits', room: 'ECE Block • Room 102', faculty: 'Dr. P. Raman' },
        { time: '09:45 - 11:15 AM', code: 'MA102', title: 'Engineering Mathematics I', room: 'Main Block • Hall 1', faculty: 'Prof. R. Deshmukh' },
      ],
      Tuesday: [
        { time: '08:30 - 09:30 AM', code: 'EE101', title: 'Signals & Systems Intro', room: 'ECE Block • Room 104', faculty: 'Dr. M. Iyer' },
      ],
      Wednesday: [
        { time: '08:30 - 09:30 AM', code: 'EC101', title: 'Electronic Devices', room: 'ECE Block • Room 102', faculty: 'Dr. P. Raman' },
      ],
      Thursday: [
        { time: '08:30 - 09:30 AM', code: 'MA102', title: 'Engineering Mathematics', room: 'Main Block • Hall 1', faculty: 'Prof. R. Deshmukh' },
      ],
      Friday: [
        { time: '08:30 - 09:30 AM', code: 'EC102', title: 'Network Theory', room: 'ECE Block • Room 103', faculty: 'Prof. G. Prasad' },
      ],
    },
    '2nd': {
      Monday: [
        { time: '08:30 - 09:30 AM', code: 'EC201', title: 'Analog Circuits', room: 'ECE Block • Room 201', faculty: 'Dr. P. Raman' },
        { time: '09:45 - 11:15 AM', code: 'EC202', title: 'Electromagnetic Fields', room: 'ECE Block • Room 201', faculty: 'Prof. S. Sundaram' },
      ],
      Tuesday: [
        { time: '08:30 - 09:30 AM', code: 'EC203', title: 'Digital Signal Processing', room: 'ECE Block • Room 203', faculty: 'Dr. K. Narayanan' },
      ],
      Wednesday: [
        { time: '08:30 - 09:30 AM', code: 'EC201', title: 'Analog Circuits', room: 'ECE Block • Room 201', faculty: 'Dr. P. Raman' },
      ],
      Thursday: [
        { time: '08:30 - 09:30 AM', code: 'EC202', title: 'Electromagnetic Fields', room: 'ECE Block • Room 201', faculty: 'Prof. S. Sundaram' },
      ],
      Friday: [
        { time: '08:30 - 09:30 AM', code: 'EC203', title: 'DSP Lab', room: 'DSP Lab 1', faculty: 'Dr. K. Narayanan' },
      ],
    },
  },
  MECH: {
    '1st': {
      Monday: [
        { time: '08:30 - 09:30 AM', code: 'ME101', title: 'Engineering Mechanics', room: 'Mech Block • Hall 1', faculty: 'Dr. H. K. Rao' },
        { time: '09:45 - 11:15 AM', code: 'MA102', title: 'Engineering Mathematics', room: 'Main Block • Hall 2', faculty: 'Prof. R. Deshmukh' },
      ],
      Tuesday: [
        { time: '08:30 - 09:30 AM', code: 'ME102', title: 'Thermodynamics', room: 'Mech Block • Room 102', faculty: 'Prof. R. Sengupta' },
      ],
      Wednesday: [
        { time: '08:30 - 09:30 AM', code: 'ME101', title: 'Engineering Mechanics', room: 'Mech Block • Hall 1', faculty: 'Dr. H. K. Rao' },
      ],
      Thursday: [
        { time: '08:30 - 09:30 AM', code: 'ME102', title: 'Thermodynamics', room: 'Mech Block • Room 102', faculty: 'Prof. R. Sengupta' },
      ],
      Friday: [
        { time: '08:30 - 09:30 AM', code: 'MED101', title: 'Engineering Drawing Lab', room: 'Drawing Hall B', faculty: 'Prof. T. Joshi' },
      ],
    },
    '3rd': {
      Monday: [
        { time: '08:30 - 09:30 AM', code: 'ME301', title: 'Heat & Mass Transfer', room: 'Mech Block • Room 301', faculty: 'Dr. B. K. Mishra' },
        { time: '09:45 - 11:15 AM', code: 'ME302', title: 'Design of Machine Elements', room: 'Mech Block • Room 302', faculty: 'Prof. S. Chakraborty' },
      ],
      Tuesday: [
        { time: '08:30 - 09:30 AM', code: 'ME303', title: 'Fluid Mechanics II', room: 'Mech Block • Room 301', faculty: 'Dr. H. K. Rao' },
      ],
      Wednesday: [
        { time: '08:30 - 09:30 AM', code: 'ME301', title: 'Heat & Mass Transfer', room: 'Mech Block • Room 301', faculty: 'Dr. B. K. Mishra' },
      ],
      Thursday: [
        { time: '08:30 - 09:30 AM', code: 'ME302', title: 'Design of Machine Elements', room: 'Mech Block • Room 302', faculty: 'Prof. S. Chakraborty' },
      ],
      Friday: [
        { time: '08:30 - 09:30 AM', code: 'MEL301', title: 'Thermal Engg Lab', room: 'Thermal Lab', faculty: 'Dr. B. K. Mishra' },
      ],
    },
  },
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function TimetableModal({ isOpen, onClose, userProfile }) {
  const branch = userProfile?.branch || 'CSE';
  const rawYear = userProfile?.current_year || '1st';
  const cleanYear = rawYear.includes('1')
    ? '1st'
    : rawYear.includes('2')
    ? '2nd'
    : rawYear.includes('3')
    ? '3rd'
    : '1st';

  const [selectedDay, setSelectedDay] = useState(() => {
    const todayIndex = new Date().getDay(); // 0 is Sun, 1 is Mon...
    if (todayIndex >= 1 && todayIndex <= 5) return DAYS[todayIndex - 1];
    return 'Monday';
  });

  if (!isOpen) return null;

  const branchData = TIMETABLE_DATA[branch] || TIMETABLE_DATA.CSE;
  const yearData = branchData[cleanYear] || branchData['1st'] || TIMETABLE_DATA.CSE['1st'];
  const daySchedule = yearData[selectedDay] || [];

  return (
    <div className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-end">
      <motion.div
        initial={{ x: '100%', opacity: 0.5 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0.5 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="bg-surface-container-lowest h-full max-w-lg w-full p-space-lg shadow-2xl flex flex-col space-y-space-md overflow-y-auto border-l border-surface-container"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-space-xs border-b border-surface-container">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">calendar_today</span>
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">
                Timetable &amp; Schedule
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {branch} • {cleanYear} Year • Synchronized ERP Slot
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Day of Week Selector */}
        <div className="grid grid-cols-5 gap-1 p-1 bg-surface-container rounded-xl">
          {DAYS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setSelectedDay(d)}
              className={`py-1.5 text-center rounded-lg font-label-md text-label-md transition-all cursor-pointer ${
                selectedDay === d
                  ? 'bg-surface-container-lowest text-primary font-semibold shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {d.slice(0, 3)}
            </button>
          ))}
        </div>

        {/* Selected Day Banner */}
        <div className="flex items-center justify-between p-space-sm bg-surface-container-low rounded-xl border border-surface-container">
          <div>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">
              Academic Day
            </span>
            <div className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              {selectedDay} Schedule
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold shadow-2xs">
            {branch} Slot A
          </span>
        </div>

        {/* Timeline Slots */}
        <div className="space-y-space-sm relative before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-surface-container-high flex-1">
          {daySchedule.length === 0 ? (
            <div className="text-center py-8 font-body-sm text-body-sm text-on-surface-variant pl-7">
              No classes scheduled for this day. Free study slot!
            </div>
          ) : (
            daySchedule.map((slot, idx) => (
              <div key={idx} className="relative pl-7">
                <div className="absolute left-1.5 top-2 w-3 h-3 rounded-full bg-primary ring-4 ring-surface-container-lowest"></div>
                <div className="p-space-sm rounded-xl bg-surface-container-low border border-surface-container flex flex-col gap-0.5 hover:border-primary-fixed transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-code-sm text-code-sm text-primary font-semibold">
                      {slot.time}
                    </span>
                    <span className="font-code-sm text-code-sm px-1.5 py-0.2 rounded bg-surface-container text-on-surface-variant font-medium">
                      {slot.code}
                    </span>
                  </div>
                  <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    {slot.title}
                  </span>
                  <div className="flex items-center justify-between font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    <span>{slot.room}</span>
                    <span className="text-xs">{slot.faculty}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-space-md border-t border-surface-container">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            Close Drawer
          </button>
        </div>
      </motion.div>
    </div>
  );
}
