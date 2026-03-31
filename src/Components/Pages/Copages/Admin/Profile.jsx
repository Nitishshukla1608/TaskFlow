import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { auth } from "../../../../firebase";
import { signOut as firebaseSignOut } from "firebase/auth";
import { editPassword, editUser, checkIfEmailExists } from "../../../../Services/authService"; // Import from your service
import emailjs from "@emailjs/browser";

import {
  Mail, Shield, MapPin, Phone, Hash, Globe,
  Map, Calendar, Edit3, Lock, Save, X, LogOut, Briefcase
} from "lucide-react";

function Profile() {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();

  // OTP Modal States
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [emailInput, setEmailInput] = useState("");
  const [otp, setOtp] = useState("");
  const [serverOTP, setServerOTP] = useState("");
  const [timer, setTimer] = useState(240);
  const [isActive, setIsActive] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");

  // Profile Edit States
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        country: user.country || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        pinCode: user.pinCode || "",
        position: user.position || "",
        organization: user.organization || "",
      });
      setEmailInput(user.email || "");
    }
  }, [user]);

  useEffect(() => {
    let interval = null;
    if (isActive && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0) {
      setIsActive(false);
      setServerOTP(""); 
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setError("");
    setLoading(true);
    try {
      await editUser("users", user.uid, formData);
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      setError("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      try {
        await firebaseSignOut(auth);
        localStorage.clear();
        sessionStorage.clear();
        navigate("/login");
      } catch (err) {
        console.error("Logout failed", err);
      }
    }
  };

  const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

  const sendOTP = async () => {
    setOtpError("");
    if (!accepted) return setOtpError("Please accept terms & conditions");
    if (!emailInput) return setOtpError("Email required");
    
    // Safety Check: User logged in email must match
    if (emailInput.toLowerCase() !== user.email.toLowerCase()) {
      return setOtpError("Please enter your registered email address.");
    }

    setOtpLoading(true);
    try {
      const otpValue = generateOTP();
      setServerOTP(otpValue);

      await emailjs.send(
        "service_65pyqaw",
        "template_lykbw2q",
        { email: emailInput, otp: otpValue },
        "uZNzBSBvD3wP6-gBT"
      );

      setStep(2);
      setTimer(240);
      setIsActive(true);
      setOtp("");
    } catch (err) {
      setOtpError("Failed to send OTP. Try again later.");
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOTP = () => {
    if (timer === 0) return setOtpError("OTP expired.");
    if (otp !== serverOTP || !serverOTP) return setOtpError("Invalid OTP");
    setOtpError("");
    setStep(3);
  };

  const handlePasswordChange = async () => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,12}$/;
    if (!passwordRegex.test(newPassword)) {
      return setOtpError("Password must be 8-12 chars, 1 uppercase & 1 special char.");
    }

    try {
      setOtpLoading(true);
      await editPassword(user.uid, newPassword);
      alert("Password updated successfully ✅");
      closeModal();
    } catch (err) {
      setOtpError("Update failed. You may need to re-login first.");
    } finally {
      setOtpLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setStep(1);
    setOtp("");
    setNewPassword("");
    setServerOTP("");
    setOtpError("");
    setAccepted(false);
    setIsActive(false);
    setTimer(240);
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";
    if (dateValue.toDate) return dateValue.toDate().toLocaleDateString();
    if (dateValue.seconds) return new Date(dateValue.seconds * 1000).toLocaleDateString();
    return new Date(dateValue).toLocaleDateString();
  };

  if (!user) return <div className="p-8 text-center font-bold">Loading...</div>;

  return (
    <div className="p-4 md:p-8 bg-[#f8fafc] min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
          {/* Banner */}
          <div className="h-40 bg-gradient-to-r from-indigo-600 to-violet-600 w-full relative">
            <div className="absolute -bottom-12 left-10 flex items-end gap-6">
              <div className="w-32 h-32 bg-white rounded-[2.5rem] p-2 shadow-2xl shrink-0">
                <div className="w-full h-full bg-slate-100 rounded-[2rem] flex items-center justify-center text-4xl font-black text-indigo-600 uppercase">
                  {user.name?.charAt(0)}
                </div>
              </div>
              <div className="pb-12 hidden sm:block">
                <h2 className="text-3xl font-black text-white drop-shadow-md">{user.name}</h2>
                <p className="text-indigo-100 font-bold opacity-90">{user.organization} • {user.position}</p>
              </div>
            </div>

            <div className="absolute bottom-6 right-6 md:right-10 flex items-center gap-3 z-20">
              {!isEditing && (
                <button onClick={handleLogout} className="flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-2xl font-bold hover:bg-rose-500 transition-all">
                  <LogOut size={18} /> Logout
                </button>
              )}
              <button onClick={() => setIsEditing(!isEditing)} className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg ${isEditing ? "bg-rose-400 text-white" : "bg-white text-slate-800"}`}>
                {isEditing ? <><X size={18} /> Cancel</> : <><Edit3 size={18} /> Edit Profile</>}
              </button>
            </div>
          </div>

          <div className="pt-20 px-10 pb-10">
            {error && <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 font-bold text-sm">{error}</div>}

            {isEditing && (
              <div className="mb-8 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-between">
                <p className="text-indigo-600 text-sm font-bold">Editing Mode Active</p>
                <button onClick={handleSave} disabled={loading} className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-md hover:bg-indigo-700 disabled:opacity-50">
                  {loading ? "Saving..." : <><Save size={18} /> Save Changes</>}
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <SectionHeader title="Identification & Role" />
              <InfoBox icon={<Hash />} label="User UID" value={user.uid} />
              <InfoBox icon={<Lock />} label="Password" openModal={() => setShowModal(true)} />
              <InfoBox icon={<Shield />} label="Registration ID" value={user.regId} />
              <InfoBox icon={<Briefcase />} label="System Role" value={user.role} />

              <SectionHeader title="Contact Details" />
              <InfoBox isEditing={isEditing} icon={<Mail />} label="Email Address" name="email" value={formData.email} onChange={handleChange} />
              <InfoBox isEditing={isEditing} icon={<Phone />} label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} />
              <InfoBox icon={<Calendar />} label="Joined Date" value={formatDate(user.createdAt)} />

              <SectionHeader title="Location Info" />
              <InfoBox isEditing={isEditing} icon={<Map />} label="City" name="city" value={formData.city} onChange={handleChange} />
              <InfoBox isEditing={isEditing} icon={<Globe />} label="State" name="state" value={formData.state} onChange={handleChange} />
              <InfoBox isEditing={isEditing} icon={<Hash />} label="Pin Code" name="pinCode" value={formData.pinCode} onChange={handleChange} />
              
              <div className="md:col-span-2 lg:col-span-3">
                <InfoBox isEditing={isEditing} icon={<MapPin />} label="Full Address" name="address" value={formData.address} onChange={handleChange} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Reset Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl">
            <h2 className="font-bold text-2xl mb-2 text-center text-slate-900">Reset Password</h2>
            <p className="text-sm text-gray-500 text-center mb-6">Verification for <span className="font-bold text-indigo-600">{user.email}</span></p>

            {otpError && <p className="text-rose-500 text-xs mb-4 text-center font-bold bg-rose-50 p-2 rounded-lg">{otpError}</p>}

            <div className="flex justify-between mb-8 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <span className={step >= 1 ? "text-indigo-600" : ""}>1. Verify</span>
              <span className={step >= 2 ? "text-indigo-600" : ""}>2. OTP</span>
              <span className={step >= 3 ? "text-indigo-600" : ""}>3. Update</span>
            </div>

            {step === 1 && (
              <div className="space-y-4">
                <input type="email" placeholder="Confirm registered email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium" />
                <div className="flex items-start gap-3">
                  <input type="checkbox" id="terms" className="mt-1" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
                  <label htmlFor="terms" className="text-[11px] text-gray-500 font-medium">I will not share this OTP with anyone.</label>
                </div>
                <button onClick={sendOTP} disabled={otpLoading} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-indigo-600 transition-all disabled:opacity-50">
                  {otpLoading ? "Sending..." : "Send OTP"}
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <input type="text" maxLength={6} placeholder="000000" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full border border-gray-200 p-4 rounded-xl text-center text-2xl tracking-[0.5em] font-black focus:ring-2 focus:ring-indigo-500 outline-none" />
                <button onClick={verifyOTP} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all">Verify Code</button>
                <div className="flex justify-between px-1">
                  <p className="text-[11px] text-gray-400 font-bold uppercase">{isActive ? `Resend in ${timer}s` : "Expired"}</p>
                  <button disabled={isActive} onClick={sendOTP} className={`text-[11px] font-black uppercase underline ${isActive ? "text-gray-300" : "text-indigo-600"}`}>Resend OTP</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <input type="password" placeholder="New secure password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium" />
                <button onClick={handlePasswordChange} disabled={otpLoading} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all">
                  {otpLoading ? "Updating..." : "Update Password"}
                </button>
              </div>
            )}

            <button onClick={closeModal} className="mt-6 text-[11px] text-gray-400 w-full font-black uppercase tracking-widest hover:text-rose-500 transition">Cancel and Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-components
function SectionHeader({ title }) {
  return (
    <div className="lg:col-span-3 mt-4">
      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 border-b border-slate-50 pb-2">{title}</h3>
    </div>
  );
}

function InfoBox({ icon, label, value, isEditing, name, onChange, openModal }) {
  const isPassword = label === "Password";
  return (
    <div className="flex flex-col gap-2 p-5 bg-slate-50 rounded-[2rem] border border-slate-100 transition-all hover:bg-white hover:shadow-sm">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-white text-indigo-600 rounded-xl shadow-sm">{icon}</div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      </div>
      <div className="mt-1">
        {isPassword ? (
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-slate-700 tracking-widest">••••••••</p>
            {!isEditing && <button onClick={openModal} className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded-lg"><Edit3 size={14} /></button>}
          </div>
        ) : isEditing && onChange ? (
          <input name={name} type="text" value={value || ""} onChange={onChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-1.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
        ) : (
          <p className="text-sm font-bold text-slate-700 truncate">{value || "---"}</p>
        )}
      </div>
    </div>
  );
}

export default Profile;