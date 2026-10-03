import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function InteractiveTicketCard({
  category = 'Hostel Maintenance',
  initialTitle = '',
  initialDescription = '',
  userProfile = {},
  onOpenGrievances,
  onSuccess,
}) {
  const [ticketCategory, setTicketCategory] = useState(category);
  const [title, setTitle] = useState(initialTitle || '');
  const [description, setDescription] = useState(initialDescription || '');
  const [submitting, setSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [error, setError] = useState('');
  const [isResolved, setIsResolved] = useState(false);
  const [isEscalated, setIsEscalated] = useState(false);

  useEffect(() => {
    if (initialTitle) setTitle(initialTitle);
    if (initialDescription) setDescription(initialDescription);
    if (category) setTicketCategory(category);
  }, [initialTitle, initialDescription, category]);

  const handleEscalate = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await api.createTicket({
        category: ticketCategory,
        title: title || 'Urgent Grievance Escalation',
        description: description || 'Priority escalation requested via active copilot conversation.',
        location: userProfile?.hostel_status || 'Hostel Campus',
        priority: 'Critical',
      });
      setSubmittedTicket(res);
      setIsEscalated(true);
      window.dispatchEvent(new CustomEvent('ticket_submitted'));
      if (onSuccess) onSuccess(res);
    } catch (err) {
      setError(err.message || 'Failed to dispatch ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolve = () => {
    setIsResolved(true);
  };

  if (isResolved) {
    return (
      <div className="rounded-xl bg-surface-container p-space-sm border border-surface-container-high opacity-60 flex items-center justify-between">
        <span className="font-label-md text-label-md text-on-surface flex items-center gap-1.5">
          <span className="material-symbols-outlined text-tertiary-container text-[18px]">check_circle</span>
          Grievance inquiry marked as resolved by student.
        </span>
        <button
          type="button"
          onClick={() => setIsResolved(false)}
          className="text-primary font-label-sm text-label-sm hover:underline cursor-pointer"
        >
          Undo
        </button>
      </div>
    );
  }

  if (submittedTicket || isEscalated) {
    return (
      <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-space-md flex flex-col gap-space-xs text-emerald-900 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-headline-sm text-headline-sm font-semibold">
            <span className="material-symbols-outlined text-emerald-700 text-[20px]">verified</span>
            <span>Ticket Escalated: {submittedTicket?.ticket_number || '#HSTL-DISPATCH'}</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800 font-code-sm text-code-sm font-semibold">
            SLA: 24 Hours
          </span>
        </div>
        <p className="font-body-sm text-body-sm text-emerald-800">
          Your ticket has been dispatched to <strong>Dean of Infrastructure &amp; IT Cell</strong>.
          Turnaround SLA is strictly monitored.
        </p>
        <div className="flex justify-end pt-space-xs">
          <button
            type="button"
            onClick={onOpenGrievances}
            className="text-emerald-800 hover:text-emerald-950 font-label-md text-label-md font-semibold underline flex items-center gap-1 cursor-pointer"
          >
            <span>View in Grievance Redressal Portal</span>
            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-gradient-to-r from-surface-container to-surface-container-high p-space-md flex flex-col space-y-space-sm border border-surface-container shadow-inner">
      <div className="flex items-start justify-between gap-space-sm">
        <div className="flex items-center gap-space-xs">
          <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-on-secondary shrink-0">
            <span className="material-symbols-outlined text-[16px]">priority_high</span>
          </div>
          <div>
            <h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              Grievance Quick-Action Card
            </h4>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              {title || `${ticketCategory} Issue`} • {userProfile?.hostel_status || 'Hostel Campus'}
            </span>
          </div>
        </div>
        <span className="font-code-sm text-code-sm text-on-surface-variant shrink-0 bg-surface-container-lowest px-2 py-0.5 rounded">
          SLA Monitored
        </span>
      </div>

      {error && <div className="text-error font-body-sm text-body-sm">{error}</div>}

      <div className="flex flex-wrap items-center gap-space-sm pt-space-xs">
        <button
          type="button"
          disabled={submitting}
          onClick={handleEscalate}
          className="px-space-md py-2 rounded-lg bg-secondary text-on-secondary hover:brightness-105 font-label-md text-label-md font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[18px]">
            {submitting ? 'sync' : 'bolt'}
          </span>
          <span>{submitting ? 'Escalating...' : 'Confirm & Escalate Priority'}</span>
        </button>

        <button
          type="button"
          onClick={handleResolve}
          className="px-space-md py-2 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container font-label-md text-label-md font-medium transition-colors shadow-2xs border border-surface-container cursor-pointer"
        >
          Mark as Resolved
        </button>

        <button
          type="button"
          onClick={onOpenGrievances}
          className="px-space-sm py-2 rounded-lg text-primary hover:bg-surface-container-low font-label-md text-label-md transition-colors ml-auto flex items-center gap-1 cursor-pointer"
        >
          <span>Open Full Portal</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
