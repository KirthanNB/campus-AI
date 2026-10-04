import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuthStore } from '../store/authStore';
import { api, API_BASE } from '../services/api';
import BrandLogo from '../components/BrandLogo';
import AttendanceModal from '../components/AttendanceModal';
import TimetableModal from '../components/TimetableModal';
import GrievancesModal from '../components/GrievancesModal';
import CampusNewsModal from '../components/CampusNewsModal';
import CitationModal from '../components/CitationModal';
import InteractiveTicketCard from '../components/InteractiveTicketCard';

export default function ChatPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  // Navigation & UI state: collapsed by default on mobile/tablet (< 1024px)
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return false;
  });
  const [activeModal, setActiveModal] = useState(null); // 'attendance' | 'timetable' | 'grievance' | 'news' | 'citation'
  const [citationData, setCitationData] = useState(null);

  // Chat sessions state
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [activeSessionTitle, setActiveSessionTitle] = useState('New Copilot Chat');
  const [messages, setMessages] = useState([]);

  // Input & Streaming state
  const [inputPrompt, setInputPrompt] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [preferredLanguage, setPreferredLanguage] = useState('English');
  const [isListening, setIsListening] = useState(false);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [openTicketsCount, setOpenTicketsCount] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-collapse sidebar on smaller screens during window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load live student attendance and tickets metrics for sidebar badges
  const loadStudentContext = async () => {
    try {
      const att = await api.getAttendance();
      if (att) setAttendanceSummary(att);
    } catch (e) {
      console.log('Attendance sync notice:', e);
    }

    try {
      const tickets = await api.getMyTickets();
      if (tickets) {
        const openOnes = tickets.filter(
          (t) => t.status && !['Resolved', 'Closed'].includes(t.status)
        );
        setOpenTicketsCount(openOnes.length);
      }
    } catch (e) {
      console.log('Tickets sync notice:', e);
    }
  };

  // Switch active session
  const selectSession = async (sessionId, title) => {
    setActiveSessionId(sessionId);
    setActiveSessionTitle(title || 'Copilot Chat');
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
    try {
      const msgs = await api.getSessionMessages(sessionId);
      setMessages(msgs || []);
    } catch (err) {
      console.error('Failed to load session messages:', err);
    }
  };

  // Create or reset to a new chat
  const handleNewChat = async (createRemote = true) => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
    if (createRemote) {
      try {
        const newSess = await api.createChatSession('New Copilot Chat');
        setSessions((prev) => [newSess, ...prev]);
        setActiveSessionId(newSess.id);
        setActiveSessionTitle(newSess.title);
        setMessages([]);
      } catch (_err) {
        setActiveSessionId(null);
        setActiveSessionTitle('New Copilot Chat');
        setMessages([]);
      }
    } else {
      setActiveSessionId(null);
      setActiveSessionTitle('New Copilot Chat');
      setMessages([]);
    }
    inputRef.current?.focus();
  };

  // Load chat sessions from backend
  const loadSessions = async () => {
    try {
      const data = await api.getChatSessions();
      if (data && data.length > 0) {
        setSessions(data);
        if (!activeSessionId) {
          selectSession(data[0].id, data[0].title);
        }
      } else {
        handleNewChat(false);
      }
    } catch (err) {
      console.error('Failed to load chat sessions:', err);
    }
  };

  // Click outside to close profile card
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut listener (Cmd/Ctrl + K for new chat, Esc to clear)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handleNewChat();
      } else if (e.key === 'Escape') {
        setInputPrompt('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Initial data loading
  useEffect(() => {
    loadSessions();
    loadStudentContext();
  }, [user]);

  // Delete chat session
  const handleDeleteSession = async (e, sessionId) => {
    e.stopPropagation();
    e.preventDefault();

    // Optimistic removal from UI immediately
    const remaining = sessions.filter((s) => s.id !== sessionId);
    setSessions(remaining);

    if (activeSessionId === sessionId) {
      if (remaining.length > 0) {
        selectSession(remaining[0].id, remaining[0].title);
      } else {
        handleNewChat(false);
      }
    }

    try {
      await api.deleteChatSession(sessionId);
    } catch (err) {
      console.error('Failed to delete session:', err);
      // Revert/refresh sessions on error
      loadSessions();
    }
  };

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  // Voice speech-to-text recognition
  const handleToggleVoice = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your query.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang =
        preferredLanguage === 'Hindi'
          ? 'hi-IN'
          : preferredLanguage === 'Tamil'
            ? 'ta-IN'
            : preferredLanguage === 'Telugu'
              ? 'te-IN'
              : preferredLanguage === 'French'
                ? 'fr-FR'
                : preferredLanguage === 'German'
                  ? 'de-DE'
                  : preferredLanguage === 'Spanish'
                    ? 'es-ES'
                    : 'en-US';
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (e) => {
        const text = e.results[0][0].transcript;
        setInputPrompt((prev) => (prev ? `${prev} ${text}` : text));
      };

      recognition.start();
    } catch (err) {
      console.error('Voice input error:', err);
      setIsListening(false);
    }
  };

  // Send message
  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputPrompt).trim();
    if (!query || isSending) return;

    setInputPrompt('');
    setIsSending(true);

    // Optimistically append user message
    const tempUserMsg = {
      id: `temp_${Date.now()}`,
      role: 'user',
      content: query,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const langParam = preferredLanguage !== 'English' ? preferredLanguage : null;
      const res = await api.sendMessage(query, langParam, activeSessionId);

      if (res.session_id) {
        if (!activeSessionId || activeSessionId !== res.session_id) {
          setActiveSessionId(res.session_id);
        }
        if (res.session_title) {
          setActiveSessionTitle(res.session_title);
          setSessions((prev) =>
            prev.map((s) => (s.id === res.session_id ? { ...s, title: res.session_title } : s))
          );
        }
        loadSessions();
      }

      // Progressive typewriter streaming over ~1s for natural AI response experience
      const fullText = res.answer || '';
      const totalSteps = 25; // 25 chunks over 1000ms (~40ms per step)
      const stepDuration = 40;
      const chunkSize = Math.max(1, Math.ceil(fullText.length / totalSteps));
      const aiMsgId = `ai_${Date.now()}`;

      let currentLength = chunkSize;
      const initialAssistantMsg = {
        id: aiMsgId,
        role: 'assistant',
        content: fullText.slice(0, currentLength),
        source: res.source,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, initialAssistantMsg]);

      // Stream remaining text smoothly
      if (currentLength < fullText.length) {
        await new Promise((resolve) => {
          const streamInterval = setInterval(() => {
            currentLength += chunkSize;
            if (currentLength >= fullText.length) {
              clearInterval(streamInterval);
              setMessages((prev) =>
                prev.map((m) => (m.id === aiMsgId ? { ...m, content: fullText } : m))
              );
              resolve();
            } else {
              const partial = fullText.slice(0, currentLength);
              setMessages((prev) =>
                prev.map((m) => (m.id === aiMsgId ? { ...m, content: partial } : m))
              );
            }
          }, stepDuration);
        });
      }
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content:
          '⚠️ Connection error contacting the university copilot service. Please verify your connection or try again.',
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
      loadStudentContext();
    }
  };

  // Open verified citation modal
  const handleOpenCitation = (source) => {
    setCitationData({
      document: source || 'academic_regulations_2024.pdf',
      clause: 'Official Academic Regulation Clause',
      text: 'This guidance is extracted directly from your university official policy documents with deterministic RAG verification.',
    });
    setActiveModal('citation');
  };

  // Student initials
  const studentInitials = user?.full_name
    ? user.full_name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
    : 'AS';

  const overallAttPct = attendanceSummary?.overall_percentage || '83.2';

  return (
    <div className="min-h-screen bg-background text-on-surface flex overflow-hidden">
      {/* 1. COLLAPSIBLE LEFT SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-surface-container-lowest z-50 flex flex-col justify-between overflow-y-auto transition-all duration-300 border-r border-surface-container shadow-xs ${
          sidebarOpen ? 'w-72 translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'
        }`}
      >
        <div className="flex flex-col">
          {/* Sidebar Top Branding & Collapse Button */}
          <div className={`p-space-md flex items-center border-b border-surface-container ${sidebarOpen ? 'justify-between' : 'justify-center gap-space-xs'
            }`}>
            <div className="flex items-center gap-space-sm overflow-hidden">
              <BrandLogo className="w-8 h-8 shrink-0" />
              {sidebarOpen && (
                <div className="flex flex-col min-w-0">
                  <span className="font-headline-sm text-headline-sm text-on-surface leading-none truncate font-semibold">
                    CampusMind
                  </span>
                  <span className="font-label-sm text-label-sm text-primary leading-tight tracking-wider uppercase text-[10px] font-semibold">
                    Copilot
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex items-center justify-center w-7 h-7 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer shrink-0"
              title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              <span className="material-symbols-outlined text-[18px]">dock_to_left</span>
            </button>
          </div>

          {/* Student Profile Identity Card */}
          <div className={`${sidebarOpen ? 'px-space-md' : 'px-space-xs flex justify-center'} mt-space-sm mb-space-sm`}>
            <div className={`rounded-xl bg-surface-container-low border border-surface-container flex items-center overflow-hidden ${sidebarOpen ? 'p-space-sm gap-space-sm w-full' : 'p-1.5 justify-center'
              }`}>
              <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-md text-label-md font-semibold shrink-0 shadow-2xs">
                {studentInitials}
              </div>
              {sidebarOpen && (
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
                    {user?.full_name || 'Arjun Sharma'}
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant truncate">
                    {user?.student_id || '24CSE101'} • {user?.branch || 'CSE'} {user?.current_year || '1st'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* "+ New Copilot Chat" CTA Button */}
          <div className={`${sidebarOpen ? 'px-space-md' : 'px-space-xs flex justify-center'} mb-space-md`}>
            <button
              type="button"
              onClick={() => handleNewChat(true)}
              title={!sidebarOpen ? "New Copilot Chat (⌘K)" : undefined}
              className={`flex items-center rounded-xl bg-primary-container text-on-primary hover:bg-primary transition-all shadow-md cursor-pointer active:scale-98 ${sidebarOpen
                  ? 'w-full justify-between px-space-md py-space-sm'
                  : 'w-10 h-10 justify-center p-0'
                }`}
            >
              <span className="flex items-center justify-center gap-space-xs font-label-md text-label-md font-semibold">
                <span className="material-symbols-outlined text-[20px]">add</span>
                {sidebarOpen && 'New Copilot Chat'}
              </span>
              {sidebarOpen && (
                <span className="font-code-sm text-code-sm px-1.5 py-0.5 rounded bg-surface-container-lowest/20 text-on-primary text-[10px]">
                  ⌘K
                </span>
              )}
            </button>
          </div>

          {/* Section: Academic Space */}
          {sidebarOpen && (
            <div className="px-space-md mb-space-xs">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                Academic Space
              </span>
            </div>
          )}

          <nav className={`${sidebarOpen ? 'px-space-sm' : 'px-space-xs items-center'} space-y-space-xs flex flex-col`}>
            {/* Active Copilot */}
            <button
              type="button"
              onClick={() => { }}
              title={!sidebarOpen ? "Active Copilot" : undefined}
              className={`flex items-center rounded-lg transition-colors bg-surface-container text-primary font-semibold cursor-pointer ${sidebarOpen
                  ? 'justify-between px-space-sm py-2 w-full'
                  : 'justify-center w-10 h-10 p-0'
                }`}
            >
              <div className="flex items-center justify-center gap-space-sm">
                <span className="material-symbols-outlined text-[20px]">neurology</span>
                {sidebarOpen && <span className="font-label-md text-label-md">Active Copilot</span>}
              </div>
            </button>

            {/* Course Attendance */}
            <button
              type="button"
              onClick={() => setActiveModal('attendance')}
              title={!sidebarOpen ? `Course Attendance (${overallAttPct}%)` : undefined}
              className={`flex items-center rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors cursor-pointer ${sidebarOpen
                  ? 'justify-between px-space-sm py-2 w-full'
                  : 'justify-center w-10 h-10 p-0'
                }`}
            >
              <div className="flex items-center justify-center gap-space-sm">
                <span className="material-symbols-outlined text-[20px] text-tertiary-container">fact_check</span>
                {sidebarOpen && <span className="font-label-md text-label-md">Course Attendance</span>}
              </div>
              {sidebarOpen && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-high text-tertiary-container font-label-sm text-label-sm font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container"></span>
                  {overallAttPct}%
                </span>
              )}
            </button>

            {/* Timetable & Schedule */}
            <button
              type="button"
              onClick={() => setActiveModal('timetable')}
              title={!sidebarOpen ? "Timetable & Schedule" : undefined}
              className={`flex items-center rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors cursor-pointer ${sidebarOpen
                  ? 'justify-between px-space-sm py-2 w-full'
                  : 'justify-center w-10 h-10 p-0'
                }`}
            >
              <div className="flex items-center justify-center gap-space-sm">
                <span className="material-symbols-outlined text-[20px] text-primary">calendar_today</span>
                {sidebarOpen && <span className="font-label-md text-label-md">Timetable &amp; Schedule</span>}
              </div>
            </button>

            {/* Student Grievances */}
            <button
              type="button"
              onClick={() => setActiveModal('grievance')}
              title={!sidebarOpen ? `Student Grievances (${openTicketsCount} Open)` : undefined}
              className={`flex items-center rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors cursor-pointer ${sidebarOpen
                  ? 'justify-between px-space-sm py-2 w-full'
                  : 'justify-center w-10 h-10 p-0'
                }`}
            >
              <div className="flex items-center justify-center gap-space-sm">
                <span className="material-symbols-outlined text-[20px] text-secondary">support_agent</span>
                {sidebarOpen && <span className="font-label-md text-label-md">Student Grievances</span>}
              </div>
              {sidebarOpen && (
                <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-semibold">
                  {openTicketsCount} Open
                </span>
              )}
            </button>

            {/* Campus Circulars */}
            <button
              type="button"
              onClick={() => setActiveModal('news')}
              title={!sidebarOpen ? "Campus Circulars" : undefined}
              className={`flex items-center rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors cursor-pointer ${sidebarOpen
                  ? 'justify-between px-space-sm py-2 w-full'
                  : 'justify-center w-10 h-10 p-0'
                }`}
            >
              <div className="flex items-center justify-center gap-space-sm">
                <span className="material-symbols-outlined text-[20px] text-primary-container">campaign</span>
                {sidebarOpen && <span className="font-label-md text-label-md">Campus Circulars</span>}
              </div>
              {sidebarOpen && <span className="w-2 h-2 rounded-full bg-secondary"></span>}
            </button>
          </nav>

          {/* Section: Recent Inquiries */}
          {sidebarOpen && (
            <div className="px-space-md mt-space-md mb-space-xs flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                Recent Inquiries
              </span>
              <span className="font-code-sm text-code-sm text-on-surface-variant text-[10px]">
                {sessions.length} chats
              </span>
            </div>
          )}

          {sidebarOpen && (
            <div className="px-space-sm space-y-space-xs flex flex-col max-h-48 overflow-y-auto">
              {sessions.length === 0 ? (
                <span className="px-space-sm py-1 font-body-sm text-body-sm text-on-surface-variant italic">
                  No prior chats yet
                </span>
              ) : (
                sessions.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => selectSession(s.id, s.title)}
                    className={`group flex items-center justify-between gap-space-xs px-space-sm py-1.5 rounded-lg transition-colors cursor-pointer ${activeSessionId === s.id
                        ? 'bg-surface-container text-primary font-medium'
                        : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                      }`}
                  >
                    <div className="flex items-center gap-space-xs truncate min-w-0 flex-1">
                      <span className="material-symbols-outlined text-[16px] text-outline shrink-0">
                        chat_bubble
                      </span>
                      <span className="font-label-md text-label-md truncate">{s.title}</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteSession(e, s.id)}
                      className="opacity-60 hover:opacity-100 p-1 rounded-md hover:bg-rose-50 hover:text-error text-on-surface-variant transition-all cursor-pointer shrink-0 z-10"
                      title="Delete chat session"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Sidebar Bottom: Multilingual Selector */}
        {sidebarOpen && (
          <div className="p-space-md mt-space-md bg-surface-container-lowest border-t border-surface-container">
            <div className="flex items-center justify-between px-space-xs">
              <div className="flex items-center gap-space-xs text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px]">translate</span>
                <span className="font-label-sm text-label-sm font-medium">Language</span>
              </div>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="bg-surface-container-low text-on-surface font-label-sm text-label-sm rounded-lg px-2 py-1 outline-none border border-surface-container cursor-pointer"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi (हिंदी)</option>
                <option value="Tamil">Tamil (தமிழ்)</option>
                <option value="Telugu">Telugu (తెలుగు)</option>
                <option value="Spanish">Spanish (Español)</option>
                <option value="French">French (Français)</option>
                <option value="German">German (Deutsch)</option>
              </select>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Sidebar Backdrop Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden cursor-pointer"
        />
      )}

      {/* 2. MAIN WORKSPACE CONTAINER */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarOpen ? 'lg:pl-72' : 'lg:pl-20'
          }`}
      >
        {/* Top Header Bar */}
        <header
          className={`fixed top-0 right-0 h-16 bg-surface-container-lowest/80 backdrop-blur-xl border-b border-surface-container shadow-2xs z-40 flex items-center justify-between px-space-md transition-all duration-300 ${sidebarOpen ? 'left-0 lg:left-72' : 'left-0 lg:left-20'
            }`}
        >
          <div className="flex items-center gap-space-sm">
            {/* Mobile Sidebar Toggle */}
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant cursor-pointer"
            >
              <span className="material-symbols-outlined text-[22px]">menu</span>
            </button>

            <BrandLogo className="w-8 h-8" />
            <span className="font-headline-sm text-headline-sm text-on-surface font-semibold hidden sm:inline">
              CampusMind AI
            </span>
          </div>

          <div className="flex items-center gap-space-sm sm:gap-space-md">
            <div className="hidden sm:flex items-center gap-space-xs px-space-sm py-1.5 rounded-xl bg-surface-container-low border border-surface-container text-on-surface-variant font-label-md text-label-md">
              <span className="material-symbols-outlined text-[16px] text-primary">school</span>
              <span>
                {user?.branch || 'CSE'} • {user?.current_year || '1st Year'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setActiveModal('news')}
              className="relative flex items-center justify-center w-9 h-9 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer border border-surface-container"
              title="Campus Circulars"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-secondary"></span>
            </button>

            {/* Profile Avatar with Information Popover */}
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-9 h-9 rounded-xl bg-primary-container text-on-primary flex items-center justify-center font-label-md text-label-md font-semibold shadow-xs hover:ring-2 hover:ring-primary/40 transition-all cursor-pointer"
                title="View Student Profile"
              >
                {studentInitials}
              </button>

              {/* Basic Student Information Dropdown */}
              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 rounded-2xl bg-surface-container-lowest p-space-md shadow-2xl border border-surface-container z-50 flex flex-col space-y-space-sm"
                  >
                    <div className="flex items-center gap-space-sm pb-space-sm border-b border-surface-container">
                      <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary flex items-center justify-center font-headline-md text-headline-md font-semibold shadow-xs shrink-0">
                        {studentInitials}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-headline-sm text-headline-sm text-on-surface font-semibold truncate">
                          {user?.full_name || 'Arjun Sharma'}
                        </span>
                        <span className="font-code-sm text-code-sm text-primary font-medium">
                          {user?.student_id || '24CSE101'}
                        </span>
                      </div>
                    </div>

                    {/* Information Grid */}
                    <div className="space-y-space-xs py-1">
                      <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-surface-container-low text-label-sm font-label-sm">
                        <span className="text-on-surface-variant flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[15px] text-primary">badge</span>
                          Student ID
                        </span>
                        <span className="font-semibold text-on-surface font-mono">{user?.student_id || '24CSE101'}</span>
                      </div>

                      <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-surface-container-low text-label-sm font-label-sm">
                        <span className="text-on-surface-variant flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[15px] text-primary">school</span>
                          Department
                        </span>
                        <span className="font-semibold text-on-surface">{user?.branch || 'Computer Science (CSE)'}</span>
                      </div>

                      <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-surface-container-low text-label-sm font-label-sm">
                        <span className="text-on-surface-variant flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[15px] text-primary">calendar_today</span>
                          Academic Year
                        </span>
                        <span className="font-semibold text-on-surface">{user?.current_year || '1st'} Year • Sem 1</span>
                      </div>

                      <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-surface-container-low text-label-sm font-label-sm">
                        <span className="text-on-surface-variant flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[15px] text-primary">mail</span>
                          Email Address
                        </span>
                        <span className="font-medium text-on-surface truncate max-w-[150px]">{user?.email || 'student@university.edu'}</span>
                      </div>
                    </div>

                    {/* Quick Profile Shortcuts */}
                    <div className="pt-space-xs border-t border-surface-container flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setShowProfileMenu(false);
                          setActiveModal('attendance');
                        }}
                        className="flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer text-label-sm font-label-sm"
                      >
                        <span className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px] text-tertiary-container">fact_check</span>
                          View Attendance Record
                        </span>
                        <span className="text-tertiary-container font-semibold">{overallAttPct}%</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowProfileMenu(false);
                          setActiveModal('timetable');
                        }}
                        className="flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer text-label-sm font-label-sm"
                      >
                        <span className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px] text-primary">calendar_month</span>
                          View Daily Schedule
                        </span>
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Logout Button at Far Right Corner of Top Bar */}
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/auth', { replace: true });
              }}
              title="Sign Out"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-low hover:bg-rose-50 text-on-surface-variant hover:text-error border border-surface-container hover:border-rose-200 transition-all cursor-pointer shadow-2xs group"
            >
              <span className="material-symbols-outlined text-[18px] group-hover:text-error transition-colors">logout</span>
              <span className="hidden sm:inline font-label-md text-label-md font-medium group-hover:text-error">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Sub-Header / Active Session Toolbar */}
        <div
          className={`sticky top-16 z-30 w-full bg-surface-container-lowest/90 backdrop-blur-md px-space-md py-space-sm border-b border-surface-container shadow-2xs flex flex-wrap items-center justify-between gap-space-sm`}
        >
          <div className="flex items-center gap-space-sm min-w-0">
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-[20px]">forum</span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-headline-sm text-headline-sm text-on-surface truncate font-semibold">
                  {activeSessionTitle}
                </span>
                <span className="hidden sm:flex px-2 py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm items-center gap-1 font-semibold">
                  {user?.branch || 'CSE'} • {user?.current_year || '1st Year'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-tertiary-container animate-pulse"></span>
                  ERP Live Synced
                </span>
                <span className="text-outline-variant font-code-sm text-code-sm">•</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                  Session #{activeSessionId ? activeSessionId.slice(-6) : 'COP-LIVE'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. CHAT STREAM CONTENT AREA */}
        <main className="w-full flex-1 max-w-5xl mx-auto px-space-md py-space-md space-y-space-lg pb-44">
          {/* Welcome / ERP Session Badge */}
          <div className="flex justify-center">
            <span className="px-3.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-medium shadow-2xs border border-surface-container">
              Today • Academic ERP Session Connected • Spring 2026
            </span>
          </div>

          {/* Empty State with Suggested Inquiries */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 gap-space-md text-center max-w-2xl mx-auto">
              <BrandLogo className="w-14 h-14" />
              <div className="flex flex-col gap-1">
                <h2 className="font-headline-lg text-headline-lg font-semibold text-on-surface">
                  Welcome to CampusMind AI, {user?.full_name?.split(' ')[0] || 'Scholar'}
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Your academic agent is initialized with your verified branch ({user?.branch || 'CSE'}),
                  attendance records, timetable shifts, and syllabus. Ask anything below!
                </p>
              </div>

              <div className="w-full mt-space-sm flex flex-col gap-space-xs text-left">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                  Suggested Inquiries
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-xs">
                  {[
                    {
                      icon: 'calculate',
                      color: 'text-primary',
                      text: 'What is my current attendance in C Programming (CS102)?',
                    },
                    {
                      icon: 'meeting_room',
                      color: 'text-secondary',
                      text: "Check tomorrow's 8:30 AM lecture room and professor",
                    },
                    {
                      icon: 'fact_check',
                      color: 'text-tertiary-container',
                      text: 'Check if my Physics attendance meets the 75% end-sem requirement',
                    },
                    {
                      icon: 'wifi',
                      color: 'text-error',
                      text: 'Hostel Wi-Fi high packet loss status and maintenance update',
                    },
                  ].map((pill, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(pill.text)}
                      className="p-space-sm rounded-xl bg-surface-container-lowest hover:bg-surface-container border border-surface-container flex items-center gap-space-sm text-left transition-all cursor-pointer shadow-2xs group"
                    >
                      <span className={`material-symbols-outlined text-[20px] ${pill.color}`}>
                        {pill.icon}
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface group-hover:text-primary font-medium">
                        {pill.text}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Messages Flow */}
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';

            if (isUser) {
              return (
                <div key={msg.id || index} className="flex justify-end items-start gap-space-sm max-w-3xl ml-auto">
                  <div className="flex flex-col items-end">
                    <div className="bg-inverse-surface text-inverse-on-surface rounded-2xl rounded-tr-xs px-space-md py-space-sm shadow-md font-body-md text-body-md leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-on-surface-variant font-code-sm text-code-sm">
                      <span>Just now</span>
                      <span>•</span>
                      <span className="text-tertiary-container flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[14px]">done_all</span> Synced
                      </span>
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-md text-label-md font-semibold shadow-xs shrink-0">
                    {studentInitials}
                  </div>
                </div>
              );
            }

            // Assistant Response
            const hasSource = Boolean(msg.source && msg.source.trim());
            // Parse action tags like [ACTION:SHOW_COMPLAINT_FORM:Category|Title|Description]
            const actionRegex = /\[ACTION:SHOW_COMPLAINT_FORM:([^|\]]*)(?:\|([^|\]]*))?(?:\|([^\]]*))?\]/i;
            const actionMatch = msg.content.match(actionRegex);
            const displayContent = msg.content.replace(actionRegex, '').trim();

            const parsedCategory = actionMatch?.[1]?.trim() || (msg.content.toLowerCase().includes('academic') ? 'Academic Grievance' : 'Hostel Maintenance');
            const parsedTitle = actionMatch?.[2]?.trim() || '';
            const parsedDesc = actionMatch?.[3]?.trim() || '';

            // Only show InteractiveTicketCard if Gemini explicitly triggered ACTION:SHOW_COMPLAINT_FORM
            // OR if the conversation specifically asks to file a new complaint/grievance
            const hasTicketIntent = Boolean(actionMatch);

            return (
              <div key={msg.id || index} className="flex items-start gap-space-md max-w-4xl">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary text-on-primary flex items-center justify-center shadow-md shrink-0">
                  <span className="material-symbols-outlined text-[20px]">neurology</span>
                </div>

                <div className="flex-1 flex flex-col space-y-space-sm min-w-0">
                  <div className="bg-surface-container-lowest rounded-2xl rounded-tl-xs p-space-md sm:p-space-lg shadow-xs border border-surface-container flex flex-col space-y-space-md">
                    {/* Header bar of response */}
                    <div className="flex items-center justify-between pb-space-xs border-b border-surface-container">
                      <div className="flex items-center gap-2">
                        <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                          Institutional Guidance
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-on-surface-variant">
                        <button
                          type="button"
                          onClick={() => navigator.clipboard.writeText(displayContent || msg.content)}
                          className="w-7 h-7 rounded hover:bg-surface-container flex items-center justify-center transition-colors cursor-pointer"
                          title="Copy response"
                        >
                          <span className="material-symbols-outlined text-[16px]">content_copy</span>
                        </button>
                      </div>
                    </div>

                    {/* Markdown Body */}
                    {displayContent ? (
                      <div className="prose-chat font-body-md text-body-md text-on-surface leading-relaxed">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayContent}</ReactMarkdown>
                      </div>
                    ) : (
                      <div className="font-body-md text-body-md text-on-surface">
                        I've prepared the official grievance filing form below with priority SLA routing. Please provide any additional details and click submit:
                      </div>
                    )}

                    {/* Interactive Ticket Quick-Action Card if applicable */}
                    {hasTicketIntent && (
                      <InteractiveTicketCard
                        userProfile={user}
                        category={parsedCategory}
                        initialTitle={parsedTitle || (parsedCategory === 'Academic Grievance' ? 'Academic Concern / Discrepancy' : 'Hostel & Campus Facility Issue')}
                        initialDescription={parsedDesc}
                        onOpenGrievances={() => setActiveModal('grievance')}
                      />
                    )}

                    {/* Official Source Citation Card */}
                    {hasSource && (
                      <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs border-t border-surface-container">
                        <div className="flex items-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm">
                          <span className="material-symbols-outlined text-[18px] text-primary">verified</span>
                          <span>
                            Source: <strong className="text-on-surface">{msg.source}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              window.open(
                                `${API_BASE}/documents/view/${encodeURIComponent(msg.source.replace(/^\[+|\]+$/g, '').trim())}`,
                                '_blank'
                              )
                            }
                            className="px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-label-sm text-label-sm font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Directly open formatted university gazette / policy"
                          >
                            <span>Open Gazette</span>
                            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenCitation(msg.source)}
                            className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm font-medium flex items-center gap-1 transition-colors cursor-pointer"
                            title="View institutional clause verification details"
                          >
                            <span>Clause Details</span>
                            <span className="material-symbols-outlined text-[14px]">info</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isSending && (
            <div className="flex items-start gap-space-md max-w-4xl">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary text-on-primary flex items-center justify-center shadow-md shrink-0">
                <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
              </div>
              <div className="bg-surface-container-lowest rounded-2xl rounded-tl-xs px-space-md py-3 shadow-xs border border-surface-container flex items-center gap-3 text-on-surface-variant font-label-md text-label-md">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce"></span>
                </div>
                <span className="text-on-surface font-medium">CampusMind is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </main>

        {/* 4. BOTTOM FLOATING PROMPT INPUT BAR */}
        <div
          className={`fixed bottom-0 right-0 bg-gradient-to-t from-background via-background/95 to-transparent pt-6 pb-space-md px-space-md z-40 transition-all duration-300 ${sidebarOpen ? 'left-0 lg:left-72' : 'left-0 lg:left-20'
            }`}
        >
          <div className="max-w-4xl mx-auto flex flex-col space-y-space-xs">
            {/* Meta Context Pill */}
            <div className="flex items-center justify-between px-space-xs">
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline font-code-sm text-code-sm text-on-surface-variant">
                  Roll: {user?.student_id || '24CSE101'}
                </span>
                {preferredLanguage !== 'English' && (
                  <span className="px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-label-sm text-label-sm font-semibold">
                    {preferredLanguage}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex items-center gap-2 font-code-sm text-code-sm text-on-surface-variant">
                <span>Enter to submit • Esc to clear</span>
              </div>
            </div>

            {/* Input Pill */}
            <div className="bg-surface-container-lowest/95 backdrop-blur-md rounded-full px-space-md py-2 flex items-center gap-space-sm shadow-xl border border-surface-container">
              <button
                type="button"
                onClick={handleToggleVoice}
                className={`w-8 h-8 rounded-full transition-colors flex items-center justify-center cursor-pointer ${isListening
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'
                  }`}
                title="Voice Query"
              >
                <span className="material-symbols-outlined text-[20px]">mic</span>
              </button>

              <input
                ref={inputRef}
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask CampusMind AI anything about your branch, courses, exams, fees, or hostel..."
                className="flex-1 bg-transparent border-none outline-none font-body-md text-body-md text-on-surface placeholder:text-outline"
              />

              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputPrompt.trim() || isSending}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-container to-secondary text-on-primary flex items-center justify-center shadow-md hover:opacity-90 active:scale-95 transition-all cursor-pointer disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-[20px]">arrow_upward</span>
              </button>
            </div>

            <div className="text-center font-body-sm text-body-sm text-on-surface-variant text-[11px]">
              CampusMind AI • Hyper-personalized student copilot • Grounded in official university records.
            </div>
          </div>
        </div>
      </div>

      {/* 5. MODALS & DRAWERS */}
      <AttendanceModal
        isOpen={activeModal === 'attendance'}
        onClose={() => setActiveModal(null)}
        userProfile={user}
      />

      <TimetableModal
        isOpen={activeModal === 'timetable'}
        onClose={() => setActiveModal(null)}
        userProfile={user}
      />

      <GrievancesModal
        isOpen={activeModal === 'grievance'}
        onClose={() => setActiveModal(null)}
        userProfile={user}
        onTicketCreated={() => loadStudentContext()}
      />

      <CampusNewsModal
        isOpen={activeModal === 'news'}
        onClose={() => setActiveModal(null)}
      />

      <CitationModal
        isOpen={activeModal === 'citation'}
        onClose={() => setActiveModal(null)}
        citationData={citationData}
      />
    </div>
  );
}
