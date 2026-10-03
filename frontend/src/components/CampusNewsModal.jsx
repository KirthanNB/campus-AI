import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { API_BASE } from '../services/api';

const NOTICES_DATA = [
  {
    id: 1,
    title: 'Google & Microsoft Off-Campus Internship & Capstone Placement Drive',
    category: 'Placements',
    date: 'Oct 03, 2026',
    isNew: true,
    summary: 'Registrations are now open for final & pre-final year students (6.5+ CGPA, 0 active backlogs). Super Dream CTC packages up to ₹42 LPA.',
    docRef: 'google_microsoft_placement_drive_2026.md',
  },
  {
    id: 2,
    title: 'Mid-Term Examination Schedule & Hall Ticket Clearance Released',
    category: 'Exams',
    date: 'Oct 02, 2026',
    isNew: true,
    summary: 'Mid-term examinations for all engineering branches commence next week. Hall tickets available on institutional student portal.',
    docRef: 'exam_schedule_CSE_3rdyr_2026.md',
  },
  {
    id: 3,
    title: 'Hostel Gate Curfew Timings & Biometric Turnstile Verification',
    category: 'Hostel',
    date: 'Oct 01, 2026',
    isNew: false,
    summary: 'Hostel Block A & Block B gate curfew is strictly enforced at 10:00 PM. Night out passes must be approved by Wardens by 6:00 PM.',
    docRef: 'hostel_and_campus_rules.md',
  },
  {
    id: 4,
    title: 'Annual Student Innovation & Project Expo - Cash Awards & Mentorship',
    category: 'Events',
    date: 'Sep 28, 2026',
    isNew: false,
    summary: 'Annual inter-college technology innovation and AI project exhibition. Submit project abstract and team proposals before Oct 15.',
    docRef: 'student_innovation_and_project_expo.md',
  },
  {
    id: 5,
    title: 'Academic & Tuition Fee Clearance Window Notice',
    category: 'Fees',
    date: 'Sep 25, 2026',
    isNew: false,
    summary: 'Semester tuition fee, digital library subscriptions, and lab consumable dues must be cleared before exam hall ticket issuance.',
    docRef: 'academic_policies_and_attendance.md',
  },
];

export default function CampusNewsModal({ isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');

  if (!isOpen) return null;

  const tags = ['All', 'Placements', 'Exams', 'Hostel', 'Events', 'Fees'];

  const filteredNotices = NOTICES_DATA.filter((notice) => {
    const matchesTag = selectedTag === 'All' || notice.category === selectedTag;
    const matchesSearch =
      notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.summary.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTag && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-space-md sm:p-space-lg">
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        className="bg-surface-container-lowest rounded-2xl max-w-3xl w-full p-space-lg shadow-2xl flex flex-col space-y-space-md max-h-[90vh] overflow-y-auto border border-surface-container"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-space-xs border-b border-surface-container">
          <div className="flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[24px]">campaign</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">
                  Official Campus Circulars
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm font-semibold">
                  Verified
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Direct deterministic notifications from Dean and Registrar Office
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

        {/* Search & Tag Filter */}
        <div className="flex flex-col sm:flex-row gap-space-sm">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[20px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search circulars, placement drives, exams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-3 rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md border border-surface-container outline-none focus:border-primary placeholder:text-outline"
            />
          </div>
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1.5 rounded-lg font-label-md text-label-md whitespace-nowrap transition-all cursor-pointer ${
                  selectedTag === tag
                    ? 'bg-primary-container text-on-primary font-semibold shadow-xs'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Notices List */}
        <div className="space-y-space-sm overflow-y-auto flex-1">
          {filteredNotices.length === 0 ? (
            <div className="text-center py-12 text-on-surface-variant font-body-sm text-body-sm">
              No matching circulars found.
            </div>
          ) : (
            filteredNotices.map((n) => (
              <div
                key={n.id}
                className="p-space-md rounded-xl bg-surface-container-low border border-surface-container hover:border-primary-fixed transition-all flex flex-col gap-space-xs shadow-2xs"
              >
                <div className="flex items-start justify-between gap-space-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-surface-container text-primary font-label-sm text-label-sm font-semibold">
                      {n.category}
                    </span>
                    {n.isNew && (
                      <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-tertiary font-label-sm text-label-sm font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
                        New
                      </span>
                    )}
                    <span className="font-code-sm text-code-sm text-on-surface-variant">{n.date}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      window.open(`${API_BASE}/documents/view/${encodeURIComponent(n.docRef)}`, '_blank')
                    }
                    className="flex items-center gap-1 text-primary hover:underline font-label-sm text-label-sm font-semibold cursor-pointer shrink-0"
                  >
                    <span>View Gazette</span>
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  </button>
                </div>

                <h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold leading-snug">
                  {n.title}
                </h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant">{n.summary}</p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-space-xs border-t border-surface-container flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-space-md py-2 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high font-label-md text-label-md cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
