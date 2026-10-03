import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, Calendar, BookOpen, Clock, ShieldCheck, Sun, Filter } from 'lucide-react';

const CLASSWISE_ATTENDANCE = [
  { code: 'CSE301', title: 'Database Management Systems', attended: 28, total: 32, percentage: 87.5, status: 'Eligible', margin: 'Can miss 4 classes' },
  { code: 'CSE302', title: 'Operating Systems', attended: 26, total: 30, percentage: 86.6, status: 'Eligible', margin: 'Can miss 3 classes' },
  { code: 'CSE303', title: 'Design & Analysis of Algorithms', attended: 22, total: 28, percentage: 78.5, status: 'Eligible', margin: 'Can miss 1 class' },
  { code: 'CSE304', title: 'Artificial Intelligence & ML', attended: 19, total: 26, percentage: 73.0, status: 'Condonation Needed', margin: 'Must attend next 2 classes' },
  { code: 'CSE305', title: 'Computer Networks', attended: 24, total: 27, percentage: 88.8, status: 'Eligible', margin: 'Can miss 4 classes' },
];

const DAYWISE_LOG = [
  { date: '2026-10-02', day: 'Friday', slot: '09:00 AM - 10:00 AM', code: 'CSE303', title: 'Design & Analysis of Algorithms', status: 'Present' },
  { date: '2026-10-02', day: 'Friday', slot: '10:00 AM - 11:00 AM', code: 'CSE305', title: 'Computer Networks', status: 'Present' },
  { date: '2026-10-02', day: 'Friday', slot: '11:15 AM - 01:15 PM', code: 'CSL305', title: 'Networks Packet Simulation Lab', status: 'Present' },
  { date: '2026-10-01', day: 'Thursday', slot: '09:00 AM - 10:00 AM', code: 'CSE305', title: 'Computer Networks', status: 'Absent' },
  { date: '2026-10-01', day: 'Thursday', slot: '10:00 AM - 11:00 AM', code: 'CSE301', title: 'Database Management Systems', status: 'Present' },
  { date: '2026-10-01', day: 'Thursday', slot: '11:15 AM - 12:15 PM', code: 'CSE304', title: 'Artificial Intelligence & ML', status: 'Present' },
  { date: '2026-09-30', day: 'Wednesday', slot: '09:00 AM - 10:00 AM', code: 'CSE302', title: 'Operating Systems', status: 'Class Not Taken' },
  { date: '2026-09-30', day: 'Wednesday', slot: '10:00 AM - 11:00 AM', code: 'CSE303', title: 'Design & Analysis of Algorithms', status: 'Present' },
  { date: '2026-09-29', day: 'Tuesday', slot: '09:00 AM - 10:00 AM', code: 'CSE304', title: 'Artificial Intelligence & ML', status: 'Absent' },
  { date: '2026-09-28', day: 'Monday', slot: '09:00 AM - 04:00 PM', code: 'ALL', title: 'Gandhi Jayanti / University Holiday', status: 'Holiday' },
];

export default function AttendanceModal({ isOpen, onClose, userProfile }) {
  const [viewTab, setViewTab] = useState('classwise'); // 'classwise' or 'daywise'
  const [filterStatus, setFilterStatus] = useState('All');

  if (!isOpen) return null;

  const totalAttended = CLASSWISE_ATTENDANCE.reduce((acc, c) => acc + c.attended, 0);
  const totalConducted = CLASSWISE_ATTENDANCE.reduce((acc, c) => acc + c.total, 0);
  const overallPercentage = ((totalAttended / totalConducted) * 100).toFixed(1);

  const filteredDaywise = filterStatus === 'All' 
    ? DAYWISE_LOG 
    : DAYWISE_LOG.filter((d) => d.status === filterStatus);

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
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">Student Attendance Dashboard</h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {overallPercentage}% Overall
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {userProfile?.full_name} • {userProfile?.branch} ({userProfile?.current_year} Year)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg font-bold px-2 py-1 rounded-lg hover:bg-slate-200/60 transition"
          >
            ✕
          </button>
        </div>

        {/* Overview Stats Bar */}
        <div className="p-4 bg-gradient-to-r from-emerald-50/70 via-indigo-50/50 to-slate-50 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-[11px] text-slate-500 font-semibold uppercase">Overall Attendance</div>
            <div className="text-xl font-extrabold text-emerald-600 mt-0.5">{overallPercentage}%</div>
            <div className="text-[10px] text-emerald-700 font-medium">Eligible (&gt;75% Rule)</div>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-[11px] text-slate-500 font-semibold uppercase">Total Conducted</div>
            <div className="text-xl font-extrabold text-slate-800 mt-0.5">{totalConducted} Hours</div>
            <div className="text-[10px] text-slate-500">{totalAttended} Attended</div>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-[11px] text-slate-500 font-semibold uppercase">Absences Recorded</div>
            <div className="text-xl font-extrabold text-red-600 mt-0.5">{totalConducted - totalAttended} Hours</div>
            <div className="text-[10px] text-red-600 font-medium">Within Medical Limit</div>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-[11px] text-slate-500 font-semibold uppercase">Classes Not Taken</div>
            <div className="text-xl font-extrabold text-amber-600 mt-0.5">3 Hours</div>
            <div className="text-[10px] text-amber-600 font-medium">Faculty Duty Leave</div>
          </div>
        </div>

        {/* View Toggle Bar */}
        <div className="flex border-b border-slate-200 bg-slate-100/70 px-6 pt-2 justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setViewTab('classwise')}
              className={`py-2 px-4 text-xs font-semibold rounded-t-xl transition cursor-pointer ${
                viewTab === 'classwise'
                  ? 'bg-white text-indigo-600 border-t-2 border-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📚 Subject / Classwise Summary
            </button>
            <button
              onClick={() => setViewTab('daywise')}
              className={`py-2 px-4 text-xs font-semibold rounded-t-xl transition cursor-pointer ${
                viewTab === 'daywise'
                  ? 'bg-white text-indigo-600 border-t-2 border-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📅 Daywise Activity Log
            </button>
          </div>

          {viewTab === 'daywise' && (
            <div className="flex items-center gap-1 text-xs pb-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-2 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-medium focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Present">Present Only</option>
                <option value="Absent">Absent Only</option>
                <option value="Class Not Taken">Class Not Taken</option>
                <option value="Holiday">Holiday</option>
              </select>
            </div>
          )}
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {viewTab === 'classwise' ? (
            <div className="space-y-3">
              {CLASSWISE_ATTENDANCE.map((c) => (
                <div
                  key={c.code}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-indigo-200 transition shadow-2xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          {c.code}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">{c.title}</h4>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Attended: <strong className="text-slate-800">{c.attended}</strong> / {c.total} Classes
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
                      <div className="text-right">
                        <div className={`text-base font-extrabold ${c.percentage >= 75 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {c.percentage}%
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">{c.margin}</div>
                      </div>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                          c.percentage >= 75
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 rounded-full h-1.5 mt-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${c.percentage >= 75 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      style={{ width: `${c.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* DAYWISE LOG */
            <div className="space-y-2.5">
              {filteredDaywise.map((item, idx) => {
                let badgeClass = 'bg-slate-100 text-slate-700 border-slate-200';
                let icon = <Clock className="w-3.5 h-3.5" />;

                if (item.status === 'Present') {
                  badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
                } else if (item.status === 'Absent') {
                  badgeClass = 'bg-red-50 text-red-700 border-red-200';
                  icon = <XCircle className="w-3.5 h-3.5 text-red-500" />;
                } else if (item.status === 'Class Not Taken') {
                  badgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
                  icon = <AlertCircle className="w-3.5 h-3.5 text-amber-600" />;
                } else if (item.status === 'Holiday') {
                  badgeClass = 'bg-purple-50 text-purple-700 border-purple-200';
                  icon = <Sun className="w-3.5 h-3.5 text-purple-600" />;
                }

                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 transition shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-center font-mono shrink-0 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                        <div className="text-[10px] font-bold text-slate-500 uppercase">{item.day.slice(0, 3)}</div>
                        <div className="text-xs font-extrabold text-slate-800">{item.date.slice(8)}</div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-indigo-600">{item.code}</span>
                          <span className="text-xs font-bold text-slate-800">{item.title}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{item.slot}</span>
                        </div>
                      </div>
                    </div>

                    <span className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 shrink-0 self-start sm:self-center ${badgeClass}`}>
                      {icon}
                      <span>{item.status}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
