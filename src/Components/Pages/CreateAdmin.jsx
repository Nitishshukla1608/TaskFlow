import React, { useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";
import { 
  Eye, EyeOff, Paperclip, Mail, Lock, User, 
  Phone, Building2, Hash, MapPin, Globe, ShieldCheck, ChevronLeft, Loader2
} from "lucide-react";

import { addUser as serviceAddUser } from "../../Services/authService";
import { setUser } from "../../Context/AuthContext";

/* ---------- SHARED INDUSTRIAL TOKENS ---------- */
const INPUT_BASE = "w-full pl-10 pr-12 py-3 rounded-lg border border-slate-200 bg-white text-[13px] font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all";
const DISABLED_BASE = "w-full pl-10 pr-12 py-3 rounded-lg border border-slate-100 bg-slate-50 text-slate-400 text-[13px] font-bold cursor-not-allowed";
const LABEL_BASE = "block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-[0.2em] ml-1";
const ICON_BASE = "absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-500 w-4 h-4";

export const CreateAdmin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Organization context from Redux (Set in previous step)
  const organization = useSelector((state) => state.auth.organization);

  /* --- State Orchestration --- */
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    position: "", regId: "", countryCode: "+91", phoneNumber: "",
    country: "India", address: "", city: "", state: "", pinCode: ""
  });

  const updateField = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleDeployment = async (e) => {
    e.preventDefault();
    setError("");

    // 🔐 Security Validation
    const passRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,12}$/;
    if (!passRegex.test(form.password)) {
      return setError("Security Policy: Password must be 8-12 chars with 1 Uppercase & 1 Special char.");
    }
    if (form.password !== form.confirmPassword) {
      return setError("Validation Error: Passwords do not match.");
    }

    setLoading(true);

    try {
      // 1. Create Identity in Infrastructure
      const newUser = await serviceAddUser(
        form.name, form.email, form.password, "Admin", form.position, 
        organization.name, form.regId, `${form.countryCode}${form.phoneNumber}`, 
        form.country, form.address, form.city, form.state, form.pinCode
      );

      dispatch(setUser(newUser));

      // 2. Transmit Welcome Protocol
      try {
        await emailjs.send(
          "service_65pyqaw", "template_nelf9do",
          { name:form.name,position:form.position,regId:form.regId,user_email:form.email,password:form.password, organization: organization.name}, "uZNzBSBvD3wP6-gBT"
        );
      } catch (e) { console.warn("Email relay failed."); }

      navigate("/DashboardWrapper");
    } catch (err) {
      setError(err.message || "Credential deployment failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-6 flex items-center justify-center font-sans antialiased">
      <div className="max-w-6xl w-full bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
        
        {/* Header: System Context */}
        <header className="px-10 py-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-50/50">
          <div className="flex items-center gap-5">
            <button onClick={() => navigate(-1)} className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-900 transition-all shadow-sm">
              <ChevronLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded">
                  Identity Provisioning
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Onboard Root <span className="text-slate-400 italic">Administrator</span>
              </h1>
            </div>
          </div>
          
          {error && (
            <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-100 rounded text-[11px] font-bold text-rose-600 uppercase">
              <ShieldCheck size={14} /> {error}
            </div>
          )}
        </header>

        <form onSubmit={handleDeployment} className="p-10 lg:p-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            
            {/* COLUMN 1: ACCESS CONTROL */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-4 bg-indigo-500 rounded-full" />
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-800">01. Access Control</h3>
              </div>
              
              <div className="space-y-4">
                <Field label="Legal Name" icon={<User className={ICON_BASE} />}>
                  <input className={INPUT_BASE} name="name" type="text" placeholder="Alex Rivera" onChange={updateField} required />
                </Field>

                <Field label="Identity (Email)" icon={<Mail className={ICON_BASE} />}>
                  <input className={INPUT_BASE} name="email" type="email" placeholder="alex@nexus.io" onChange={updateField} required />
                </Field>

                <div className="pt-4 border-t border-slate-50 space-y-4">
                  <Field label="Security Key" icon={<Lock className={ICON_BASE} />}>
                    <input className={INPUT_BASE} name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" onChange={updateField} required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </Field>

                  <Field label="Confirm Security Key" icon={<ShieldCheck className={ICON_BASE} />}>
                    <input className={INPUT_BASE} name="confirmPassword" type="password" placeholder="••••••••" onChange={updateField} required />
                  </Field>
                </div>
              </div>
            </div>

            {/* COLUMN 2: PROFESSIONAL NODE */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-4 bg-indigo-500 rounded-full" />
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-800">02. Professional Node</h3>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Permissions">
                    <div className="relative">
                      <ShieldCheck className={ICON_BASE} />
                      <input className={DISABLED_BASE} value="Admin" readOnly disabled />
                    </div>
                  </Field>
                  <Field label="Title">
                    <select name="position" className="w-full px-3 py-3 rounded-lg border border-slate-200 bg-white text-[13px] font-medium focus:border-indigo-600 outline-none" onChange={updateField} required>
                      <option value="">Select</option>
                      <option value="Manager">Manager</option>
                      <option value="Lead">Lead</option>
                      <option value="Director">Director</option>
                    </select>
                  </Field>
                </div>

                <Field label="Locked Organization" icon={<Building2 className={ICON_BASE} />}>
                  <input className={DISABLED_BASE} value={organization.name || "Nexus Enterprise"} readOnly disabled />
                </Field>

                <Field label="System ID / Employee Code" icon={<Hash className={ICON_BASE} />}>
                  <div className="flex gap-2">
                    <input className={INPUT_BASE} name="regId" type="text" placeholder="ID-4400" onChange={updateField} required />
                    <label className="flex items-center px-4 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                      <Paperclip size={16} className="text-slate-400" />
                      <input type="file" className="hidden" />
                    </label>
                  </div>
                </Field>

                <Field label="Comms Channel">
                  <div className="flex gap-2">
                    <select name="countryCode" className="w-20 px-2 py-3 rounded-lg border border-slate-200 text-[11px] font-bold" onChange={updateField}>
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+1">🇺🇸 +1</option>
                    </select>
                    <div className="relative flex-1">
                      <Phone className={ICON_BASE} />
                      <input className={INPUT_BASE} name="phoneNumber" type="tel" maxLength={10} placeholder="9998887776" onChange={updateField} required />
                    </div>
                  </div>
                </Field>
              </div>
            </div>

            {/* COLUMN 3: REGIONAL DATA */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-4 bg-indigo-500 rounded-full" />
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-800">03. Regional Data</h3>
              </div>

              <div className="space-y-4">
                <Field label="Geography" icon={<Globe className={ICON_BASE} />}>
                  <select name="country" className={INPUT_BASE} onChange={updateField} required>
                    <option value="India">India</option>
                    <option value="UAE">UAE</option>
                    <option value="United States">United States</option>
                  </select>
                </Field>

                <Field label="Deployment Address" icon={<MapPin className={ICON_BASE} />}>
                  <input className={INPUT_BASE} name="address" type="text" placeholder="Floor 12, Tech Park" onChange={updateField} required />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="City">
                    <input className="w-full px-4 py-3 rounded-lg border border-slate-200 text-[13px] font-medium" name="city" placeholder="City" onChange={updateField} required />
                  </Field>
                  <Field label="State">
                    <input className="w-full px-4 py-3 rounded-lg border border-slate-200 text-[13px] font-medium" name="state" placeholder="State" onChange={updateField} required />
                  </Field>
                </div>

                <Field label="ZIP / Postal Code">
                  <input className="w-full px-4 py-3 rounded-lg border border-slate-200 text-[13px] font-medium" name="pinCode" placeholder="000 000" onChange={updateField} required />
                </Field>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-[11px] text-slate-400 font-medium max-w-sm text-center md:text-left">
              Proceeding will finalize the administrative node for <span className="text-slate-900 font-bold">{organization.name}</span>. Access logs will be recorded.
            </p>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full md:w-auto px-12 py-4 bg-slate-900 text-white rounded-lg text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? <><Loader2 className="animate-spin" size={16} /> Deploying Member...</> : "Initialize Admin Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* --- Internal Helper Components --- */
const Field = ({ label, children, icon }) => (
  <div className="relative">
    <label className={LABEL_BASE}>{label}</label>
    <div className="relative">
      {icon}
      {children}
    </div>
  </div>
);