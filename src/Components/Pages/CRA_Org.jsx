import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  FiBriefcase, FiMail, FiUsers, FiUploadCloud, 
  FiMapPin, FiCheckCircle, FiArrowLeft, FiShield 
} from "react-icons/fi";
import {addOrganization} from "../../Services/authService"

const INPUT_CLASS = "w-full pl-11 pr-4 py-3 bg-white/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-700 font-medium placeholder:text-slate-400";
const LABEL_STYLE = "text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block";
const ICON_STYLE = "absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 w-5 h-5";

function CRA_Org() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name : "",
    orgEmail: "",
    industry: "",
    teamSize: "",
    location: "",
    role: "Admin", // Always Admin as per your requirement
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Reset error at start of new attempt
  
    try {
      // 1. Call your Firebase service
      await addOrganization(formData);
      
      // 2. Success Feedback
      alert("🚀 Organization created successfully!");
      
      // 3. Navigation happens ONLY on success
      navigate("/login");
    } catch (err) {
      // 4. Handle errors (e.g., org name already exists)
      console.error("Registration Error:", err);
      setError(err.message || "Failed to create organization. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 py-12">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-5 bg-white rounded-[3rem] shadow-2xl shadow-indigo-100/50 border border-slate-100 overflow-hidden">
        
        {/* Left Side: Info Panel */}
        <div className="lg:col-span-2 bg-indigo-600 p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8">
              <FiShield size={24} />
            </div>
            <h2 className="text-3xl font-black leading-tight mb-4">Register Your Organization</h2>
            <p className="text-indigo-100 font-medium text-sm leading-relaxed">
              Join hundreds of teams managing their workflows efficiently. Set up your workspace in minutes.
            </p>
          </div>

          <div className="space-y-4 relative z-10 mt-10">
            <div className="flex items-center gap-3 text-xs font-bold bg-white/10 p-3 rounded-xl border border-white/10">
              <FiCheckCircle className="text-emerald-400" /> Secure Cloud Storage
            </div>
            <div className="flex items-center gap-3 text-xs font-bold bg-white/10 p-3 rounded-xl border border-white/10">
              <FiCheckCircle className="text-emerald-400" /> Admin Control Panel
            </div>
          </div>

          {/* Decorative Circle */}
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-500 rounded-full opacity-50"></div>
        </div>

        {/* Right Side: Form */}
        <div className="lg:col-span-3 p-8 md:p-12">
          <Link to="/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-indigo-600 text-xs font-bold mb-8 transition-colors">
            <FiArrowLeft /> BACK TO LOGIN
          </Link>



          {error && (
  <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-2xl flex items-center gap-2 animate-shake">
    <FiShield className="flex-shrink-0" />
    {error}
  </div>
)}


          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Org Name */}
              <div className="md:col-span-2">
                <label className={LABEL_STYLE}>Organization Name</label>
                <div className="relative">
                  <FiBriefcase className={ICON_STYLE} />
                  <input 
                    name="name" 
                    required 
                    type="text" 
                    placeholder="e.g. Acme Corp" 
                    className={INPUT_CLASS} 
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Org Email */}
              <div className="md:col-span-1">
                <label className={LABEL_STYLE}>Company Email</label>
                <div className="relative">
                  <FiMail className={ICON_STYLE} />
                  <input 
                    name="orgEmail" 
                    required 
                    type="email" 
                    placeholder="admin@company.com" 
                    className={INPUT_CLASS} 
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Fixed Role: Admin */}
              <div className="md:col-span-1">
                <label className={LABEL_STYLE}>Your Access Role</label>
                <div className="relative">
                  <FiShield className={ICON_STYLE} />
                  <select 
                    name="role" 
                    className={`${INPUT_CLASS} cursor-not-allowed opacity-70`} 
                    disabled 
                    value="Admin"
                  >
                    <option value="Admin">Admin (Organization Creator)</option>
                  </select>
                </div>
              </div>

              {/* Industry */}
              <div>
                <label className={LABEL_STYLE}>Industry</label>
                <div className="relative">
                  <FiBriefcase className={ICON_STYLE} />
                  <select name="industry" required className={INPUT_CLASS} onChange={handleChange}>
                    <option value="">Select Industry</option>
                    <option value="tech">Technology</option>
                    <option value="finance">Finance</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="education">Education</option>
                  </select>
                </div>
              </div>

              {/* Team Size */}
              <div>
                <label className={LABEL_STYLE}>Team Size</label>
                <div className="relative">
                  <FiUsers className={ICON_STYLE} />
                  <select name="teamSize" required className={INPUT_CLASS} onChange={handleChange}>
                    <option value="">Expected Members</option>
                    <option value="1-10">1-10 Members</option>
                    <option value="11-50">11-50 Members</option>
                    <option value="50+">50+ Members</option>
                  </select>
                </div>
              </div>

              {/* Location */}
              <div className="md:col-span-2">
                <label className={LABEL_STYLE}>Headquarters Location</label>
                <div className="relative">
                  <FiMapPin className={ICON_STYLE} />
                  <input 
                    name="location" 
                    required 
                    type="text" 
                    placeholder="City, Country" 
                    className={INPUT_CLASS} 
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* File Upload (Optional) */}
              <div className="md:col-span-2">
                <label className={LABEL_STYLE}>Registration Paper (Optional)</label>
                <div className="relative group cursor-pointer">
                  <input 
                    type="file" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                  />
                  <div className="w-full p-6 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center gap-2 group-hover:border-indigo-400 transition-all bg-slate-50/50">
                    <FiUploadCloud size={24} className="text-slate-400 group-hover:text-indigo-500" />
                    <span className="text-xs font-bold text-slate-400">Click to upload PDF or Image</span>
                  </div>
                </div>
              </div>

            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-50 mt-4 shadow-xl shadow-slate-200"
            >
              {loading ? "Registering Workspace..." : "Create Organization Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CRA_Org;