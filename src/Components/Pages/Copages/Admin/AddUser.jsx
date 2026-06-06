import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";
import { addUser } from "../../../../Services/authService";
import { 
  ChevronLeft, Eye, EyeOff, UserPlus, Shield, 
  Briefcase, MapPin, CheckCircle2, AlertCircle, Loader2
} from "lucide-react";

// Professional UI Constants
const COUNTRIES = ["India", "United States", "United Kingdom", "Canada", "Germany", "UAE"];
const POSITIONS = ["Software Engineer", "Product Manager", "Lead Designer", "HR Operations", "Sales Lead"];

export const AddUser = () => {
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);

  // Core State Object
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    role: "Employee", position: "", regId: "",
    countryCode: "+91", phoneNumber: "",
    country: "", address: "", city: "", state: "", pinCode: ""
  });

  const [uiState, setUiState] = useState({
    loading: false,
    error: "",
    showPass: false,
    showConfirm: false,
    success: false
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,14}$/;
    
    if (!formData.name || !formData.email || !formData.position) {
      setUiState(prev => ({ ...prev, error: "Required: Please complete all Identity & Position fields." }));
      return false;
    }
    if (!passwordRegex.test(formData.password)) {
      setUiState(prev => ({ ...prev, error: "Policy: Password must be 8-14 chars with 1 Uppercase & 1 Special char." }));
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setUiState(prev => ({ ...prev, error: "Mismatch: Security credentials do not match." }));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    setUiState(prev => ({ ...prev, loading: true, error: "" }));
  
    try {
      // 1. Provision user in Backend/Firebase
      await addUser(
        formData.name,
        formData.email,
        formData.password,
        formData.role,
        formData.position,
        authUser?.organization, 
        formData.regId,
        `${formData.countryCode}${formData.phoneNumber}`,
        formData.country,
        formData.address,
        formData.city,
        formData.state,
        formData.pinCode,
        authUser?.orgId 
      );
  
      // 2. Dispatch Welcome Email via EmailJS
      await emailjs.send(
        "service_65pyqaw", 
        "template_nelf9do", // Suggest creating a specific welcome template
        { 
          name: formData.name, 
          position:formData.position,
          regId:formData.regId,user_email:formData.email,password:formData.password, organization: authUser.organization}, "uZNzBSBvD3wP6-gBT"
      );
      
      setUiState(prev => ({ ...prev, success: true }));
      setTimeout(() =>   navigate("/AdminDashboard", { replace: true }), 1500);
    } catch (err) {
      const errorMessage = err.code === 'auth/email-already-in-use' 
        ? "Conflict: This email is already assigned to another account." 
        : "System Error: Failed to provision credentials. Try again.";
      setUiState(prev => ({ ...prev, error: errorMessage }));
    } finally {
      setUiState(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col items-center py-12 px-4 relative">
      
      {/* Success Modal Overlay */}
      {uiState.success && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-500">
          <div className="text-center p-8 bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-sm">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-6">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Account Provisioned</h2>
            <p className="text-slate-500 text-sm mt-2 font-medium">Welcome email dispatched. Syncing directory...</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-5xl">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-slate-400 hover:text-slate-900 text-xs font-bold uppercase tracking-widest mb-8 transition-colors"
        >
          <ChevronLeft size={16} className="mr-1" /> Back to Directory
        </button>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Form Header */}
          <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">New Member Provisioning</h1>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Context: {authUser?.organization || "N/A"}</p>
            </div>
            <div className="bg-slate-900 p-3 rounded-2xl text-white shadow-xl shadow-slate-200">
              <UserPlus size={24} />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              
              {/* Left Side: Core Identity */}
              <div className="lg:col-span-7 space-y-10">
                <section>
                  <FormSectionHeader icon={<Shield size={14}/>} title="Authentication & Keys" />
                  <div className="grid grid-cols-2 gap-6 mt-6">
                    <InputField label="Legal Name" name="name" value={formData.name} onChange={handleInputChange} placeholder="Sarah Chen" />
                    <InputField label="Corp Email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="sarah@org.com" />
                    <PasswordField 
                      label="Temp Password" 
                      name="password" 
                      value={formData.password} 
                      visible={uiState.showPass} 
                      toggle={() => setUiState(p => ({...p, showPass: !p.showPass}))} 
                      onChange={handleInputChange} 
                    />
                    <PasswordField 
                      label="Confirm Access" 
                      name="confirmPassword" 
                      value={formData.confirmPassword} 
                      visible={uiState.showConfirm} 
                      toggle={() => setUiState(p => ({...p, showConfirm: !p.showConfirm}))} 
                      onChange={handleInputChange} 
                    />
                  </div>
                </section>

                <section>
                  <FormSectionHeader icon={<Briefcase size={14}/>} title="Organization Profile" />
                  <div className="grid grid-cols-3 gap-6 mt-6">
                    <SelectField label="System Role" name="role" value={formData.role} onChange={handleInputChange} options={["Employee", "Admin", "Restricted"]} />
                    <SelectField label="Position" name="position" value={formData.position} onChange={handleInputChange} options={POSITIONS} />
                    <InputField label="Asset ID" name="regId" value={formData.regId} onChange={handleInputChange} placeholder="EMP-001" />
                  </div>
                </section>
              </div>

              {/* Right Side: Logistics */}
              <div className="lg:col-span-5 bg-slate-50/50 p-8 rounded-2xl border border-slate-100 h-fit">
                <FormSectionHeader icon={<MapPin size={14}/>} title="Regional Assignment" />
                <div className="space-y-6 mt-6">
                  <SelectField label="Region" name="country" value={formData.country} onChange={handleInputChange} options={COUNTRIES} />
                  
                  <div className="flex gap-4">
                    <div className="w-24">
                      <InputField label="Code" name="countryCode" value={formData.countryCode} onChange={handleInputChange} />
                    </div>
                    <div className="flex-1">
                      <InputField label="Phone" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} placeholder="9876543210" />
                    </div>
                  </div>

                  <InputField label="Work Address" name="address" value={formData.address} onChange={handleInputChange} placeholder="Floor 4, Tech Park" />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="City" name="city" value={formData.city} onChange={handleInputChange} />
                    <InputField label="Pin Code" name="pinCode" value={formData.pinCode} onChange={handleInputChange} />
                  </div>
                </div>

                {uiState.error && (
                  <div className="mt-8 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-[11px] font-black uppercase tracking-widest flex items-center gap-3">
                    <AlertCircle size={16} /> {uiState.error}
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="mt-12 pt-8 border-t border-slate-100 flex justify-end items-center gap-6">
              <button 
                type="button" 
                onClick={() => navigate(-1)} 
                className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-rose-500 transition-colors"
              >
                Discard Draft
              </button>
              <button 
                type="submit" 
                disabled={uiState.loading}
                className="px-10 py-4 bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-indigo-600 shadow-xl shadow-slate-200 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
              >
                {uiState.loading ? <Loader2 size={16} className="animate-spin" /> : "Finalize Provisioning"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// --- Helper Components ---

const FormSectionHeader = ({ icon, title }) => (
  <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
    <span className="text-indigo-600">{icon}</span>
    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</h3>
  </div>
);

const InputField = ({ label, ...props }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>
    <input 
      className="px-4 py-2.5 text-sm font-medium border border-slate-200 rounded-xl bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-900 outline-none transition-all placeholder:text-slate-300"
      {...props}
    />
  </div>
);

const SelectField = ({ label, options, ...props }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>
    <select 
      className="px-4 py-2.5 text-sm font-medium border border-slate-200 rounded-xl bg-white focus:border-slate-900 outline-none cursor-pointer"
      {...props}
    >
      <option value="">Select...</option>
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

const PasswordField = ({ label, visible, toggle, ...props }) => (
  <div className="flex flex-col gap-2 relative">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative">
      <input 
        type={visible ? "text" : "password"}
        className="w-full px-4 py-2.5 text-sm font-medium border border-slate-200 rounded-xl focus:border-slate-900 outline-none"
        {...props}
      />
      <button 
        type="button" 
        onClick={toggle}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900"
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  </div>
);