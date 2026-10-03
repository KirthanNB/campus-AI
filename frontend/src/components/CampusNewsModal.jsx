import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, FileText, ExternalLink, Sparkles, Search, Calendar, Tag, ShieldCheck } from 'lucide-react';

const NOTICES_DATA = [
  {
    id: 1,
    title: '🚀 Google & Microsoft Off-Campus Internship & Capstone Placement Drive 2026',
    category: 'Placements',
    date: 'Oct 03, 2026',
    isNew: true,
    summary: 'Registrations are now open for final & pre-final year students (6.5+ CGPA, 0 active backlogs). Super Dream CTC packages up to ₹42 LPA.',
    docRef: 'google_microsoft_placement_drive_2026.md',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    id: 2,
    title: '📢 CAT-1 Autumn Semester Mid-Term Examination Schedule Released',
    category: 'Exams',
    date: 'Oct 02, 2026',
    isNew: true,
    summary: 'CAT-1 examinations for all engineering branches commence from Oct 10, 2026. Hall tickets available on student portal.',
    docRef: 'exam_schedule_CSE_3rdyr_2026.md',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    id: 3,
    title: '⚠️ Hostel Gate Curfew Timings & Biometric Entry Notice',
    category: 'Hostel',
    date: 'Oct 01, 2026',
    isNew: false,
    summary: 'Hostel Block A & Block B gate curfew is strictly enforced at 10:00 PM. Night out passes must be approved by Wardens by 6:00 PM.',
    docRef: 'hostel_and_campus_rules.md',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    id: 4,
    title: '🏆 Annual Student Innovation & Project Expo - Cash Prizes worth ₹5 Lakhs',
    category: 'Events',
    date: 'Sep 28, 2026',
    isNew: false,
    summary: 'Annual inter-college technology innovation and AI project exhibition. Submit team proposals before Oct 15.',
    docRef: 'student_innovation_and_project_expo.md',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  {
    id: 5,
    title: '💰 Academic & Tuition Fee Installment Deadline Notice',
    category: 'Fees',
    date: 'Sep 25, 2026',
    isNew: false,
    summary: 'Even semester tuition fee, digital library, and lab consumable dues must be cleared before exam hall ticket issuance.',
    docRef: 'academic_policies_and_attendance.md',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
  },
];

export default function CampusNewsModal({ isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');

  if (!isOpen) return null;

  const categories = ['All', 'Placements', 'Exams', 'Hostel', 'Events', 'Fees'];

  const filteredNotices = NOTICES_DATA.filter((item) => {
    const matchesTag = selectedTag === 'All' || item.category === selectedTag;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.summary.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTag && matchesSearch;
  });

  const openDocument = (docRef) => {
    window.open(`http://127.0.0.1:8000/api/documents/view/${docRef}`, '_blank');
  };

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
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">Campus Latest News & Admin Circulars</h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  Live Feed
                </span>
              </div>
              <p className="text-xs text-slate-500">Official notices dropped by Administration & Dean Offices</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg font-bold px-2 py-1 rounded-lg hover:bg-slate-200/60 transition"
          >
            ✕
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="p-4 bg-slate-100/70 border-b border-slate-200 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search circulars, placement drives, exam notices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedTag(cat)}
                className={`py-1 px-3 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 ${
                  selectedTag === cat
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-200/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Circular List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {filteredNotices.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No notices match your search or filter.
            </div>
          ) : (
            filteredNotices.map((n) => (
              <div
                key={n.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-200 transition shadow-2xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${n.badgeColor}`}>
                        {n.category}
                      </span>
                      {n.isNew && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-50 text-red-600 border border-red-200 flex items-center gap-1 animate-pulse">
                          <Sparkles className="w-3 h-3 text-red-500" />
                          NEW
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {n.date}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mt-1.5">{n.title}</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.summary}</p>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Verified Official Admin Document</span>
                  </div>
                  <button
                    onClick={() => openDocument(n.docRef)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    <span>View Official Circular</span>
                    <ExternalLink className="w-3 h-3 text-indigo-500" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
