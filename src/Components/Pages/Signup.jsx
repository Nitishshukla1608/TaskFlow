import { useState } from "react";
import { signupUser, signupWithGoogle } from "../../services/authService";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Paperclip, Mail, Lock, User, Chrome, Phone, Building2, Hash } from "lucide-react";

const Signup = () => {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [position, setPosition] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [organization, setOrganization] = useState("");
  const [customOrg, setCustomOrg] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [workingId, setWorkingId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [regId, setRegId] = useState("");

  const navigate = useNavigate();

  const countryCodes = [
    { code: "+1", label: "🇺🇸 +1" }, { code: "+44", label: "🇬🇧 +44" },
    { code: "+91", label: "🇮🇳 +91" }, { code: "+61", label: "🇦🇺 +61" },
    { code: "+971", label: "🇦🇪 +971" }, { code: "+81", label: "🇯🇵 +81" },
  ];

  const organizations = [
    "Google", "Microsoft", "Amazon", "Meta", "Apple", "Netflix", "Tesla", 
    "Adobe", "Oracle", "Spotify", "Uber", "Airbnb", "Twitter", "LinkedIn", "TCS", "Infosys", "Other"
  ];

  const positions = [
    "Intern", "Employee", "Trainee", "Team Lead", "Project Manager",
    "Software Engineer", "Frontend Developer", "Backend Developer",
    "Full Stack Developer", "QA Engineer", "DevOps Engineer", "HR Manager",
    "Sales Manager", "Admin", "Other"
  ];

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Determine final organization name
    const finalOrg = organization === "Other" ? customOrg : organization;
    const fullPhone = `${countryCode}${phoneNumber}`;

    try {
      // Sending ALL states to your service
      await signupUser(
        email, 
        password, 
        role, 
        name, 
        position, 
        fullPhone, 
        finalOrg, 
        regId, 
        workingId // Passing the file object as well
      );
      navigate("/login");
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    // Validation: Ensure they picked the required metadata first
    if (!role || !position || !organization) {
      setError("Please select Role, Position, and Organization before using Google.");
      return;
    }
    
    try {
      setLoading(true);
      setError("");
      const finalOrg = organization === "Other" ? customOrg : organization;
      
      // Sending additional metadata to Google service
      await signupWithGoogle(role, name, position, finalOrg, regId);
      navigate("/login");
    } catch (err) {
      setError(err.message || "Google signup failed");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = "w-full pl-10 pr-4 py-2.5 rounded-md border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-gray-700 bg-gray-50/50";
  const iconStyle = "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4";

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden my-10">
        <div className="p-8 md:p-10">
          <header className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Create your account</h2>
            <p className="text-gray-500 text-sm mt-1">Join the TaskFlow workspace</p>
          </header>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-md flex items-center gap-2">
              <span className="font-bold">Error:</span> {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            {/* Basic Info */}
            <div className="relative">
              <User className={iconStyle} />
              <input className={inputStyle} type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="relative">
              <Mail className={iconStyle} />
              <input className={inputStyle} type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            {/* Organization */}
            <div className="space-y-3">
              <div className="relative">
                <Building2 className={iconStyle} />
                <select 
                  className={`${inputStyle} appearance-none`}
                  value={organization} 
                  onChange={(e) => setOrganization(e.target.value)} 
                  required
                >
                  <option value="" disabled hidden>Select Organization</option>
                  {organizations.map((org) => (
                    <option key={org} value={org}>{org}</option>
                  ))}
                </select>
              </div>

              {organization === "Other" && (
                <div className="relative animate-in fade-in slide-in-from-top-2 duration-300">
                   <Building2 className={iconStyle} />
                  <input 
                    className={`${inputStyle} border-indigo-200 bg-indigo-50/30`} 
                    type="text" 
                    placeholder="Enter Organization Name" 
                    value={customOrg} 
                    onChange={(e) => setCustomOrg(e.target.value)} 
                    required 
                  />
                </div>
              )}
            </div>

            {/* Role & Position */}
            <div className="grid grid-cols-2 gap-3">
              <select className="px-3 py-2.5 rounded-md border border-gray-200 bg-gray-50/50 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20" value={role} onChange={(e) => setRole(e.target.value)} required>
                <option value="" disabled hidden>Select Role</option>
                <option value="Employee">Employee</option>
                <option value="Admin">Admin</option>
              </select>
              <select className="px-3 py-2.5 rounded-md border border-gray-200 bg-gray-50/50 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20" value={position} onChange={(e) => setPosition(e.target.value)} required>
                <option value="" disabled hidden>Position</option>
                {positions.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            {/* Registration number */}
            <div className="relative">
              <Hash className={iconStyle} />
              <input 
                className={inputStyle} 
                type="text" 
                placeholder="Registration Number" 
                value={regId} 
                onChange={(e) => setRegId(e.target.value.replace(/\D/g, ""))} 
                required 
              />
            </div>

            {/* Phone Number */}
            <div className="relative flex gap-2">
              <select 
                value={countryCode} 
                onChange={(e) => setCountryCode(e.target.value)}
                className="px-2 py-2.5 rounded-md border border-gray-200 bg-gray-50/50 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {countryCodes.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
              </select>
              <div className="relative flex-1">
                <Phone className={iconStyle} />
                <input className={inputStyle} type="tel" placeholder="Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))} required />
              </div>
            </div>

            {/* Passwords */}
            <div className="relative">
              <Lock className={iconStyle} />
              <input className={inputStyle} type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="relative">
              <Lock className={iconStyle} />
              <input className={inputStyle} type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* File Upload */}
            <div className="pt-1">
              <input type="file" id="workingId" accept="image/*,.pdf" onChange={(e) => setWorkingId(e.target.files[0])} hidden />
              <label htmlFor="workingId" className="flex items-center gap-2 text-xs text-indigo-600 font-medium cursor-pointer hover:text-indigo-700 transition">
                <Paperclip size={14} />
                {workingId ? `Attached: ${workingId.name}` : "Attach Working ID (optional)"}
              </label>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-md transition-all active:scale-[0.99] disabled:opacity-70 shadow-md">
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <div className="my-6 relative flex items-center"><div className="flex-grow border-t border-gray-100"></div><span className="mx-3 text-[10px] uppercase text-gray-400 font-bold tracking-widest">OR</span><div className="flex-grow border-t border-gray-100"></div></div>

          <button type="button" onClick={handleGoogleSignup} className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 py-2.5 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium text-gray-600">
            <Chrome size={18} className="text-blue-500" /> Google
          </button>

          <p className="text-center mt-6 text-sm text-gray-500">Already have an account? <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;