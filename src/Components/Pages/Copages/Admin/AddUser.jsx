import { useState } from "react";
// 1. Added missing useSelector import
import { useSelector } from "react-redux"; 
import { addUser as serviceAddUser } from "../../../../Services/authService";
import { Link, useNavigate } from "react-router-dom";
import { 
  Eye, EyeOff, Paperclip, Mail, Lock, User, 
  Phone, Building2, Hash, MapPin, Globe, ShieldCheck 
} from "lucide-react";

export const AddUser = () => {
  // 2. Safely access organizations with a fallback empty array
  const organizations = useSelector((state) => state.auth.organizations) || [];
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [position, setPosition] = useState("");
  const [organization, setOrganization] = useState("");
  const [regId, setRegId] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [country, setCountry] = useState("");
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

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError("");
    console.log(organizations)
  
    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }
 
    setLoading(true);
  
    try {
      // 3. Ensure the service function is awaited
      await serviceAddUser(
        name, 
        email, 
        password, 
        role, 
        position, 
        organization, 
        regId, 
        `${countryCode}${phoneNumber}`, 
        country, 
        address, 
        city, 
        state, 
        pinCode
      );
      
      alert("User account created successfully!");
      // Optionally navigate away after success
      // navigate("/users");
    } catch (err) {
      setError(err.message || "An error occurred during account creation");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = "w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm bg-white shadow-sm hover:border-gray-300";
  const labelStyle = "block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-widest ml-1";
  const iconStyle = "absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-500 w-4 h-4";
  const eyeBtnStyle = "absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors focus:outline-none z-10";

  return (
    <div className="min-h-screen bg-[radial-gradient(at_top_left,_#f8faff_0%,_#ffffff_100%)] flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-6xl bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden">
        <div className="p-8 md:p-12">
          
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pb-8 border-b border-gray-50 gap-4">
            <div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Add New <span className="text-indigo-600">User</span></h2>
              <p className="text-slate-400 mt-1 font-medium italic">Create a new workspace profile for your team member.</p>
            </div>
            {error && (
              <div className="bg-rose-50 text-rose-600 px-4 py-2 rounded-xl text-xs font-bold border border-rose-100 animate-pulse">
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
                  <label className={labelStyle}>Temporary Password</label>
                  <div className="relative">
                    <Lock className={iconStyle} />
                    <input 
                      className={inputStyle} 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Minimum 8 chars" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required 
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className={eyeBtnStyle}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                
                <div className="relative">
                  <label className={labelStyle}>Confirm Password</label>
                  <div className="relative">
                    <ShieldCheck className={iconStyle} />
                    <input 
                      className={`${inputStyle} ${confirmPassword && password !== confirmPassword ? 'border-rose-300 focus:border-rose-500' : ''}`} 
                      type={showConfirmPassword ? "text" : "password"} 
                      placeholder="Repeat password" 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      required 
                    />
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
                <div>
                  <label className={labelStyle}>Role</label>
                  <select className={`${inputStyle} !pl-3`} value={role} onChange={(e) => setRole(e.target.value)} required>
                    <option value="" className="font-medium text-base  font-sans">Select</option>
                    <option value="Admin" className="font-medium text-base  font-sans">Admin</option>
                    <option value="Employee" className="font-medium text-base  font-sans">Employee</option>
                  </select>
                </div>
                <div>
                  <label className={labelStyle}>Position</label>
                  <select className={`${inputStyle} !pl-3`} value={position} onChange={(e) => setPosition(e.target.value)} required>
                    <option value="" className="font-medium text-base  font-sans">Select</option>
                    {positions.map(p => <option key={p} value={p} className="font-medium text-base  font-sans">{p}</option>)}
                  </select>
                </div>
              </div>

              <div className="relative">
                <label className={labelStyle}>Organization</label>
                <div className="relative">
                  <Building2 className={iconStyle} />


                  <select value={organization} className={inputStyle} onChange={(e) => setOrganization(e.target.value)}>
  <option value="">Select Company</option>
  {organizations.map((org) => (
    <option key={org.id} value={org.name}>
      {org.name}
    </option>
  ))}
</select>
                </div>
              </div>

              <div className="relative">
                <label className={labelStyle}>Reg ID</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Hash className={iconStyle} />
                    <input className={inputStyle} type="text" placeholder="ID No." value={regId} onChange={(e) => setRegId(e.target.value)} required />
                  </div>
                  {/* Fixed ID Upload Label Accessibility */}
                  <label htmlFor="id-upload" className="flex items-center px-4 rounded-xl border-2 border-dashed border-indigo-100 bg-indigo-50/30 cursor-pointer hover:bg-indigo-100 transition-all">
                    <Paperclip className="w-4 h-4 text-indigo-500" />
                    <input id="id-upload" type="file" className="hidden" />
                  </label>
                </div>
              </div>

              <div className="relative">
                <label className={labelStyle}>Phone Number</label>
                <div className="flex gap-2">
                  <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className="w-20 px-1 py-3 rounded-xl border border-gray-200 text-xs bg-white focus:ring-2 focus:ring-indigo-500/10 outline-none">
                    <option value="+91"className="font-medium text-base  font-sans">🇮🇳 +91</option>
                    <option value="+11"className="font-medium text-base  font-sans">🇺🇸 +11</option>
                    <option value="+94"className="font-medium text-base  font-sans">🇮🇳 +94</option>
                    <option value="+14"className="font-medium text-base  font-sans">🇺🇸 +14</option>
                    <option value="+21"className="font-medium text-base  font-sans">🇮🇳 +21</option>
                    <option value="+17"className="font-medium text-base  font-sans">🇺🇸 +17</option>
                    <option value="+71"className="font-medium text-base  font-sans">🇮🇳 +71</option>
                    <option value="+19"className="font-medium text-base  font-sans">🇺🇸 +19</option>
                  </select>
                  <div className="relative flex-1">
  <Phone className={iconStyle} />
  <input
    className={inputStyle}
    type="tel"
    placeholder="Mobile"
    value={phoneNumber}
    maxLength={10}
    pattern="[0-9]*"
    inputMode="numeric"
    onChange={(e) =>
      setPhoneNumber(e.target.value.replace(/[^0-9]/g, ""))
    }
    required
  />
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
                    <option value="" className="font-medium text-base  font-sans">Select Country</option>
                    {countries.map(c => <option key={c} value={c} className="font-medium text-base  font-sans">{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="relative">
                <label className={labelStyle}>Street Address</label>
                <div className="relative">
                  <MapPin className={iconStyle} />
                  <input className={inputStyle} type="text" placeholder="Suite, Street Name" value={address} onChange={(e) => setAddress(e.target.value)} required />
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

            {/* Footer */}
            <div className="md:col-span-3 flex flex-col md:flex-row items-center justify-end mt-4 pt-6 border-t border-gray-200 gap-6">
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full md:w-auto px-14 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? "Creating Account..." : "Launch Account"}
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
    <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-600 text-white text-xs font-black shadow-lg shadow-indigo-100">
      {number}
    </span>
    <h3 className="font-black text-slate-800 uppercase tracking-widest text-[11px]">{title}</h3>
  </div>
);