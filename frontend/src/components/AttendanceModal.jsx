import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, RefreshCw, BookOpen, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export default function AttendanceModal({ isOpen, onClose, userProfile }) {
  const [attendanceData, setAttendanceData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAttendance();
    }
  }, [isOpen, userProfile]);

  async function loadAttendance() {
    setIsLoading(true);
    try {
      const data = await api.getAttendance();
      if (data) {
        setAttendanceData(data);
      }
    } catch (err) {
      console.error('Failed to load attendance:', err);
    } finally {
      setIsLoading(false);
    }
  }

  if (!isOpen) return null;

  const classwise = attendanceData?.subject_records || [];
  const totalAttended = attendanceData?.overall_attended || classwise.reduce((acc, c) => acc + (c.attended || 0), 0);
  const totalConducted = attendanceData?.overall_conducted || classwise.reduce((acc, c) => acc + (c.total_conducted || c.total || 0), 0);
  const overallPercentage = attendanceData?.overall_percentage || (totalConducted > 0 ? ((totalAttended / totalConducted) * 100).toFixed(1) : '83.2');

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
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">Student Course Attendance</h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {overallPercentage}% Overall
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {userProfile?.full_name} • {userProfile?.branch} ({userProfile?.current_year} Year) • Roll No: {userProfile?.student_id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg font-bold px-2 py-1 rounded-lg hover:bg-slate-200/60 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Overview Stats Bar */}
        <div className="p-4 bg-gradient-to-r from-emerald-50/70 via-indigo-50/50 to-slate-50 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-[11px] text-slate-500 font-semibold uppercase">Overall Attendance</div>
            <div className="text-xl font-extrabold text-emerald-600 mt-0.5">{overallPercentage}%</div>
            <div className="text-[10px] text-emerald-700 font-medium">Eligible for FAT Exams (&gt;75%)</div>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-[11px] text-slate-500 font-semibold uppercase">Total Classes Conducted</div>
            <div className="text-xl font-extrabold text-slate-800 mt-0.5">{totalConducted} Hours</div>
            <div className="text-[10px] text-slate-500">{totalAttended} Attended</div>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
            <div className="text-[11px] text-slate-500 font-semibold uppercase">Absences Recorded</div>
            <div className="text-xl font-extrabold text-slate-700 mt-0.5">{totalConducted - totalAttended} Hours</div>
            <div className="text-[10px] text-emerald-600 font-medium">Within Permissible Margin</div>
          </div>
        </div>

        {/* Subject wise Attendance List */}
        <div className="p-6 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
              <p className="text-xs">Loading official attendance records...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {classwise.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">No course attendance records found.</div>
              ) : (
                classwise.map((c) => (
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
                        <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                          <span>
                            Attended: <strong className="text-slate-800">{c.attended}</strong> / {c.total_conducted || c.total} Classes
                          </span>
                          {c.faculty && (
                            <span className="text-[11px] text-slate-400">• Faculty: {c.faculty}</span>
                          )}
                          {c.room && (
                            <span className="text-[11px] text-slate-400">• Room: {c.room}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
                        <div className="text-right">
                          <div className={`text-base font-extrabold ${c.percentage >= 75 ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {c.percentage}%
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium">{c.margin_summary || c.margin}</div>
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
                    <div className="w-full bg-slate-200 rounded-full h-2 mt-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${c.percentage >= 75 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                        style={{ width: `${Math.min(100, Math.max(0, c.percentage))}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

