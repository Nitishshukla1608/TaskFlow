import { useState } from "react";
import { signupUser, signupWithGoogle } from "../../services/authService";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Paperclip, Mail, Lock, User, Chrome, Briefcase, Phone, Building2, Hash, MapPin, Globe } from "lucide-react";

export const Signup = () => {
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
  
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [country, setCountry] = useState("");

  const navigate = useNavigate();

  const countries = ["India", "United States", "United Kingdom", "Canada", "Australia", "Germany", "UAE", "Singapore"];
  const organizations = ["Google", "Microsoft", "Amazon", "TCS", "Infosys", "Other"];
  const positions = ["Intern", "Employee", "Lead", "Manager", "Developer", "Other"];

// In Signup.jsx
const handleSignup = async (e) => {
  e.preventDefault();
  setLoading(true);
  
  if (password !== confirmPassword) { 
    setError("Passwords do not match"); 
    setLoading(false); 
    return; 
  }

  try {
    // REORDERED HERE: email and password moved to the front
    await signupUser(
      email, 
      password, 
      role, 
      name, 
      position, 
      `${countryCode} ${phoneNumber}`, 
      organization === "Other" ? customOrg : organization, 
      regId, 
      address, 
      city, 
      state, 
      pinCode, 
      country
    );

    navigate("/login");
  } catch (err) { 
    setError(err.message); 
  } finally { 
    setLoading(false); 
  }
};
const handleGoogleSignup = async () => {
  // 1. Calculate the final organization value first
  const finalOrg = organization === "Other" ? customOrg : organization;

  // 2. Validate all fields (Same requirements as handleSignup, minus email/password)
  if (!role || !name || !position || !finalOrg || !regId || !address || !city || !state || !pinCode || !country) {
    setError("Please fill in all professional and location details before signing up with Google.");
    return;
  }

  try {
    setLoading(true);
    setError(""); // Clear previous errors

    // 3. Call service with the same parameters as signupUser (minus email/password)
    await signupWithGoogle(
      role,
      name,
      position,
      finalOrg,
      regId,
      address,
      city,
      state,
      pinCode,
      country
    );

    navigate("/login");
  } catch (err) {
    setError(err.message || "Google signup failed");
  } finally {
    setLoading(false);
  }
};

  const inputStyle = "w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm bg-white shadow-sm";
  const labelStyle = "block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-widest ml-1";
  const iconStyle = "absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 w-4.5 h-4.5";

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100 via-slate-50 to-white flex items-center justify-center p-6">
      {/* Container widened to max-w-6xl for a "bigger" look */}
      <div className="w-full max-w-6xl bg-white/80 backdrop-blur-md rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/50 overflow-hidden">
        <div className="p-10">
          <header className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4 border-b border-gray-100 pb-6">
            <div>
              <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Join <span className="text-indigo-600">TaskFlow</span></h2>
              <p className="text-slate-500 mt-2 text-lg">Create your professional workspace account</p>
            </div>
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm font-medium border border-red-100 animate-pulse">
                {error}
              </div>
            )}
          </header>

          <form onSubmit={handleSignup} className="grid grid-cols-1 md:grid-cols-3 gap-10">
            
            {/* COLUMN 1: IDENTITY */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-5">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white text-sm font-bold">1</span>
                <h3 className="font-bold text-slate-800 uppercase tracking-wider">Identity Details</h3>
              </div>
              
              <div className="relative">
                <label className={labelStyle}>Full Name</label>
                <div className="relative"><User className={iconStyle} /><input className={inputStyle} type="text" placeholder="e.g. Alex Rivera" value={name} onChange={(e) => setName(e.target.value)} required /></div>
              </div>
              
              <div className="relative">
                <label className={labelStyle}>Work Email</label>
                <div className="relative"><Mail className={iconStyle} /><input className={inputStyle} type="email" placeholder="alex@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <label className={labelStyle}>Password</label>
                  <div className="relative">
                    <Lock className={iconStyle} />
                    <input className={inputStyle} type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <label className={labelStyle}>Confirm Password</label>
                  <div className="relative">
                    <Lock className={iconStyle} />
                    <input className={inputStyle} type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors">
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMN 2: PROFESSIONAL */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-5">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white text-sm font-bold">2</span>
                <h3 className="font-bold text-slate-800 uppercase tracking-wider">Work Profile</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelStyle}>Role</label>
                  <select className={`${inputStyle} !pl-4`} value={role} onChange={(e) => setRole(e.target.value)} required>
                    <option value="">Select</option>
                    <option value="Admin">Admin</option>
                    <option value="Employee">Employee</option>
                  </select>
                </div>
                <div>
                  <label className={labelStyle}>Position</label>
                  <select className={`${inputStyle} !pl-4`} value={position} onChange={(e) => setPosition(e.target.value)} required>
                    <option value="">Select</option>
                    {positions.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div className="relative">
                <label className={labelStyle}>Organization</label>
                <div className="relative">
                  <Building2 className={iconStyle} />
                  <select className={inputStyle} value={organization} onChange={(e) => setOrganization(e.target.value)} required>
                    <option value="">Select Organization</option>
                    {organizations.map(org => <option key={org} value={org}>{org}</option>)}
                  </select>
                </div>
              </div>

              <div className="relative">
                <label className={labelStyle}>ID Verification</label>
                <div className="flex gap-3">
                   <div className="relative flex-1">
                    <Hash className={iconStyle} />
                    <input className={inputStyle} type="text" placeholder="Reg ID" value={regId} onChange={(e) => setRegId(e.target.value)} required />
                   </div>
                   <label className="flex items-center justify-center px-4 rounded-lg border-2 border-dashed border-indigo-200 bg-indigo-50/50 cursor-pointer hover:bg-indigo-100 hover:border-indigo-400 transition-all group">
                      <Paperclip className="w-5 h-5 text-indigo-500 group-hover:scale-110 transition-transform" />
                      <input type="file" className="hidden" onChange={(e) => setWorkingId(e.target.files[0])} />
                   </label>
                </div>
                {workingId && <p className="text-[10px] text-green-600 mt-1 font-bold italic">✓ {workingId.name}</p>}
              </div>

              <div className="pt-2">
                 <label className={labelStyle}>Phone Number</label>
                 <div className="flex gap-2">
                    <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className="w-24 px-2 py-2.5 rounded-lg border border-gray-200 text-sm bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none">
                        <option value="+91">🇮🇳 +91</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+44">🇬🇧 +44</option>
                    </select>
                    <div className="relative flex-1">
                        <Phone className={iconStyle} />
                        <input className={inputStyle} type="tel" placeholder="Mobile" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
                    </div>
                 </div>
              </div>
            </div>

            {/* COLUMN 3: ADDRESS */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-5">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white text-sm font-bold">3</span>
                <h3 className="font-bold text-slate-800 uppercase tracking-wider">Office Location</h3>
              </div>

              <div className="relative">
                <label className={labelStyle}>Country</label>
                <div className="relative">
                    <Globe className={iconStyle} />
                    <select className={inputStyle} value={country} onChange={(e) => setCountry(e.target.value)} required>
                        <option value="">Select Country</option>
                        {countries.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
              </div>

              <div className="relative">
                <label className={labelStyle}>Street Address</label>
                <div className="relative"><MapPin className={iconStyle} /><input className={inputStyle} type="text" placeholder="Street, Building, Suite" value={address} onChange={(e) => setAddress(e.target.value)} required /></div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelStyle}>City</label>
                        <input className={`${inputStyle} !pl-4`} type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} required />
                    </div>
                    <div>
                        <label className={labelStyle}>State</label>
                        <input className={`${inputStyle} !pl-4`} type="text" placeholder="State" value={state} onChange={(e) => setState(e.target.value)} required />
                    </div>
                 </div>
                 <div>
                    <label className={labelStyle}>Zip / Pin Code</label>
                    <input className={`${inputStyle} !pl-4`} type="text" placeholder="Code" value={pinCode} onChange={(e) => setPinCode(e.target.value)} required />
                 </div>
              </div>
            </div>

            {/* ACTION SECTION */}
            <div className="md:col-span-3 flex flex-col md:flex-row text-sm items-center justify-between mt-6 pt-10 border-t border-slate-100 gap-6">
              <div className="text-slate-500">
                Existing member? <Link to="/login" className="text-indigo-600 italic font-bold hover:underline ml-1">Login </Link>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <button type="button" onClick={handleGoogleSignup} className="flex items-center justify-center gap-3 px-8 py-3.5 border border-slate-200 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm active:scale-95">
                  <Chrome className="w-5 h-5 text-blue-500" /> Use Google Account
                </button>
                <button type="submit" disabled={loading} className="px-12 py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-[0_10px_20px_rgba(79,70,229,0.3)] hover:bg-indigo-700 hover:shadow-indigo-300 active:scale-95 transition-all">
                  {loading ? "Creating..." : "Launch Account"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};