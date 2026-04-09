import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { 
  Mail, Lock, ArrowRight, ShieldCheck, 
  Briefcase, Eye, EyeOff, PlusCircle, Loader2 
} from "lucide-react";

import { loginUser } from "../../Services/authService";
import { setUser } from "../../Context/AuthContext";

/* ---------- SHARED INDUSTRIAL TOKENS ---------- */
const INPUT_BASE = "w-full pl-11 pr-12 py-3.5 rounded-xl border border-slate-200 bg-white/50 text-[13px] font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all shadow-sm appearance-none";
const LABEL_BASE = "block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em] ml-1";
const ICON_BASE = "absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 w-4.5 h-4.5 z-10";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [form, setForm] = useState({ email: "", password: "", role: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateField = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.role) return setError("Please specify your access tier.");
    
    setLoading(true);
    setError("");

    try {
      const authUser = await loginUser(form.email, form.password);
      
      // 🛡️ Role Guard
      if (authUser.role !== form.role) {
        throw new Error(`Access Denied: You do not have ${form.role} privileges.`);
      }

      // 🧹 Serialization for Redux (Converts Firebase Timestamps to Millis)
      const serializableUser = {
        ...authUser,
        lastModified: authUser.lastModified?.toMillis ? authUser.lastModified.toMillis() : authUser.lastModified,
        createdAt: authUser.createdAt?.toMillis ? authUser.createdAt.toMillis() : authUser.createdAt,
      };

      dispatch(setUser(serializableUser));
      navigate("/DashboardWrapper", { replace: true });
    } catch (err) {
      setError(err.message || "Authentication failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 antialiased font-sans relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-100 rounded-full blur-[120px] opacity-60" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-slate-200 rounded-full blur-[120px] opacity-40" />
      </div>

      <div className="w-full max-w-[460px] bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden relative z-10">
        <div className="p-10 lg:p-12">
          
          <header className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 rounded-2xl shadow-xl shadow-slate-200 mb-6 transform -rotate-3 transition-transform hover:rotate-0">
              <ShieldCheck className="text-white w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">System Access</h2>
            <p className="text-[11px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Enter your workspace credentials</p>
          </header>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* ROLE SELECTION */}
            <div className="relative">
              <label className={LABEL_BASE}>Access Tier</label>
              <div className="relative">
                <Briefcase className={ICON_BASE} />
                <select 
                  name="role"
                  className={INPUT_BASE}
                  value={form.role}
                  onChange={updateField}
                  required
                >
                  <option value="" disabled>Specify Role</option>
                  <option value="Admin">Administrator</option>
                  <option value="Employee">Staff Member</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ArrowRight className="w-4 h-4 rotate-90" />
                </div>
              </div>
            </div>

            {/* EMAIL FIELD */}
            <div className="relative">
              <label className={LABEL_BASE}>Work Email</label>
              <div className="relative">
                <Mail className={ICON_BASE} />
                <input 
                  name="email"
                  className={INPUT_BASE} 
                  type="email" 
                  placeholder="name@nexus.io" 
                  value={form.email} 
                  onChange={updateField} 
                  required 
                />
              </div>
            </div>

            {/* PASSWORD FIELD */}
            <div className="relative">
              <div className="flex justify-between items-end mb-2">
                <label className={LABEL_BASE}>Security Key</label>
                <Link 
                  to="/forgot-password" 
                  className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest transition-colors mr-1"
                >
                  Lost Key?
                </Link>
              </div>
              <div className="relative">
                <Lock className={ICON_BASE} />
                <input 
                  name="password"
                  className={INPUT_BASE} 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••"
                  value={form.password} 
                  onChange={updateField} 
                  required 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors z-20"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-rose-50 text-rose-600 px-4 py-3 rounded-xl text-[11px] font-bold border border-rose-100 flex items-center gap-2 animate-shake">
                <div className="w-1.5 h-1.5 bg-rose-600 rounded-full animate-pulse" />
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="group relative w-full py-4 bg-slate-900 text-white rounded-xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-slate-200 hover:bg-black active:scale-[0.98] transition-all"
            >
              <span className="flex items-center justify-center gap-3">
                {loading ? <Loader2 className="animate-spin" size={16} /> : "Authorize & Enter"}
                {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </span>
            </button>
          </form>
        </div>

        {/* --- FOOTER REGISTRATION --- */}
        <footer className="px-10 py-8 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-4">
            New Organization?
          </p>
          <Link 
            to="/register-org" 
            className="inline-flex items-center gap-2 px-8 py-3 bg-white border border-slate-200 text-slate-900 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm hover:border-indigo-600 hover:text-indigo-600 transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            Initialize Workspace
          </Link>
        </footer>
      </div>
    </div>
  );
};

export default Login;