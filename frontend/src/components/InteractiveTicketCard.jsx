import React, { useState, useEffect } from 'react';
import {
  FileText,
  CheckCircle,
  Clock,
  MapPin,
  Send,
  Building,
  AlertCircle,
  Loader2,
  ShieldAlert
} from 'lucide-react';
import { api } from '../services/api';

export default function InteractiveTicketCard({
  category = "Hostel Maintenance",
  initialTitle = "",
  initialDescription = "",
  userProfile = {},
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
      <div className="mt-4 p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 text-emerald-100 shadow-lg">
        <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm mb-3">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span>Ticket Submitted Successfully!</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/60 p-3 rounded-xl border border-emerald-500/20 mb-3">
          <div>
            <span className="text-slate-400 block">Tracking ID:</span>
            <span className="font-mono font-bold text-emerald-300 text-sm">{submittedTicket.ticket_number}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Status:</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300">
              ● {submittedTicket.status}
            </span>
          </div>
          <div className="mt-1">
            <span className="text-slate-400 block">Guaranteed SLA:</span>
            <span className="text-amber-300 font-medium flex items-center gap-1">
              <Clock className="w-3 h-3" /> {submittedTicket.estimated_sla}
            </span>
          </div>
          <div className="mt-1">
            <span className="text-slate-400 block">Category:</span>
            <span className="text-slate-200">{submittedTicket.category}</span>
          </div>
        </div>

        {submittedTicket.offline_option && (
          <div className="text-[11px] text-slate-300 bg-slate-900/40 p-2.5 rounded-lg border border-slate-700/50 flex items-start gap-2 mb-3">
            <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200">Offline Care Desk Option:</strong>
              <p className="text-slate-400 m-0">{submittedTicket.offline_option}</p>
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between text-xs">
          <span className="text-slate-400">Synced to your official Grievances record.</span>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('open_grievances_modal'))}
            className="px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-500/30 font-semibold cursor-pointer transition"
          >
            View in Grievance Hub →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 text-slate-100 shadow-xl">
      {/* Header Banner */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-indigo-500/20">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-white text-xs sm:text-sm m-0">
              Fast-Track Campus Grievance Form
            </h4>
            <p className="text-[10px] text-indigo-300 m-0">Pre-filled with your verified student profile</p>
          </div>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
          In-Chat Action
        </span>
      </div>

      {/* Pre-filled Student Context Chips */}
      <div className="flex flex-wrap gap-1.5 mb-3.5 text-[10px]">
        <span className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700 text-slate-300">
          👤 {userProfile.full_name || "Student"} ({userProfile.student_id || "24CSE101"})
        </span>
        <span className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700 text-slate-300">
          🎓 {userProfile.current_year || "1st"} Yr {userProfile.branch || "CSE"}
        </span>
        <span className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700 text-slate-300">
          🏠 {userProfile.hostel_status || "Hostel Block B (Room 304)"}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Issue Category */}
        <div>
          <label className="block text-[11px] font-medium text-slate-300 mb-1">Issue Category</label>
          <select
            value={ticketCategory}
            onChange={(e) => setTicketCategory(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="Hostel Maintenance">🏠 Hostel Maintenance (Wi-Fi, Electrical, Plumbing)</option>
            <option value="Mess Food Issue">🍲 Mess Food Quality & Hygiene</option>
            <option value="Academic Grievance">📚 Academic & Marks Grievance</option>
            <option value="General Campus">🏢 Campus Infrastructure & Security</option>
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block text-[11px] font-medium text-slate-300 mb-1">Summary / Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Wi-Fi router offline in room 304"
            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-[11px] font-medium text-slate-300 mb-1">Detailed Remarks</label>
          <textarea
            required
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what problem you are facing..."
            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Offline Option Notice */}
        <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/20 text-[11px] text-indigo-200 flex items-start gap-2">
          <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
          <span>
            <strong>Offline Desk:</strong> You can also visit the <em>Hostel Caretaker Desk (Ground Floor Block B)</em> or <em>Admin Block 104</em> in person.
          </span>
        </div>

        {error && (
          <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Action Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-xs shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Submitting Ticket to University ERP...</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Submit Official Ticket</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
