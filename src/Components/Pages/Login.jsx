import { useState } from "react";
import { loginUser } from "../../Services/authService";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../../Context/AuthContext";
// Added Eye and EyeOff to imports
import { Mail, Lock, LogIn, ArrowRight, ShieldCheck, Chrome, Briefcase, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(""); 
  const [showPassword, setShowPassword] = useState(false); // Toggle state
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!role) {
      setError("Please select your access role");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const authUser = await loginUser(email, password);
      
      if (authUser.role !== role) {
        throw new Error(`Unauthorized: You are not registered as an ${role}`);
      }

      dispatch(setUser(authUser));
      navigate("/DashBoardWrapper", { replace: true });
    } catch (err) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = "w-full pl-11 pr-12 py-3 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm bg-white/50 shadow-sm appearance-none";
  const labelStyle = "block text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-[0.15em] ml-1";
  const iconStyle = "absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 w-5 h-5 z-10";

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-100 via-slate-50 to-white flex items-center justify-center p-6">
      
      <div className="w-full max-w-[480px] bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.12)] border border-white/60 overflow-hidden relative z-10">
        <div className="p-10">
          
          <header className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 mb-4 transform -rotate-6">
              <ShieldCheck className="text-white w-7 h-7" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">TaskFlow Login</h2>
          </header>

          <form onSubmit={handleLogin} className="space-y-5">
            
            {/* ROLE SELECTION */}
            <div className="relative">
              <label className={labelStyle}>Access Role</label>
              <div className="relative">
                <Briefcase className={iconStyle} />
                <select 
                  className={inputStyle}
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                >
                  <option value="" disabled>Select your role</option>
                  <option value="Admin">Admin</option>
                  <option value="Employee">Employee</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ArrowRight className="w-4 h-4 rotate-90" />
                </div>
              </div>
            </div>

            {/* EMAIL FIELD */}
            <div className="relative">
              <label className={labelStyle}>Email Address</label>
              <div className="relative">
                <Mail className={iconStyle} />
                <input 
                  className={inputStyle} 
                  type="email" 
                  placeholder="name@company.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>
            </div>

            {/* PASSWORD FIELD WITH EYE BUTTON */}
            <div className="relative">
              <label className={labelStyle}>Security Password</label>
              <div className="relative">
                <Lock className={iconStyle} />
                <input 
                  className={inputStyle} 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
                {/* EYE TOGGLE BUTTON */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors z-20 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-xs font-bold border border-red-100 flex items-center gap-2">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="group relative w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-600 active:scale-95 transition-all overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? "Authenticating..." : "Enter Workspace"}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>

          </form>

          <footer className="mt-8 text-center">
            <p className="text-sm text-slate-500 font-medium">
              Need access? 
              <Link to="/signup" className="text-indigo-600 font-bold hover:underline ml-2 italic">
                Request Account
              </Link>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Login;