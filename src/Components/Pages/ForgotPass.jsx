import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";
import { ChevronLeft, ShieldCheck, Mail, Key, Lock, Loader2, AlertCircle } from "lucide-react";
import { checkIfEmailExists, editPassword } from "../../Services/authService";

/* ---------- SHARED INDUSTRIAL TOKENS ---------- */
const INPUT_STYLE = "w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 bg-white/50 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all shadow-sm";
const BTN_PRIMARY = "w-full py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] transition-all active:scale-[0.98] shadow-lg disabled:opacity-50";

function ForgotPass() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [emailInput, setEmailInput] = useState("");
  const [otp, setOtp] = useState("");
  const [serverOTP, setServerOTP] = useState("");
  const [timer, setTimer] = useState(240);
  const [isActive, setIsActive] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // OTP Expiry Logic
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

  const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

  const initiateRecovery = async () => {
    setError("");
    if (!emailInput) return setError("Registered email is required.");
    if (!accepted) return setError("Please acknowledge the security protocol.");

    setLoading(true);
    try {
      const res = await checkIfEmailExists(emailInput);
      if (!res.exists) {
        setError("This identity is not recognized in our database.");
        setLoading(false);
        return;
      }

      const otpValue = generateOTP();
      setServerOTP(otpValue);

      await emailjs.send(
        "service_65pyqaw", "template_lykbw2q",
        { email: emailInput, otp: otpValue },
        "uZNzBSBvD3wP6-gBT"
      );

      setStep(2);
      setTimer(240);
      setIsActive(true);
      setOtp("");
    } catch (err) {
      setError("Communication relay failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyIdentity = () => {
    setError("");
    if (timer === 0) return setError("Security code has expired.");
    if (otp !== serverOTP) return setError("Invalid verification code.");
    setStep(3);
  };

  const finalizeUpdate = async () => {
    setError("");
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,12}$/;

    if (!passwordRegex.test(newPassword)) {
      return setError("Policy: 8-12 chars, 1 Uppercase, 1 Special char.");
    }

    setLoading(true);
    try {
      await editPassword(emailInput, newPassword);
      // Optional: Send success email here
      navigate("/login");
    } catch (err) {
      setError(err.message || "Failed to sync new credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 antialiased font-sans">
      <div className="bg-white p-10 rounded-3xl w-full max-w-[440px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 relative">
        
        <Link to="/login" className="absolute top-10 left-10 p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-all">
          <ChevronLeft size={20} />
        </Link>

        <div className="text-center mt-6 mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100 mb-6 transform -rotate-3">
            <ShieldCheck size={28} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Security Recovery</h2>
          <div className="flex items-center justify-center gap-2 mt-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-1 w-8 rounded-full transition-all ${step >= s ? "bg-indigo-600" : "bg-slate-100"}`} />
            ))}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-rose-50 border border-rose-100 text-rose-600 text-[11px] font-bold p-3 rounded-xl mb-6 animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        {/* STEP 1: IDENTITY CHALLENGE */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="relative">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">Identity Verification</label>
              <Mail className="absolute left-4 top-[38px] text-indigo-500 w-4 h-4 z-10" />
              <input
                type="email"
                placeholder="registered@company.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className={INPUT_STYLE}
              />
            </div>
            
            <div className="bg-slate-50 p-4 rounded-xl flex gap-3 border border-slate-100">
              <input
                type="checkbox"
                id="terms"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="terms" className="text-[11px] text-slate-500 leading-relaxed font-medium cursor-pointer">
                I authorize the system to generate a one-time security token to the email provided above.
              </label>
            </div>

            <button onClick={initiateRecovery} disabled={loading} className={`${BTN_PRIMARY} bg-slate-900 text-white hover:bg-black`}>
              {loading ? <Loader2 className="animate-spin mx-auto" size={16} /> : "Request Security Token"}
            </button>
          </div>
        )}

        {/* STEP 2: TOKEN VERIFICATION */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Enter 6-Digit Security Token</p>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 w-4 h-4 z-10" />
                <input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className={`${INPUT_STYLE} text-center text-2xl tracking-[0.5em] font-black`}
                />
              </div>
            </div>

            <button onClick={verifyIdentity} className={`${BTN_PRIMARY} bg-indigo-600 text-white hover:bg-indigo-700`}>
              Verify Identity
            </button>

            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                {isActive ? `Token Expires: ${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')}` : "Token Expired"}
              </span>
              <button
                disabled={isActive}
                onClick={initiateRecovery}
                className={`text-[10px] font-black uppercase tracking-widest ${isActive ? "text-slate-200" : "text-indigo-600 underline"}`}
              >
                Resend Token
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CREDENTIAL UPDATE */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="relative">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">New Security Key</label>
              <Lock className="absolute left-4 top-[38px] text-indigo-500 w-4 h-4 z-10" />
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={INPUT_STYLE}
              />
            </div>

            <button 
              onClick={finalizeUpdate} 
              disabled={loading} 
              className={`${BTN_PRIMARY} bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100`}
            >
              {loading ? <Loader2 className="animate-spin mx-auto" size={16} /> : "Update Credentials"}
            </button>
            
            <p className="text-[10px] text-slate-400 text-center font-medium italic">
              Updating your password will terminate all other active sessions for this account.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPass;