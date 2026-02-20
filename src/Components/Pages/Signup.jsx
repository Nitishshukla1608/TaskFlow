import { useState } from "react";
import { signupUser, signupWithGoogle } from "../../services/authService";
import { Link, useNavigate } from "react-router-dom";
// Using Lucide icons for a more premium look
import { Eye, EyeOff, Paperclip, Mail, Lock, User, Briefcase, Chrome } from "lucide-react";

const Signup = () => {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [position, setPosition] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [workingId, setWorkingId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const positions = [
    "Intern", "Employee", "Trainee", "Team Lead", "Project Manager",
    "Software Engineer", "Frontend Developer", "Backend Developer",
    "Full Stack Developer", "QA Engineer", "DevOps Engineer", "HR Manager",
    "Sales Manager", "Admin", "Other"
  ];

  const handleGoogleSignup = async () => {
    if (!role || !position) {
      setError("Please select a Role and Position before signing up with Google.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      await signupWithGoogle(role, name, position);
      navigate("/login");
    } catch (err) {
      setError(err.message || "Google signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      await signupUser(email, password, role, name, position);
      navigate("/login");
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  // Modern Input Styling
  const inputStyle = "w-full pl-10 pr-4 py-2.5 rounded-md border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-gray-700 bg-gray-50/50";
  const iconStyle = "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4";

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      {/* Rectangular Card with specific radius and soft double-shadow */}
      <div className="w-full max-w-lg bg-white rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden">
        
        <div className="p-8 md:p-10">
          <header className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Create your account</h2>
            <p className="text-gray-500 text-sm mt-1">Fill in the details to get started</p>
          </header>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-md flex items-center gap-2">
              <span className="font-bold">Error:</span> {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-5">
            {/* Full Name */}
            <div className="relative">
              <User className={iconStyle} />
              <input
                className={inputStyle}
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Role & Position Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <select 
                  className="w-full px-3 py-2.5 rounded-md border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-gray-50/50 text-gray-600 text-sm appearance-none"
                  value={role} 
                  onChange={(e) => setRole(e.target.value)} 
                  required
                >
                  <option value="" disabled hidden>Select Role</option>
                  <option value="Employee">Employee</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div className="relative">
                <select 
                  className="w-full px-3 py-2.5 rounded-md border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-gray-50/50 text-gray-600 text-sm appearance-none"
                  value={position} 
                  onChange={(e) => setPosition(e.target.value)} 
                  required
                >
                  <option value="" disabled hidden>Position</option>
                  {positions.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Email */}
            <div className="relative">
              <Mail className={iconStyle} />
              <input
                className={inputStyle}
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className={iconStyle} />
              <input
                className={inputStyle}
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <Lock className={iconStyle} />
              <input
                className={inputStyle}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Optional File Upload */}
            <div className="pt-1">
              <input
                type="file"
                id="workingId"
                accept="image/*,.pdf"
                onChange={(e) => setWorkingId(e.target.files[0])}
                hidden
              />
              <label
                htmlFor="workingId"
                className="flex items-center gap-2 text-xs text-indigo-600 font-medium cursor-pointer hover:text-indigo-700 transition"
              >
                <Paperclip size={14} />
                {workingId ? `Attached: ${workingId.name}` : "Attach Working ID (optional)"}
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-md transition-all active:scale-[0.99] disabled:opacity-70 shadow-md shadow-indigo-100"
            >
              {loading ? "Processing..." : "Sign Up"}
            </button>
          </form>

          <div className="my-8 relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100"></span></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400">Or continue with</span></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 py-2.5 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium text-gray-600"
          >
            <Chrome size={18} className="text-blue-500" />
            Google
          </button>

          <p className="text-center mt-8 text-sm text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;