import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Plus, CheckCircle2, Clock, MapPin, Send, Loader2, FileText, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';

export default function GrievancesModal({ isOpen, onClose, userProfile, onTicketCreated }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'new'
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    category: 'Hostel Maintenance',
    title: '',
    description: '',
    location: userProfile?.hostel_status || '',
    priority: 'Medium',
  });

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const data = await (api.getMyTickets ? api.getMyTickets() : api.getTickets());
      setTickets(data || []);
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTickets();
      if (userProfile?.hostel_status) {
        setFormData((prev) => ({ ...prev, location: userProfile.hostel_status }));
      }
    }
    window.addEventListener('ticket_submitted', fetchTickets);
    return () => {
      window.removeEventListener('ticket_submitted', fetchTickets);
    };
  }, [isOpen, userProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      const newTicket = await api.createTicket(formData);
      setSuccessMsg(`Ticket ${newTicket.ticket_number} created successfully!`);
      setFormData({
        category: 'Hostel Maintenance',
        title: '',
        description: '',
        location: userProfile?.hostel_status || '',
        priority: 'Medium',
      });
      await fetchTickets();
      setActiveTab('list');
      if (onTicketCreated) onTicketCreated();
    } catch (err) {
      setError(err.message || 'Failed to submit grievance. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Student Grievance & Maintenance Portal</h3>
              <p className="text-xs text-slate-500">Track status or register campus complaints</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg font-bold px-2 py-1 rounded-lg hover:bg-slate-200/60 transition"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-100/70 px-6 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('list')}
            className={`py-2 px-4 text-xs font-semibold rounded-t-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'list'
                ? 'bg-white text-indigo-600 border-t-2 border-indigo-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            My Filed Grievances ({tickets.length})
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className={`py-2 px-4 text-xs font-semibold rounded-t-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'new'
                ? 'bg-white text-indigo-600 border-t-2 border-indigo-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            Raise New Grievance
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {activeTab === 'list' ? (
            loading ? (
              <div className="py-12 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                <span>Fetching your grievance tickets...</span>
              </div>
            ) : tickets.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs flex flex-col items-center">
                <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
                <p className="font-semibold text-slate-700">No active grievances filed yet.</p>
                <p className="text-slate-400 mt-1 max-w-sm">
                  If you face hostel repairs, mess food issues, or academic grievances, click "Raise New Grievance".
                </p>
                <button
                  onClick={() => setActiveTab('new')}
                  className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
                >
                  + File First Complaint
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {tickets.map((t) => (
                  <div key={t.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-indigo-200 transition shadow-2xs">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                            {t.ticket_number}
                          </span>
                          <span className="text-xs font-bold text-slate-800">{t.title}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{t.description}</p>
                      </div>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 border ${
                          t.status === 'Resolved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : t.status === 'In Progress'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        <span>SLA: <strong className="text-slate-700">{t.estimated_sla}</strong></span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="truncate">Loc: <strong className="text-slate-700">{t.location || 'Campus'}</strong></span>
                      </div>
                      <div className="text-right text-slate-400 font-mono">
                        {new Date(t.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    {t.offline_option && (
                      <div className="mt-2 text-[11px] text-slate-500 bg-white p-2 rounded-lg border border-slate-200">
                        🏢 <strong>Offline Resolution Desk:</strong> {t.offline_option}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          ) : (
            /* NEW TICKET FORM */
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Grievance Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs font-medium focus:border-indigo-600 focus:outline-none"
                  >
                    <option value="Hostel Maintenance">Hostel Maintenance (Electrical/Plumbing)</option>
                    <option value="Mess Food Issue">Mess Food Quality / Sanitation</option>
                    <option value="Academic Grievance">Academic & Examination Policy</option>
                    <option value="General Campus">General Campus Facilities</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Priority Level
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs font-medium focus:border-indigo-600 focus:outline-none"
                  >
                    <option value="Low">Low - General Feedback</option>
                    <option value="Medium">Medium - Standard Repair (24-48h)</option>
                    <option value="High">High - Urgent Breakdown</option>
                    <option value="Urgent">Urgent - Emergency</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Issue Title / Subject *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fan not working in Room 304"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Detailed Description *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Provide details about the issue..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Specific Location (Room/Block)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hostel Block B, Room 304"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Submit Grievance Ticket
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
