import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import { checkIfEmailExists, editPassword } from "../../Services/authService"; // Ensure editPassword is imported

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
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");

  // OTP Expiry Timer logic
  useEffect(() => {
    let interval = null;
    if (isActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsActive(false);
      setServerOTP(""); // Expire the OTP logic
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timer]);

  const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

  const sendOTP = async () => {
    setOtpError("");
    
    if (!emailInput) return setOtpError("Email required");
    if (!emailInput.toLowerCase().endsWith("@gmail.com")) {
      return setOtpError("Please use a valid @gmail.com address");
    }
    if (!accepted) return setOtpError("Please accept terms & conditions");

    setOtpLoading(true);

    try {
      // 🔹 Check email exists
      const res = await checkIfEmailExists(emailInput);
      if (!res.exists) {
        setOtpError("Email is not registered in our system");
        return;
      }

      // 🔹 Generate & Send OTP
      const otpValue = generateOTP();
      setServerOTP(otpValue);

      await emailjs.send(
        "service_65pyqaw",
        "template_lykbw2q",
        {
          email: emailInput,
          otp: otpValue,
        },
        "uZNzBSBvD3wP6-gBT"
      );

      setStep(2);
      setTimer(240);
      setIsActive(true);
      setOtp("");

    } catch (err) {
      console.error(err);
      setOtpError("Failed to send OTP. Try again later.");
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOTP = () => {
    setOtpError(""); // Reset error first
    if (timer === 0) return setOtpError("OTP expired. Please resend.");
    if (otp !== serverOTP || !serverOTP) return setOtpError("Invalid OTP code");
    
    setStep(3);
  };

  const handlePasswordChange = async () => {
    setOtpError("");
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,12}$/;

    if (!passwordRegex.test(newPassword)) {
      return setOtpError(
        "Password must be 8-12 chars, include 1 uppercase and 1 special char."
      );
    }

    try {
      setOtpLoading(true);
      // Pass both email and new password to identify which user to update
      await editPassword(emailInput, newPassword); 
      
      alert("Password updated successfully ✅");
      navigate("/login");
    } catch (err) {
      setOtpError(err.message || "Update failed. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-100 via-slate-50 to-white flex items-center justify-center p-6 font-sans">
      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] w-full max-w-md shadow-[0_30px_60px_rgba(0,0,0,0.12)] border border-white relative">
        
        <Link to="/login" className="absolute top-8 left-8 text-gray-400 hover:text-indigo-600 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </Link>

        <div className="text-center mt-4">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 mb-4 transform -rotate-6">
                <ShieldCheck className="text-white w-7 h-7" />
            </div>
            <h2 className="font-black text-3xl mb-2 text-slate-900 tracking-tight">Account Recovery</h2>
            <p className="text-sm text-gray-500 mb-6">
                Step {step} of 3: {step === 1 ? "Verify Identity" : step === 2 ? "Enter OTP" : "Secure Password"}
            </p>
        </div>

        {otpError && (
          <div className="bg-rose-50 text-rose-500 text-[11px] py-2 px-4 rounded-lg mb-4 text-center font-bold border border-rose-100 animate-shake">
            {otpError}
          </div>
        )}

        <div className="flex justify-between mb-8 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
          <span className={step >= 1 ? "text-indigo-600" : ""}>1. Email</span>
          <span className={step >= 2 ? "text-indigo-600" : ""}>2. OTP</span>
          <span className={step >= 3 ? "text-indigo-600" : ""}>3. Update</span>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Confirm registered email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-full border border-gray-200 p-3 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium bg-white/50 shadow-sm"
            />
            <div className="flex items-start gap-3 px-1">
              <input
                type="checkbox"
                id="terms"
                className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
              />
              <label htmlFor="terms" className="text-[11px] text-gray-500 leading-relaxed cursor-pointer font-medium">
                I understand a secure OTP will be sent to my email. I will not share this code with anyone.
              </label>
            </div>
            <button
              onClick={sendOTP}
              disabled={otpLoading}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl disabled:opacity-50 active:scale-95"
            >
              {otpLoading ? "Generating Code..." : "Send Verification OTP"}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-center text-[11px] font-bold text-gray-400 uppercase tracking-tighter">Enter 6-digit code sent to your mail</p>
            <input
              type="text"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full border border-gray-200 p-4 rounded-2xl text-center text-3xl tracking-[0.5em] font-black focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none bg-white/50 shadow-sm"
            />
            <button
              onClick={verifyOTP}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl active:scale-95"
            >
              Verify Code
            </button>
            <div className="flex items-center justify-between px-2">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                {isActive ? `Expires in ${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')}` : "OTP Expired"}
              </p>
              <button
                disabled={isActive}
                onClick={sendOTP}
                className={`text-[11px] font-black uppercase tracking-widest transition ${
                  isActive ? "text-gray-300 cursor-not-allowed" : "text-indigo-600 hover:text-indigo-800 underline"
                }`}
              >
                Resend OTP
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
             <div className="relative">
                <input
                type="password"
                placeholder="New secure password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-gray-200 p-3 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium bg-white/50 shadow-sm"
                />
            </div>
            <button
              onClick={handlePasswordChange}
              disabled={otpLoading}
              className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl active:scale-95 disabled:opacity-50"
            >
              {otpLoading ? "Updating..." : "Set New Password"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPass;