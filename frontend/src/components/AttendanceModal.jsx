import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';

export default function AttendanceModal({ isOpen, onClose, userProfile }) {
  const [attendanceData, setAttendanceData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [simulatedAbsences, setSimulatedAbsences] = useState(2);

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
  const totalAttended =
    attendanceData?.overall_attended || classwise.reduce((acc, c) => acc + (c.attended || 0), 0);
  const totalConducted =
    attendanceData?.overall_conducted ||
    classwise.reduce((acc, c) => acc + (c.total_conducted || c.total || 0), 0);
  const overallPercentage = parseFloat(
    attendanceData?.overall_percentage ||
      (totalConducted > 0 ? ((totalAttended / totalConducted) * 100).toFixed(1) : '83.2')
  );

  const absences = Math.max(0, totalConducted - totalAttended);
  const safeMarginOverall = Math.max(
    0,
    Math.floor((totalAttended - 0.75 * totalConducted) / 0.75)
  );

  const isOverallSafe = overallPercentage >= 75.0;

  // Simulator calculation
  const simTotalConducted = totalConducted + simulatedAbsences;
  const simPercentage = (
    simTotalConducted > 0 ? (totalAttended / simTotalConducted) * 100 : overallPercentage
  ).toFixed(1);

  // SVG circular ring dash calculations (r=20, circumference=125.66)
  const circumference = 2 * Math.PI * 20;
  const strokeOffset = circumference - (overallPercentage / 100) * circumference;

  return (
    <div className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-space-md sm:p-space-lg">
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        className="bg-surface-container-lowest rounded-2xl max-w-5xl w-full p-space-lg shadow-2xl flex flex-col space-y-space-md max-h-[90vh] overflow-y-auto border border-surface-container"
      >
        {/* Top Header & Identity Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md pb-space-sm border-b border-surface-container">
          <div className="flex items-center gap-space-md">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary flex items-center justify-center font-headline-md text-headline-md font-semibold shadow-xs">
                {userProfile?.full_name
                  ? userProfile.full_name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()
                  : 'ST'}
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-tertiary-fixed-dim flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-tertiary"></span>
              </span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-space-xs">
                <span className="font-headline-md text-headline-md text-on-surface font-semibold">
                  {userProfile?.full_name || 'Student Attendance'}
                </span>
                <span className="font-code-sm text-code-sm px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-medium">
                  {userProfile?.student_id || '24CSE101'}
                </span>
              </div>
              <span className="font-label-md text-label-md text-on-surface-variant">
                {userProfile?.branch || 'CSE'} • {userProfile?.current_year || '1st'} Year • Official ERP Record
              </span>
            </div>
          </div>

          <div className="flex items-center gap-space-sm">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-label-md text-label-md shadow-2xs ${
                isOverallSafe
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isOverallSafe ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                }`}
              ></span>
              <span className="font-semibold">{overallPercentage}% Overall</span>
              <span className="text-outline text-[12px]">•</span>
              <span>{isOverallSafe ? 'Eligible for End-Sem (>75%)' : 'Shortage Alert (<75%)'}</span>
            </div>

            <button
              type="button"
              onClick={() => setShowSimulator(!showSimulator)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container text-primary text-label-md font-semibold transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">calculate</span>
              <span>{showSimulator ? 'Close Simulator' : 'Safe Bunk Simulator'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Safe Bunk Simulator Drawer if toggled */}
        <AnimatePresence>
          {showSimulator && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-surface-container-low rounded-xl p-space-md border border-surface-container-high"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                <div className="flex flex-col">
                  <span className="font-headline-sm text-headline-sm text-on-surface font-semibold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
                    Safe Bunk Margin Simulator
                  </span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Simulate how missing future classes will affect your mandatory 75% end-sem threshold.
                  </p>
                </div>

                <div className="flex items-center gap-space-md">
                  <div className="flex items-center gap-space-sm">
                    <label className="font-label-sm text-label-sm font-medium text-on-surface">Miss Classes:</label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setSimulatedAbsences(Math.max(0, simulatedAbsences - 1))}
                        className="w-7 h-7 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-bold cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-headline-sm text-on-surface font-bold">
                        {simulatedAbsences}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSimulatedAbsences(simulatedAbsences + 1)}
                        className="w-7 h-7 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-bold cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="p-space-xs px-3 bg-surface-container-lowest rounded-lg border border-surface-container flex items-center gap-2">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Projected:</span>
                    <span
                      className={`font-headline-sm text-headline-sm font-bold ${
                        parseFloat(simPercentage) >= 75 ? 'text-tertiary-container' : 'text-error'
                      }`}
                    >
                      {simPercentage}%
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      ({parseFloat(simPercentage) >= 75 ? 'Safe' : 'Debarred'})
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 4 KPI Metric Blocks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {/* KPI 1: Overall Percentage & Progress Ring */}
          <div className="relative overflow-hidden p-space-md rounded-xl bg-surface-container-low border border-surface-container-high flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                  Overall Aggregate
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="font-display-lg text-display-lg font-bold text-on-surface">
                    {overallPercentage}
                  </span>
                  <span className="font-headline-md text-headline-md text-primary font-bold">%</span>
                </div>
              </div>
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                  <circle
                    className="stroke-surface-container-high"
                    cx="24"
                    cy="24"
                    fill="none"
                    r="20"
                    strokeWidth="4"
                  />
                  <circle
                    className={isOverallSafe ? 'stroke-tertiary-container' : 'stroke-error'}
                    cx="24"
                    cy="24"
                    fill="none"
                    r="20"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeOffset}
                    strokeLinecap="round"
                    strokeWidth="4"
                  />
                </svg>
                <span
                  className={`material-symbols-outlined absolute text-[18px] ${
                    isOverallSafe ? 'text-tertiary-container' : 'text-error'
                  }`}
                >
                  {isOverallSafe ? 'verified' : 'warning'}
                </span>
              </div>
            </div>
            <div className="mt-space-md pt-space-xs flex items-center justify-between font-body-sm text-body-sm text-on-surface-variant">
              <span>
                Attended: <strong className="text-on-surface font-semibold">{totalAttended}</strong> /{' '}
                {totalConducted} Hrs
              </span>
              <span className={isOverallSafe ? 'text-tertiary font-medium' : 'text-error font-medium'}>
                {isOverallSafe ? `+${(overallPercentage - 75).toFixed(1)}% Buffer` : 'Below Cutoff'}
              </span>
            </div>
          </div>

          {/* KPI 2: Total Classes Conducted */}
          <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container-high flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                  Total Conducted
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="font-display-lg text-display-lg font-bold text-on-surface">
                    {totalConducted}
                  </span>
                  <span className="font-label-md text-label-md text-on-surface-variant font-medium">Hours</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[22px]">calendar_view_week</span>
              </div>
            </div>
            <div className="mt-space-md pt-space-xs font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              <span>Across {classwise.length} Academic Courses</span>
            </div>
          </div>

          {/* KPI 3: Absences Recorded */}
          <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container-high flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                  Absences Recorded
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="font-display-lg text-display-lg font-bold text-error">{absences}</span>
                  <span className="font-label-md text-label-md text-on-surface-variant font-medium">Hours</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-error-container/40 flex items-center justify-center text-error">
                <span className="material-symbols-outlined text-[22px]">person_off</span>
              </div>
            </div>
            <div className="mt-space-md pt-space-xs flex items-center justify-between font-body-sm text-body-sm">
              <span className="text-on-surface-variant">Medical Waiver: <strong className="text-on-surface">2 Approved</strong></span>
              <span className="px-2 py-0.5 rounded bg-surface-container font-label-sm text-label-sm text-primary">
                Synced
              </span>
            </div>
          </div>

          {/* KPI 4: Safe Bunk Margin Overall */}
          <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container-high flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                  Total Safe Margin
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="font-display-lg text-display-lg font-bold text-secondary">
                    {safeMarginOverall}
                  </span>
                  <span className="font-label-md text-label-md text-secondary font-medium">Classes Max</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[22px]">flight_takeoff</span>
              </div>
            </div>
            <div className="mt-space-md pt-space-xs font-body-sm text-body-sm text-on-surface-variant">
              <span>Without dropping aggregate below threshold (75%).</span>
            </div>
          </div>
        </div>

        {/* Subject-Wise Attendance Detail Roster */}
        <div className="flex flex-col gap-space-sm pt-space-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
            <div>
              <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                Course Attendance Roster
              </span>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Course-wise breakdown and safe absenteeism quotas
              </p>
            </div>
            <div className="flex items-center gap-space-sm text-label-sm font-label-sm">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-tertiary-container"></span>
                <span className="text-on-surface-variant">Safe (&gt;80%)</span>
              </div>
              <div className="flex items-center gap-1.5 ml-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="text-on-surface-variant">Borderline (75–80%)</span>
              </div>
              <div className="flex items-center gap-1.5 ml-2">
                <span className="w-2.5 h-2.5 rounded-full bg-error"></span>
                <span className="text-on-surface-variant">Critical (&lt;75%)</span>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[32px] text-primary animate-spin mb-2">sync</span>
              <p className="font-body-sm text-body-sm">Loading synchronized ERP attendance records...</p>
            </div>
          ) : classwise.length === 0 ? (
            <div className="text-center py-8 font-body-sm text-body-sm text-on-surface-variant">
              No course attendance records registered yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
              {classwise.map((course, idx) => {
                const attended = course.attended || 0;
                const total = course.total_conducted || course.total || 0;
                const percentage = parseFloat(
                  course.percentage || (total > 0 ? ((attended / total) * 100).toFixed(1) : '0')
                );
                const safeBunks = Math.max(0, Math.floor((attended - 0.75 * total) / 0.75));
                const neededClasses =
                  percentage < 75.0 ? Math.ceil((0.75 * total - attended) / 0.25) : 0;

                const isSafe = percentage >= 80.0;
                const isBorderline = percentage >= 75.0 && percentage < 80.0;

                return (
                  <div
                    key={course.course_code || idx}
                    className="p-space-md rounded-xl bg-surface-container-low border border-surface-container-high flex flex-col justify-between hover:border-primary-container transition-all shadow-2xs"
                  >
                    <div className="space-y-space-sm">
                      <div className="flex items-start justify-between gap-2">
                        <span className="px-2 py-0.5 rounded bg-surface-container font-code-sm text-code-sm text-primary font-bold">
                          {course.course_code || `SUB${idx + 1}`}
                        </span>
                        <span
                          className={`font-headline-sm text-headline-sm font-bold ${
                            isSafe
                              ? 'text-tertiary-container'
                              : isBorderline
                              ? 'text-amber-600'
                              : 'text-error'
                          }`}
                        >
                          {percentage}%
                        </span>
                      </div>

                      <div>
                        <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold leading-snug">
                          {course.course_name || course.title || 'Course Title'}
                        </h3>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                          {attended} of {total} Classes Attended
                        </p>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isSafe
                              ? 'bg-tertiary-container'
                              : isBorderline
                              ? 'bg-amber-500'
                              : 'bg-error'
                          }`}
                          style={{ width: `${Math.min(100, percentage)}%` }}
                        ></div>
                      </div>

                      {/* Status Pill */}
                      {isSafe ? (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 font-label-sm text-label-sm border border-emerald-200">
                          <span className="material-symbols-outlined text-[16px] text-emerald-600">
                            check_circle
                          </span>
                          <span>Safe to miss: <strong>{safeBunks} more classes</strong></span>
                        </div>
                      ) : isBorderline ? (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 font-label-sm text-label-sm border border-amber-200">
                          <span className="material-symbols-outlined text-[16px] text-amber-600">
                            warning
                          </span>
                          <span>Borderline: <strong>{safeBunks} safe bunk remaining</strong></span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-800 font-label-sm text-label-sm border border-rose-200">
                          <span className="material-symbols-outlined text-[16px] text-rose-600">
                            error
                          </span>
                          <span>Must attend next: <strong>{neededClasses} classes</strong></span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-space-sm pt-space-xs border-t border-surface-container">
          <button
            type="button"
            onClick={onClose}
            className="px-space-md py-2 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high font-label-md text-label-md cursor-pointer transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-space-md py-2 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Download Official Sheet</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
