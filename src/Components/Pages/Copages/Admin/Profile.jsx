import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { auth } from "../../../../firebase";
import { signOut as firebaseSignOut } from "firebase/auth";
import { editPassword, editUser } from "../../../../Services/authService";
import emailjs from "@emailjs/browser";
import { 
  User, Shield, Mail, Phone, MapPin, Globe, 
  Settings, Lock, LogOut, CheckCircle, AlertCircle, 
  ChevronRight, Camera, Loader2, Save, X
} from "lucide-react";

const Profile = () => {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  
  // --- Core State ---
  const [activeTab, setActiveTab] = useState("account");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const [securityStep, setSecurityStep] = useState("idle"); // idle | otp | reset

  // --- OTP & Security State ---
  const [otpData, setOtpData] = useState({ input: "", server: "", timer: 240, active: false });
  const [newPassword, setNewPassword] = useState("");
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    if (user) setFormData({ ...user });
  }, [user]);

  // --- Logic Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      await editUser("users", user.uid, formData);
      setIsEditing(false);
      setStatusMsg({ type: "success", text: "Profile parameters synchronized successfully." });
    } catch (err) {
      setStatusMsg({ type: "error", text: "Synchronization failed. Check connection." });
    } finally {
      setLoading(false);
    }
  };

  const initPasswordReset = async () => {
    setLoading(true);
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    try {
      await emailjs.send("service_65pyqaw", "template_lykbw2q", 
        { email: user.email, otp: generatedOtp }, "uZNzBSBvD3wP6-gBT"
      );
      setOtpData(prev => ({ ...prev, server: generatedOtp, active: true }));
      setSecurityStep("otp");
    } catch (err) {
      setStatusMsg({ type: "error", text: "Communication service unavailable." });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>;

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans antialiased">
      {/* Top Utility Bar */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-600 p-1.5 rounded-lg text-white"><User size={18}/></span>
            <h1 className="text-sm font-bold tracking-tight uppercase">Identity Management</h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)} 
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              Back to Dashboard
            </button>
            <button 
              onClick={() => { if(window.confirm("Terminate session?")) firebaseSignOut(auth); }}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-rose-600 border border-rose-100 rounded-md hover:bg-rose-50 transition-all"
            >
              <LogOut size={14}/> Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="flex flex-col gap-1">
              <TabButton active={activeTab === "account"} onClick={() => setActiveTab("account")} icon={<User size={16}/>} label="Personal Identity" />
              <TabButton active={activeTab === "security"} onClick={() => setActiveTab("security")} icon={<Shield size={16}/>} label="Access & Security" />
              <TabButton active={activeTab === "localization"} onClick={() => setActiveTab("localization")} icon={<Globe size={16}/>} label="Regional Settings" />
            </div>
            
            <div className="mt-10 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2">Profile Integrity</p>
              <div className="flex items-center gap-2 text-indigo-700">
                <CheckCircle size={14} />
                <span className="text-xs font-semibold text-slate-700">Verified User Account</span>
              </div>
            </div>
          </aside>

          {/* Content Area */}
          <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {/* Header Section */}
            <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex justify-between items-end">
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-xl shadow-indigo-100">
                    {user.name?.charAt(0)}
                  </div>
                  <button className="absolute -bottom-2 -right-2 p-1.5 bg-white border border-slate-200 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={14} className="text-slate-500"/>
                  </button>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 tracking-tight">{user.name}</h2>
                  <p className="text-sm text-slate-500 font-medium">{user.organization} • {user.position}</p>
                </div>
              </div>
              <div className="flex gap-3">
                {isEditing ? (
                  <>
                    <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-xs font-bold text-slate-500">Discard</button>
                    <button onClick={handleUpdateProfile} className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
                      <Save size={14}/> Synchronize Changes
                    </button>
                  </>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-5 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-all">
                    <Settings size={14}/> Modify Profile
                  </button>
                )}
              </div>
            </div>

            <div className="p-8">
              {statusMsg.text && (
                <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 text-sm font-semibold border ${statusMsg.type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
                  {statusMsg.type === 'error' ? <AlertCircle size={16}/> : <CheckCircle size={16}/>}
                  {statusMsg.text}
                </div>
              )}

              {activeTab === "account" && (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <DataField label="Full Legal Name" name="name" value={formData.name} isEditing={isEditing} onChange={handleInputChange} />
                    <DataField label="Registered Email" name="email" value={formData.email} isEditing={false} />
                    <DataField label="Primary Contact" name="phone" value={formData.phone} isEditing={isEditing} onChange={handleInputChange} />
                    <DataField label="Organization" name="organization" value={formData.organization} isEditing={isEditing} onChange={handleInputChange} />
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="p-6 border border-slate-100 rounded-xl bg-slate-50/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">Password & Authentication</h4>
                        <p className="text-xs text-slate-500 mt-1">Last synchronized: {new Date().toLocaleDateString()}</p>
                      </div>
                      {securityStep === "idle" && (
                        <button onClick={initPasswordReset} className="px-4 py-2 border border-indigo-200 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-50 transition-all">
                          Initiate Key Update
                        </button>
                      )}
                    </div>

                    {securityStep === "otp" && (
                      <div className="mt-6 pt-6 border-t border-slate-200 flex flex-col items-center">
                        <p className="text-xs font-semibold text-slate-600 mb-4">Verification code dispatched to {user.email}</p>
                        <input 
                          maxLength={6} 
                          className="w-40 text-center text-xl font-mono tracking-widest border-b-2 border-indigo-600 py-2 outline-none mb-4"
                          placeholder="000000"
                          onChange={(e) => { if(e.target.value === otpData.server) setSecurityStep("reset"); }}
                        />
                        <button onClick={() => setSecurityStep("idle")} className="text-[10px] font-bold text-slate-400 uppercase hover:text-rose-500 transition-colors">Cancel Procedure</button>
                      </div>
                    )}

                    {securityStep === "reset" && (
                      <div className="mt-6 pt-6 border-t border-slate-200">
                        <div className="max-w-xs mx-auto space-y-4">
                          <input 
                            type="password" 
                            className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm"
                            placeholder="Define new secure password"
                            onChange={(e) => setNewPassword(e.target.value)}
                          />
                          <button className="w-full py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-md shadow-indigo-100 hover:bg-indigo-700">
                            Update Credentials
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <DataField label="System UUID" value={user.uid} isEditing={false} />
                    <DataField label="Assigned Role" value={user.role} isEditing={false} />
                  </div>
                </div>
              )}

              {activeTab === "localization" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500">
                  <DataField label="Municipality / City" name="city" value={formData.city} isEditing={isEditing} onChange={handleInputChange} />
                  <DataField label="Region / State" name="state" value={formData.state} isEditing={isEditing} onChange={handleInputChange} />
                  <DataField label="Postal / Pin Code" name="pinCode" value={formData.pinCode} isEditing={isEditing} onChange={handleInputChange} />
                  <DataField label="Full Domicile Address" name="address" value={formData.address} isEditing={isEditing} onChange={handleInputChange} />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// --- Sub-Components ---

const TabButton = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
      active ? "bg-white text-indigo-600 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
    }`}
  >
    {icon}
    {label}
  </button>
);

const DataField = ({ label, value, isEditing, name, onChange }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</label>
    {isEditing ? (
      <input 
        name={name}
        value={value || ""}
        onChange={onChange}
        className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
      />
    ) : (
      <div className="text-sm font-bold text-slate-700 border-b border-transparent py-2">
        {value || "Not Configured"}
      </div>
    )}
  </div>
);

export default Profile;