import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Send,
  Sparkles,
  RotateCcw,
  LogOut,
  Calendar,
  CreditCard,
  BookOpen,
  Languages,
  User as UserIcon,
  Bot,
  Tag,
  ChevronDown,
  Check,
  FileText,
  ShieldAlert,
  ShieldCheck,
  Bell,
  ExternalLink,
  History,
  MessageSquare,
  Plus,
  Trash2,
  Clock,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import InteractiveTicketCard from '../components/InteractiveTicketCard';
import GrievancesModal from '../components/GrievancesModal';
import TimetableModal from '../components/TimetableModal';
import AttendanceModal from '../components/AttendanceModal';
import CampusNewsModal from '../components/CampusNewsModal';

// Animated typewriter markdown component for newly generated AI responses
function TypewriterMarkdown({ content, isNew, onAnimationDone }) {
  const [displayedLength, setDisplayedLength] = useState(isNew ? 0 : content.length);
  const [isTyping, setIsTyping] = useState(isNew);

  useEffect(() => {
    if (!isNew) {
      setDisplayedLength(content.length);
      setIsTyping(false);
      return;
    }

    setDisplayedLength(0);
    setIsTyping(true);

    const totalChars = content.length;
    // Step size calculated so response types smoothly in ~0.8 to 1.2 seconds
    const stepSize = Math.max(3, Math.ceil(totalChars / 35));
    const intervalMs = 20;

    const timer = setInterval(() => {
      setDisplayedLength((prev) => {
        const next = prev + stepSize;
        if (next >= totalChars) {
          clearInterval(timer);
          setIsTyping(false);
          if (onAnimationDone) onAnimationDone();
          return totalChars;
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [content, isNew]);

  const rawVisible = isTyping ? content.slice(0, displayedLength) : content;
  const cleanContent = rawVisible
    .replace(/\[ACTION:SHOW_COMPLAINT_FORM:[^\]]*\]/gi, '')
    .replace(/🏷️\s*\*{0,2}Source:.*$/i, '')
    .trim();

  return (
    <div className="prose-chat">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {cleanContent}
      </ReactMarkdown>
      {isTyping && (
        <span className="inline-block w-1.5 h-3.5 ml-1 bg-indigo-600 animate-pulse rounded-full align-middle" />
      )}
    </div>
  );
}

export default function ChatPage() {
  const { user, logout } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('Auto');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Chat Sessions & History State
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [showHistoryMenu, setShowHistoryMenu] = useState(false);

  // Navigation Feature Modals
  const [showGrievanceModal, setShowGrievanceModal] = useState(false);
  const [showTimetableModal, setShowTimetableModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showNewsModal, setShowNewsModal] = useState(false);

  const messagesEndRef = useRef(null);

  const languages = [
    { label: 'Auto (Original)', value: 'Auto' },
    { label: 'English', value: 'English' },
    { label: 'हिंदी (Hindi)', value: 'Hindi' },
    { label: 'తెలుగు (Telugu)', value: 'Telugu' },
    { label: 'தமிழ் (Tamil)', value: 'Tamil' },
    { label: 'Español (Spanish)', value: 'Spanish' },
    { label: 'Français (French)', value: 'French' },
    { label: 'Deutsch (German)', value: 'German' },
  ];

  // Load chat sessions from backend on mount
  const loadSessions = async () => {
    try {
      const sessList = await api.getChatSessions();
      setSessions(sessList || []);
      return sessList;
    } catch (err) {
      console.error('Failed to load chat sessions:', err);
      return [];
    }
  };

  const loadSessionMessages = async (sessionId) => {
    if (!sessionId) {
      setMessages([]);
      return;
    }
    try {
      const msgs = await api.getSessionMessages(sessionId);
      if (msgs && msgs.length > 0) {
        setMessages(
          msgs.map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            source: m.source,
            isNew: false,
          }))
        );
      } else {
        setMessages([]);
      }
      setCurrentSessionId(sessionId);
    } catch (err) {
      console.error('Failed to load session messages:', err);
    }
  };

  useEffect(() => {
    async function init() {
      const sessList = await loadSessions();
      if (sessList && sessList.length > 0) {
        // Load most recent active session
        loadSessionMessages(sessList[0].id);
      } else {
        // Try fallback chat history
        try {
          const history = await api.getChatHistory();
          if (history && history.length > 0) {
            setMessages(
              history.map((msg) => ({
                id: msg.id,
                role: msg.role,
                content: msg.content,
                source: msg.source,
                isNew: false,
              }))
            );
          }
        } catch (e) {
          console.error('Fallback history error:', e);
        }
      }
    }
    init();

    const handleOpenGrievances = () => setShowGrievanceModal(true);
    window.addEventListener('open_grievances_modal', handleOpenGrievances);
    return () => {
      window.removeEventListener('open_grievances_modal', handleOpenGrievances);
    };
  }, []);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    setInput('');
    const tempId = Date.now();

    // Append user message immediately
    const userMessage = {
      id: tempId,
      role: 'user',
      content: query,
      isNew: false,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const preferredLang = selectedLanguage === 'Auto' ? null : selectedLanguage;
      const res = await api.sendMessage(query, preferredLang, currentSessionId);

      if (res.session_id && res.session_id !== currentSessionId) {
        setCurrentSessionId(res.session_id);
        loadSessions();
      }

      const aiMessage = {
        id: tempId + 1,
        role: 'assistant',
        content: res.answer,
        source: res.source,
        isNew: true, // triggers smooth typing animation
      };
      setMessages((prev) => [...prev, aiMessage]);
      loadSessions();
    } catch (err) {
      const errorMessage = {
        id: tempId + 1,
        role: 'assistant',
        content: `⚠️ Error: ${err.message || 'Unable to get response. Please check your connection and try again.'}`,
        source: 'System',
        isNew: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = async () => {
    try {
      setCurrentSessionId(null);
      setMessages([]);
      setShowHistoryMenu(false);
    } catch (err) {
      console.error('Failed to create new chat:', err);
      setMessages([]);
    }
  };

  const handleSelectSession = (sessId) => {
    loadSessionMessages(sessId);
    setShowHistoryMenu(false);
  };

  const handleDeleteSession = async (e, sessId) => {
    e.stopPropagation();
    try {
      await api.deleteChatSession(sessId);
      const updated = sessions.filter((s) => s.id !== sessId);
      setSessions(updated);
      if (currentSessionId === sessId) {
        if (updated.length > 0) {
          loadSessionMessages(updated[0].id);
        } else {
          setCurrentSessionId(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  // Quick Action chips highlighting the unified AI Copilot capabilities
  const quickActions = [
    {
      label: 'Attendance & Bunk Calc',
      icon: ShieldCheck,
      prompt: "What's my attendance percentage in each subject, and can I safely skip 2 classes in DBMS?",
      color: 'from-emerald-500/10 to-teal-500/10 text-emerald-700 border-emerald-200',
    },
    {
      label: 'Timetable & Schedule',
      icon: Calendar,
      prompt: 'What classes, labs, and faculty timings do I have scheduled for today and this week?',
      color: 'from-blue-500/10 to-indigo-500/10 text-indigo-700 border-indigo-200',
    },
    {
      label: 'Ticket & Grievance Status',
      icon: ShieldAlert,
      prompt: 'What is the current status and resolution SLA for my submitted complaints and maintenance tickets?',
      color: 'from-red-500/10 to-orange-500/10 text-red-700 border-red-200',
    },
    {
      label: 'Campus News & Placements',
      icon: Bell,
      prompt: 'What are the latest official circulars regarding Google/Microsoft placements and the GEARS hackathon?',
      color: 'from-amber-500/10 to-yellow-500/10 text-amber-700 border-amber-200',
    },
    {
      label: 'Exams & Syllabus',
      icon: BookOpen,
      prompt: 'When is my upcoming CAT-1 exam schedule and what are the core subjects for my branch?',
      color: 'from-purple-500/10 to-pink-500/10 text-purple-700 border-purple-200',
    },
    {
      label: 'Fees & Hostel Curfew',
      icon: CreditCard,
      prompt: 'What is the tuition fee deadline, hostel gate curfew timing, and mess meal schedule?',
      color: 'from-slate-500/10 to-gray-500/10 text-slate-700 border-slate-200',
    },
  ];

  const currentSessionTitle = sessions.find((s) => s.id === currentSessionId)?.title || 'Current Chat';

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* 1. TOP HEADER (max-w-[1000px] center focused) */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-[1000px] mx-auto px-4 h-16 flex items-center justify-between">
          {/* Left: Branding & User Profile Chip */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm sm:text-base">CampusMind AI</span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                  {user?.branch || 'CSE'} • {user?.current_year || '3rd'} Year
                </span>
              </div>
              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                <span>{user?.full_name || 'Student'}</span>
                <span className="hidden md:inline">• {user?.hostel_status}</span>
              </p>
            </div>
          </div>

          {/* Center/Right Navigation Section & Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Nav Item 1: Timetable */}
            <button
              type="button"
              onClick={() => setShowTimetableModal(true)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 transition cursor-pointer flex items-center gap-1"
              title="View your branch & year timetable"
            >
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden md:inline">Timetable</span>
            </button>

            {/* Nav Item 2: Attendance */}
            <button
              type="button"
              onClick={() => setShowAttendanceModal(true)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 transition cursor-pointer flex items-center gap-1"
              title="Check classwise & daywise attendance"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline">Attendance</span>
            </button>

            {/* Nav Item 3: Grievances & Complaints */}
            <button
              type="button"
              onClick={() => setShowGrievanceModal(true)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-red-50 hover:text-red-600 border border-slate-200 transition cursor-pointer flex items-center gap-1"
              title="File or track maintenance grievances"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
              <span className="hidden md:inline">Grievances</span>
            </button>

            {/* Nav Item 4: News & Admin Circulars */}
            <button
              type="button"
              onClick={() => setShowNewsModal(true)}
              className="relative p-2 rounded-lg text-slate-700 bg-slate-100 hover:bg-amber-50 hover:text-amber-600 border border-slate-200 transition cursor-pointer flex items-center gap-1"
              title="Campus News & Admin Circulars"
            >
              <Bell className="w-4 h-4 text-amber-500" />
              <span className="hidden md:inline text-xs font-semibold">News</span>
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
            </button>

            {/* Chat History Dropdown Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowHistoryMenu(!showHistoryMenu)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 transition cursor-pointer"
                title="View previous chat conversations"
              >
                <History className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden lg:inline max-w-[100px] truncate">{currentSessionTitle}</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {showHistoryMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 overflow-hidden">
                  <div className="px-3.5 py-2 flex items-center justify-between border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-indigo-600" />
                      Chat History
                    </span>
                    <button
                      onClick={handleNewChat}
                      className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      New Chat
                    </button>
                  </div>

                  <div className="max-h-64 overflow-y-auto py-1">
                    {sessions.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">
                        No saved chats yet. Start asking questions to save memory!
                      </div>
                    ) : (
                      sessions.map((s) => (
                        <div
                          key={s.id}
                          onClick={() => handleSelectSession(s.id)}
                          className={`group px-3.5 py-2.5 hover:bg-slate-50 flex items-center justify-between cursor-pointer transition ${
                            currentSessionId === s.id ? 'bg-indigo-50/70 border-l-3 border-indigo-600' : ''
                          }`}
                        >
                          <div className="flex items-start gap-2 max-w-[85%]">
                            <MessageSquare className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${currentSessionId === s.id ? 'text-indigo-600' : 'text-slate-400'}`} />
                            <div className="truncate">
                              <div className={`text-xs truncate font-medium ${currentSessionId === s.id ? 'text-indigo-700 font-bold' : 'text-slate-800'}`}>
                                {s.title || 'Conversation'}
                              </div>
                              <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <Clock className="w-2.5 h-2.5" />
                                <span>{new Date(s.updated_at || s.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={(e) => handleDeleteSession(e, s.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-600 hover:bg-red-50 rounded transition text-slate-400 cursor-pointer"
                            title="Delete conversation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition cursor-pointer"
                title="Select response language"
              >
                <Languages className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden lg:inline">{selectedLanguage}</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
                  <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Response Language
                  </div>
                  {languages.map((lang) => (
                    <button
                      key={lang.value}
                      onClick={() => {
                        setSelectedLanguage(lang.value);
                        setShowLangMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center justify-between cursor-pointer"
                    >
                      {lang.label}
                      {selectedLanguage === lang.value && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* View Profile Icon Button */}
            <button
              type="button"
              onClick={() => setShowProfileModal(!showProfileModal)}
              className="p-2 rounded-lg text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer border border-slate-200"
              title="Student Profile Context"
            >
              <UserIcon className="w-4 h-4 text-indigo-600" />
            </button>

            {/* New Chat Button */}
            <button
              type="button"
              onClick={handleNewChat}
              className="p-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition cursor-pointer flex items-center gap-1"
              title="Start New Chat"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">New</span>
            </button>

            {/* Logout Button */}
            <button
              type="button"
              onClick={logout}
              className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Profile Context Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <UserIcon className="w-4.5 h-4.5 text-indigo-600" />
                Student Profile & Injected Context
              </h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2 mb-4">
              Your student profile parameters and branch courses are automatically bound to your account and Firebase memory.
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Student Name:</span>
                <span className="font-semibold text-slate-800">{user?.full_name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Student ID / Roll No:</span>
                <span className="font-semibold text-slate-800 font-mono">{user?.student_id}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Department / Branch:</span>
                <span className="font-semibold text-indigo-600">{user?.branch}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Current Academic Year:</span>
                <span className="font-semibold text-slate-800">{user?.current_year} Year</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Batch / Regulation:</span>
                <span className="font-semibold text-slate-800">{user?.batch}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Hostel Residence:</span>
                <span className="font-semibold text-emerald-600">{user?.hostel_status}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Email Address:</span>
                <span className="font-semibold text-slate-800">{user?.email}</span>
              </div>
            </div>
            <button
              onClick={() => setShowProfileModal(false)}
              className="mt-6 w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition cursor-pointer"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}

      {/* Feature Modals */}
      <GrievancesModal
        isOpen={showGrievanceModal}
        onClose={() => setShowGrievanceModal(false)}
        userProfile={user}
      />
      <TimetableModal
        isOpen={showTimetableModal}
        onClose={() => setShowTimetableModal(false)}
        userProfile={user}
      />
      <AttendanceModal
        isOpen={showAttendanceModal}
        onClose={() => setShowAttendanceModal(false)}
        userProfile={user}
      />
      <CampusNewsModal
        isOpen={showNewsModal}
        onClose={() => setShowNewsModal(false)}
      />

      {/* 2. CHAT CONTENT AREA (Centered, focused max-w-[850px]) */}
      <main className="flex-1 max-w-[850px] w-full mx-auto px-4 pt-4 pb-28 flex flex-col justify-start">
        {messages.length === 0 ? (
          /* EMPTY STATE */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="my-auto py-10 flex flex-col items-center text-center"
          >
            {/* Friendly Greeting Card */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 mb-6">
              <Bot className="w-9 h-9" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Hi {user?.full_name?.split(' ')[0] || 'there'}! 👋
            </h2>
            <p className="mt-2 text-slate-600 text-sm sm:text-base max-w-md">
              I'm <strong className="text-indigo-600">CampusMind AI</strong>. I know you're a{' '}
              <strong className="text-slate-800">{user?.current_year || '3rd'} Year {user?.branch || 'CSE'}</strong> student{' '}
              ({user?.hostel_status || 'Hostel Block B'}). What can I help you with today?
            </p>

            {/* 6 Quick Action Chips */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
              {quickActions.map((act) => {
                const Icon = act.icon;
                return (
                  <button
                    key={act.label}
                    onClick={() => handleSendMessage(act.prompt)}
                    className="p-3.5 rounded-xl bg-white border border-slate-200/80 hover:border-indigo-400 hover:shadow-md transition-all text-left group flex items-start gap-3 cursor-pointer"
                  >
                    <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <Icon className="w-4 h-4 text-slate-600 group-hover:text-indigo-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 text-xs sm:text-sm group-hover:text-indigo-600 transition-colors">
                        {act.label}
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {act.prompt}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          /* MESSAGE STREAM */
          <div className="space-y-4 pt-2">
            <AnimatePresence initial={false}>
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shrink-0 mt-1 shadow-xs">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 text-sm ${
                        isUser
                          ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-xs shadow-md shadow-indigo-600/10'
                          : 'bg-white text-slate-800 rounded-tl-xs border border-slate-200/80 shadow-xs'
                      }`}
                    >
                      {/* Message Content */}
                      {isUser ? (
                        <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                      ) : (
                        <div>
                          {/* Animated Typewriter Markdown renderer */}
                          <TypewriterMarkdown
                            content={msg.content}
                            isNew={msg.isNew}
                            onAnimationDone={scrollToBottom}
                          />

                          {/* Dynamic In-Chat Grievance / Maintenance Action Form */}
                          {(() => {
                            const actionMatch = msg.content.match(/\[ACTION:SHOW_COMPLAINT_FORM:(.*?)\]/i);
                            const hasComplaintKeywords = /complaint|grievance|repair|fix|broken|malfunction|issue with mess|issue with hostel/i.test(msg.content);
                            
                            if (actionMatch || (hasComplaintKeywords && msg.source?.toLowerCase().includes('grievance'))) {
                              let category = "Hostel Maintenance";
                              let suggestedTitle = "";
                              let suggestedDesc = "";

                              if (actionMatch && actionMatch[1]) {
                                const parts = actionMatch[1].split('|');
                                category = parts[0] || category;
                                suggestedTitle = parts[1] || "";
                                suggestedDesc = parts[2] || "";
                              }

                              return (
                                <InteractiveTicketCard
                                  category={category}
                                  initialTitle={suggestedTitle}
                                  initialDescription={suggestedDesc}
                                  userProfile={user || {}}
                                  onOpenGrievances={() => setShowGrievanceModal(true)}
                                  onSuccess={() => {
                                    window.dispatchEvent(new CustomEvent('ticket_submitted'));
                                  }}
                                />
                              );
                            }
                            return null;
                          })()}

                          {/* Citation Badge - opens printable PDF document view in new tab */}
                          {msg.source && msg.source.trim() && msg.source !== 'System' && (
                            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium text-slate-500">
                              <div className="flex items-center gap-1.5 truncate">
                                <Tag className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                <span className="truncate">
                                  Source Document:{' '}
                                  <strong className="text-slate-800">{msg.source}</strong>
                                </span>
                              </div>
                              <a
                                href={`http://127.0.0.1:8000/api/documents/view/${encodeURIComponent(msg.source)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold border border-indigo-200 transition cursor-pointer flex items-center gap-1 shrink-0"
                                title="Open full official document in new tab"
                              >
                                <span>Open PDF Source</span>
                                <ExternalLink className="w-3 h-3 text-indigo-600" />
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {isUser && (
                      <div className="w-8 h-8 rounded-lg bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 shrink-0 mt-1">
                        <UserIcon className="w-4 h-4" />
                      </div>
                    )}
                  </motion.div>
                );
              })}

              {/* Thinking Animation Indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2.5 justify-start"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shrink-0 mt-1 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-xs px-4 py-3 border border-slate-200/80 shadow-xs flex items-center gap-2">
                    <div className="flex space-x-1.5">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-xs text-slate-500 font-medium pl-1">
                      CampusMind is thinking...
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* 3. FLOATING BOTTOM INPUT AREA */}
      <footer className="fixed bottom-0 left-0 right-0 z-20 pointer-events-none pb-4 pt-2 bg-gradient-to-t from-slate-100 via-slate-100/90 to-transparent">
        <div className="max-w-[850px] mx-auto px-4 pointer-events-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="relative flex items-center bg-white rounded-full border border-slate-300/80 shadow-lg shadow-slate-300/30 p-1.5 pl-4 transition-all focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20"
          >
            <input
              type="text"
              placeholder={`Ask CampusMind AI anything about ${user?.branch || 'your branch'}, exams, fees, or campus...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1 bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none pr-3"
            />

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-indigo-600/30 shrink-0"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <p className="text-[11px] text-center text-slate-400 mt-2">
            CampusMind AI • Answers verified with official academic regulations • GEARS 2026
          </p>
        </div>
      </footer>
    </div>
  );
}
