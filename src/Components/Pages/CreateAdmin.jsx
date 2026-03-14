import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux"; 
import { addUser as serviceAddUser, loginUser } from "../../Services/authService";
import { useNavigate } from "react-router-dom";
import { setUser } from "../../Context/AuthContext";
import { 
  Eye, EyeOff, Paperclip, Mail, Lock, User, 
  Phone, Building2, Hash, MapPin, Globe, ShieldCheck, ChevronLeft
} from "lucide-react";

export const CreateAdmin = () => {
  const dispatch = useDispatch();
  // 1. Get current logged-in admin's data and organization info
  const { user } = useSelector((state) => state.auth);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("Admin"); // Default to employee
  const [position, setPosition] = useState("");
  // Pre-fill organization from the current admin's profile
  const organization = useSelector((state)=>state.auth.organization) 
  const [regId, setRegId] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [country, setCountry] = useState("India");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const countries = ["India", "United States", "United Kingdom", "Canada", "Australia", "Germany", "UAE", "Singapore"];
  const positions = ["Intern", "Employee", "Lead", "Manager", "Developer", "Other"];

  // 2. Ensure organization is set if the user object changes
 

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError("");
  
    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }
 
    setLoading(true);
  
    try {
      // 3. First Admin Account Creation Logic
      await serviceAddUser(
        name, 
        email, 
        password, 
        role, 
        position, 
        organization, // Passed automatically from state
        regId, 
        `${countryCode}${phoneNumber}`, 
        country, 
        address, 
        city, 
        state, 
        pinCode
      );
      
      // 4. Log in the newly created admin to the main Auth instance
      const authenticatedUser = await loginUser(email, password);
      
      // Manually set the user in Redux to trigger login immediately
      dispatch(setUser(authenticatedUser));
      
      alert(`Success! ${name} is now part of ${organization}`);
      navigate("/DashBoardWrapper");
    } catch (err) {
      setError(err.message || "An error occurred during account creation");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = "w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm bg-white shadow-sm hover:border-gray-300";
  const disabledInputStyle = "w-full pl-10 pr-12 py-3 rounded-xl border border-gray-100 bg-slate-50 text-slate-500 text-sm cursor-not-allowed";
  const labelStyle = "block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-widest ml-1";
  const iconStyle = "absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-500 w-4 h-4";
  const eyeBtnStyle = "absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors focus:outline-none z-10";

  return (
    <div className="min-h-screen bg-[radial-gradient(at_top_left,_#f8faff_0%,_#ffffff_100%)] flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-6xl bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden">
        <div className="p-8 md:p-12">
          
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pb-8 border-b border-gray-50 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                 <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
                    <ChevronLeft size={20} />
                 </button>
                 <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[19px] font-black uppercase tracking-tighter">
                   {organization || "Workspace Account"}
                 </span>
              </div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Onboard <span className="text-indigo-600">Member</span></h2>
              <p className="text-slate-500 font-semibold mt-1  italic">Deploying new credentials for {organization}.</p>
            </div>
            {error && (
              <div className="bg-rose-50 text-rose-600 px-4 py-2 rounded-xl text-xs font-bold border border-rose-100">
                {error}
              </div>
            )}
          </header>

          <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-1">
            
            {/* COLUMN 1: IDENTITY & SECURITY */}
            <div className="space-y-4">
              <SectionHeader number="1" title="Identity & Access" />
              <div className="relative">
                <label className={labelStyle}>Full Name</label>
                <div className="relative">
                  <User className={iconStyle} />
                  <input className={inputStyle} type="text" placeholder="Alex Rivera" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
              </div>
              
              <div className="relative">
                <label className={labelStyle}>Work Email</label>
                <div className="relative">
                  <Mail className={iconStyle} />
                  <input className={inputStyle} type="email" placeholder="alex@taskflow.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </div>

              <div className="space-y-4 pt-2 border-t border-slate-50">
                <div className="relative">
                  <label className={labelStyle}>Create Password</label>
                  <div className="relative">
                    <Lock className={iconStyle} />
                    <input className={inputStyle} type={showPassword ? "text" : "password"} placeholder="Min. 8 chars" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className={eyeBtnStyle}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <label className={labelStyle}>Confirm Password</label>
                  <div className="relative">
                    <ShieldCheck className={iconStyle} />
                    <input className={`${inputStyle} ${confirmPassword && password !== confirmPassword ? 'border-rose-300' : ''}`} type={showConfirmPassword ? "text" : "password"} placeholder="Repeat password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className={eyeBtnStyle}>
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMN 2: PROFESSIONAL PROFILE */}
            <div className="space-y-5">
              <SectionHeader number="2" title="Work Profile" />
              <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <label className={labelStyle}>Role</label>
                <div className="relative">
                  <Building2 className={iconStyle} />
                  <input 
                    className={disabledInputStyle} 
                    type="text" 
                    value= "Admin" 
                    readOnly 
                    disabled 
                  />
                </div>
              </div>
                <div>
                  <label className={labelStyle}>Position</label>
                  <select className={`${inputStyle} !pl-3`} value={position} onChange={(e) => setPosition(e.target.value)} required>
                    <option value="">Select</option>
                    {positions.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div className="relative">
                <label className={labelStyle}>Organization (Locked)</label>
                <div className="relative">
                  <Building2 className={iconStyle} />
                  <input 
                    className={disabledInputStyle} 
                    type="text" 
                    value={organization} 
                    readOnly 
                    disabled 
                  />
                </div>
              </div>

              <div className="relative">
                <label className={labelStyle}>Reg ID / Employee Code</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Hash className={iconStyle} />
                    <input className={inputStyle} type="text" placeholder="ID No." value={regId} onChange={(e) => setRegId(e.target.value)} required />
                  </div>
                  <label htmlFor="id-upload" className="flex items-center px-4 rounded-xl border-2 border-dashed border-indigo-100 bg-indigo-50/30 cursor-pointer hover:bg-indigo-100">
                    <Paperclip className="w-4 h-4 text-indigo-500" />
                    <input id="id-upload" type="file" className="hidden" />
                  </label>
                </div>
              </div>

              <div className="relative">
                <label className={labelStyle}>Phone Number</label>
                <div className="flex gap-2">
                  <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className="w-20 px-1 py-3 rounded-xl border border-gray-200 text-xs font-bold bg-white">
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                  </select>
                  <div className="relative flex-1">
                    <Phone className={iconStyle} />
                    <input className={inputStyle} type="tel" placeholder="Mobile" value={phoneNumber} maxLength={10} onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ""))} required />
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMN 3: LOCATION DETAILS */}
            <div className="space-y-5">
              <SectionHeader number="3" title="Office Location" />
              <div className="relative">
                <label className={labelStyle}>Country</label>
                <div className="relative">
                  <Globe className={iconStyle} />
                  <select className={inputStyle} value={country} onChange={(e) => setCountry(e.target.value)} required>
                    {countries.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="relative">
                <label className={labelStyle}>Street Address</label>
                <div className="relative">
                  <MapPin className={iconStyle} />
                  <input className={inputStyle} type="text" placeholder="Office suite, Area" value={address} onChange={(e) => setAddress(e.target.value)} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelStyle}>City</label>
                  <input className={`${inputStyle} !pl-4`} type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} required />
                </div>
                <div>
                  <label className={labelStyle}>State</label>
                  <input className={`${inputStyle} !pl-4`} type="text" placeholder="State" value={state} onChange={(e) => setState(e.target.value)} required />
                </div>
              </div>
              <div className="relative">
                <label className={labelStyle}>Zip Code</label>
                <input className={`${inputStyle} !pl-4`} type="text" placeholder="Postal Code" value={pinCode} onChange={(e) => setPinCode(e.target.value)} required />
              </div>
            </div>

            {/* Submit */}
            <div className="md:col-span-3 flex flex-col md:flex-row items-center justify-end mt-4 pt-6 border-t border-gray-200">
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full md:w-auto px-16 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50"
              >
                {loading ? "Creating Member..." : "Create User Account"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const SectionHeader = ({ number, title }) => (
  <div className="flex items-center gap-3 mb-6">
    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-600 text-white text-[10px] font-black shadow-lg shadow-indigo-100">
      {number}
    </span>
    <h3 className="font-black text-slate-800 uppercase tracking-widest text-[10px]">{title}</h3>
  </div>
);