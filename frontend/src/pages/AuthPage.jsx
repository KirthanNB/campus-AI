import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Languages,
  BookOpen,
  ArrowRight,
  User,
  Mail,
  Lock,
  Phone,
  Building,
  Calendar,
  Home,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Zap,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  // Signup form state - all 9 required fields
  const [signupData, setSignupData] = useState({
    full_name: '',
    email: '',
    password: '',
    student_id: '',
    branch: 'CSE',
    current_year: '3rd',
    batch: '2023-2027',
    hostel_status: 'Hostel Block B',
    phone_number: '',
  });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.login(loginData);
      setAuth(res.access_token, res.user);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.register(signupData);
      setAuth(res.access_token, res.user);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  // Demo quick-fill for judges & testers
  const handleQuickDemo = (profile) => {
    if (profile === 'cse') {
      setSignupData({
        full_name: 'Aarav Sharma',
        email: `aarav.${Date.now().toString().slice(-4)}@campus.edu`,
        password: 'password123',
        student_id: `23BCSE${Math.floor(100 + Math.random() * 900)}`,
        branch: 'CSE',
        current_year: '3rd',
        batch: '2023-2027',
        hostel_status: 'Hostel Block B',
        phone_number: '+91 98765 43210',
      });
      setIsLogin(false);
    } else if (profile === 'mech') {
      setSignupData({
        full_name: 'Rohan Verma',
        email: `rohan.${Date.now().toString().slice(-4)}@campus.edu`,
        password: 'password123',
        student_id: `24BMECH${Math.floor(100 + Math.random() * 900)}`,
        branch: 'MECH',
        current_year: '2nd',
        batch: '2024-2028',
        hostel_status: 'Day Scholar',
        phone_number: '+91 98111 22334',
      });
      setIsLogin(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-900 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* LEFT COLUMN: Hero & Features */}
      <div className="lg:w-1/2 p-8 lg:p-14 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border-b lg:border-b-0 lg:border-r border-slate-800">
        {/* Glow ambient decoration */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top: Logo & Branding */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            GEARS 2026 Hackathon Finalist
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white m-0">
                CampusMind<span className="text-indigo-400"> AI</span>
              </h1>
              <p className="text-xs text-slate-400">Hyper-Personalized Multilingual Student Copilot</p>
            </div>
          </div>

          <p className="mt-6 text-slate-300 text-sm lg:text-base leading-relaxed max-w-lg">
            Say goodbye to endless circulars, PDF searches, and generic answers. CampusMind AI knows your exact
            branch, semester, and hostel status to provide citation-backed, 100% accurate university answers.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="my-8 lg:my-10 grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 backdrop-blur-sm">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center text-indigo-400 mb-2">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-white text-sm mb-1">Zero Hallucinations</h4>
            <p className="text-xs text-slate-400">Strictly grounded in your branch's official curriculum & regulatory documents.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 backdrop-blur-sm">
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center text-purple-400 mb-2">
              <Languages className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-white text-sm mb-1">Multilingual Fluent</h4>
            <p className="text-xs text-slate-400">Ask freely in Hindi, Telugu, Tamil, Spanish, French, or English.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 backdrop-blur-sm">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/15 flex items-center justify-center text-cyan-400 mb-2">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-white text-sm mb-1">Instant Context Injection</h4>
            <p className="text-xs text-slate-400">Never asked "Which branch?". Your profile is injected into every prompt.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 backdrop-blur-sm">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400 mb-2">
              <BookOpen className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-white text-sm mb-1">Verifiable Citations</h4>
            <p className="text-xs text-slate-400">Every response tags the exact official source document for trust.</p>
          </div>
        </div>

        {/* Quick Demo Pre-fill for Evaluators */}
        <div className="relative z-10 pt-4 border-t border-slate-800/80">
          <p className="text-xs text-slate-400 mb-2 flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            1-Click Demo Logins (Instant Hackathon Evaluation):
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setLoginData({ email: 'arjun.sharma@campus.edu', password: 'Campus@123' });
                setError('');
              }}
              className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/30 transition-all cursor-pointer font-medium"
            >
              🔑 1-Click: Arjun (1st Yr CSE)
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setLoginData({ email: 'priya.patel@campus.edu', password: 'Campus@123' });
                setError('');
              }}
              className="text-xs px-3 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/30 transition-all cursor-pointer font-medium"
            >
              🔑 1-Click: Priya (2nd Yr ECE)
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setLoginData({ email: 'rahul.verma@campus.edu', password: 'Campus@123' });
                setError('');
              }}
              className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-500/30 transition-all cursor-pointer font-medium"
            >
              🔑 1-Click: Rahul (3rd Yr MECH)
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Auth Card */}
      <div className="lg:w-1/2 p-6 lg:p-12 flex items-center justify-center bg-slate-950">
        <div className="w-full max-w-lg">
          {/* Tabs: Sign In / Create Account */}
          <div className="flex bg-slate-900 p-1.5 rounded-xl border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setError('');
              }}
              className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all cursor-pointer ${
                isLogin
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setError('');
              }}
              className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all cursor-pointer ${
                !isLogin
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account (Student)
            </button>
          </div>

          {/* Direct 1-Click Quick Login Buttons inside the Card */}
          {isLogin && (
            <div className="mb-5 p-3 rounded-xl bg-slate-900/90 border border-indigo-500/30">
              <div className="flex items-center gap-1.5 text-xs text-indigo-300 font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Instant 1-Click Demo Logins:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setLoginData({ email: 'arjun.sharma@campus.edu', password: 'Campus@123' });
                    setError('');
                  }}
                  className="py-1.5 px-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-200 border border-indigo-500/30 text-xs font-medium text-center transition-all cursor-pointer truncate"
                >
                  ⚡ Arjun (CSE 1st Yr)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginData({ email: 'priya.patel@campus.edu', password: 'Campus@123' });
                    setError('');
                  }}
                  className="py-1.5 px-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/40 text-purple-200 border border-purple-500/30 text-xs font-medium text-center transition-all cursor-pointer truncate"
                >
                  ⚡ Priya (ECE 2nd Yr)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginData({ email: 'rahul.verma@campus.edu', password: 'Campus@123' });
                    setError('');
                  }}
                  className="py-1.5 px-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-200 border border-emerald-500/30 text-xs font-medium text-center transition-all cursor-pointer truncate"
                >
                  ⚡ Rahul (MECH 3rd Yr)
                </button>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Form Content */}
          <AnimatePresence mode="wait">
            {isLogin ? (
              /* LOGIN FORM */
              <motion.form
                key="login-form"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleLoginSubmit}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      placeholder="student@campus.edu"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      Sign In to CampusMind
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              /* SIGNUP FORM - ALL 9 FIELDS */
              <motion.form
                key="signup-form"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSignupSubmit}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* 1. Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      1. Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="Aarav Sharma"
                        value={signupData.full_name}
                        onChange={(e) => setSignupData({ ...signupData, full_name: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs sm:text-sm focus:border-indigo-500 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* 2. Email */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      2. Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        placeholder="aarav@campus.edu"
                        value={signupData.email}
                        onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs sm:text-sm focus:border-indigo-500 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* 3. Password */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      3. Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="password"
                        required
                        placeholder="At least 6 characters"
                        value={signupData.password}
                        onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs sm:text-sm focus:border-indigo-500 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* 4. Student ID / Roll Number */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      4. Roll / Student ID *
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. 23BCSE104"
                        value={signupData.student_id}
                        onChange={(e) => setSignupData({ ...signupData, student_id: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs sm:text-sm focus:border-indigo-500 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* 5. Branch */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      5. Branch (Degree) *
                    </label>
                    <select
                      value={signupData.branch}
                      onChange={(e) => setSignupData({ ...signupData, branch: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs sm:text-sm focus:border-indigo-500 focus:outline-none transition-all cursor-pointer"
                    >
                      <option value="CSE">CSE - Computer Science</option>
                      <option value="ECE">ECE - Electronics & Comm.</option>
                      <option value="MECH">MECH - Mechanical Engg.</option>
                      <option value="EEE">EEE - Electrical & Electronics</option>
                      <option value="CIVIL">CIVIL - Civil Engineering</option>
                      <option value="IT">IT - Information Tech</option>
                    </select>
                  </div>

                  {/* 6. Current Year */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      6. Current Year *
                    </label>
                    <select
                      value={signupData.current_year}
                      onChange={(e) => setSignupData({ ...signupData, current_year: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs sm:text-sm focus:border-indigo-500 focus:outline-none transition-all cursor-pointer"
                    >
                      <option value="1st">1st Year (Freshman)</option>
                      <option value="2nd">2nd Year (Sophomore)</option>
                      <option value="3rd">3rd Year (Junior)</option>
                      <option value="4th">4th Year (Senior / Final)</option>
                    </select>
                  </div>

                  {/* 7. Batch / Admission Year */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      7. Batch / Admission Year *
                    </label>
                    <select
                      value={signupData.batch}
                      onChange={(e) => setSignupData({ ...signupData, batch: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs sm:text-sm focus:border-indigo-500 focus:outline-none transition-all cursor-pointer"
                    >
                      <option value="2024-2028">2024 (Batch 2024-2028)</option>
                      <option value="2023-2027">2023 (Batch 2023-2027)</option>
                      <option value="2022-2026">2022 (Batch 2022-2026)</option>
                    </select>
                  </div>

                  {/* 8. Hostel Status */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      8. Hostel Status *
                    </label>
                    <select
                      value={signupData.hostel_status}
                      onChange={(e) => setSignupData({ ...signupData, hostel_status: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs sm:text-sm focus:border-indigo-500 focus:outline-none transition-all cursor-pointer"
                    >
                      <option value="Day Scholar">Day Scholar (Off-Campus)</option>
                      <option value="Hostel Block A">Hostel Block A (Standard Non-AC)</option>
                      <option value="Hostel Block B">Hostel Block B (Deluxe AC)</option>
                    </select>
                  </div>
                </div>

                {/* 9. Phone Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    9. Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={signupData.phone_number}
                      onChange={(e) => setSignupData({ ...signupData, phone_number: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs sm:text-sm focus:border-indigo-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating Student Profile...
                    </>
                  ) : (
                    <>
                      Complete Registration & Launch
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
