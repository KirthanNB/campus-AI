import React, { useState, useEffect } from 'react';
import {
  FileText,
  CheckCircle2,
  Clock,
  MapPin,
  Send,
  AlertCircle,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';

export default function InteractiveTicketCard({
  category = "Hostel Maintenance",
  initialTitle = "",
  initialDescription = "",
  userProfile = {},
  onOpenGrievances,
  onSuccess
}) {
  const [ticketCategory, setTicketCategory] = useState(category);
  const [title, setTitle] = useState(initialTitle || "");
  const [description, setDescription] = useState(initialDescription || "");
  const [submitting, setSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialTitle) setTitle(initialTitle);
    if (initialDescription) setDescription(initialDescription);
    if (category) setTicketCategory(category);
  }, [initialTitle, initialDescription, category]);

  const handleOpenGrievancesHub = () => {
    if (onOpenGrievances) {
      onOpenGrievances();
    } else {
      window.dispatchEvent(new CustomEvent('open_grievances_modal'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError("Please fill out both the title and details.");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      const res = await api.createTicket({
        category: ticketCategory,
        title: title.trim(),
        description: description.trim(),
        location: userProfile.hostel_status || "Hostel Block B, Room 304",
        priority: "Medium"
      });
      setSubmittedTicket(res);
      window.dispatchEvent(new CustomEvent('ticket_submitted', { detail: res }));
      if (onSuccess) onSuccess(res);
    } catch (err) {
      setError(err.message || "Failed to submit ticket. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedTicket) {
    return (
      <div className="mt-4 p-5 rounded-2xl bg-white border border-slate-200 text-slate-800 shadow-md">
        {/* Success Header */}
        <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm mb-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <span>Ticket Submitted Successfully!</span>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200 mb-3">
          <div>
            <span className="text-slate-500 block text-[11px]">Tracking ID:</span>
            <span className="font-mono font-bold text-indigo-600 text-sm">{submittedTicket.ticket_number}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Status:</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              ● {submittedTicket.status}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Guaranteed SLA:</span>
            <span className="text-amber-700 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" /> {submittedTicket.estimated_sla}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Category:</span>
            <span className="text-slate-700 font-medium">{submittedTicket.category}</span>
          </div>
        </div>

        {/* Offline Option Notice */}
        {submittedTicket.offline_option && (
          <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-start gap-2 mb-3">
            <MapPin className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800">Offline Resolution Desk:</strong>
              <p className="text-slate-600 m-0 mt-0.5 leading-relaxed">{submittedTicket.offline_option}</p>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500 text-[11px]">Synced to your official Grievance Hub record.</span>
          <button
            type="button"
            onClick={handleOpenGrievancesHub}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5"
          >
            <span>View in Grievance Hub</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 p-5 rounded-2xl bg-white border border-slate-200 text-slate-800 shadow-md">
      {/* Header Banner */}
      <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm m-0">
              Campus Grievance Form
            </h4>
            <p className="text-[11px] text-slate-500 m-0">Pre-filled with your verified student profile</p>
          </div>
        </div>
        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
          Fast-Track Form
        </span>
      </div>

      {/* Pre-filled Student Context Chips */}
      <div className="flex flex-wrap gap-1.5 mb-3.5 text-xs">
        <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-medium">
          👤 {userProfile.full_name || "Student"} ({userProfile.student_id || "24CSE101"})
        </span>
        <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-medium">
          🎓 {userProfile.current_year || "1st"} Yr {userProfile.branch || "CSE"}
        </span>
        <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-medium">
          🏠 {userProfile.hostel_status || "Hostel Block B (Room 304)"}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Issue Category */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Issue Category</label>
          <select
            value={ticketCategory}
            onChange={(e) => setTicketCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
          >
            <option value="Hostel Maintenance">🏠 Hostel Maintenance (Wi-Fi, Electrical, Plumbing)</option>
            <option value="Mess Food Issue">🍲 Mess Food Quality & Hygiene</option>
            <option value="Academic Grievance">📚 Academic & Marks Grievance</option>
            <option value="General Campus">🏢 Campus Infrastructure & Security</option>
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Summary / Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Wi-Fi router offline in Room 304"
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Remarks</label>
          <textarea
            required
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what problem you are facing..."
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
          />
        </div>

        {/* Offline Option Notice */}
        <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-slate-700 flex items-start gap-2">
          <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <span>
            <strong>Offline Desk:</strong> You can also visit the <em>Hostel Caretaker Desk (Ground Floor Block B)</em> or <em>Admin Block 104</em> in person.
          </span>
        </div>

        {error && (
          <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-1.5 font-medium">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Action Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Submitting Ticket to University ERP...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Submit Official Ticket</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
