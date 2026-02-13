import { useState } from "react";
import { useDispatch } from 'react-redux'
import { setUser } from '../../Context/AuthContext'


function Login({ employeeData, adminData }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [userId, setUserId] = useState("");
const [name, setName] = useState("");



  const [mode, setMode] = useState("employee"); // Default to 'employee'
  const dispatch = useDispatch()

  const handleLogin = () => { // Removed email, password, mode from params as they are state variables
    let user = null;

    if (mode === "employee") {
      user = employeeData.find(
        employee => employee.email === email && employee.password === password
      );
      console.log(mode)
    } 
    
    
    else if (mode === "admin") {
      console.log(adminData)
      console.log(email , password , userId , name)
      user = adminData.find(
        admin =>
          admin.email === email.trim() &&
          admin.password === password &&
          admin.userId === Number(userId) &&
          admin.name.toLowerCase().trim() === name.toLowerCase().trim()
      );
      
      
      console.log(user);
    }
    

    if (!user) {
      alert("Invalid credentials");
      return;
    }
    dispatch(setUser({ ...user, role: mode })); // Dispatch setUser with user and role
    console.log(user);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-indigo-200">
  <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 transition-all duration-300 hover:shadow-2xl">

    <div>
      <h2 className="text-3xl font-extrabold text-center text-indigo-600 mb-2">
        {mode === "employee" ? "Employee Login" : "Admin Login"}
      </h2>

      <p className="text-center text-gray-500 mb-8">
        Access your TaskFlow dashboard
      </p>

      {/* Role */}
      <div className="mb-5">
        <label className="block text-gray-700 mb-2 font-medium">
          Select Role
        </label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="w-full px-4 py-3 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="employee">Employee</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* User ID */}
      <input
        type="text"
        placeholder="User ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        className="w-full px-4 py-3 mb-4 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      {/* Name */}
      <input
        type="text"
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-4 py-3 mb-4 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      {/* Email */}
      <input
        type="email"
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-3 mb-4 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      {/* Password */}
      <div className="flex items-center gap-2 mb-6">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="flex-1 px-4 py-3 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="px-4 py-3 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition"
        >
          {showPassword ? "Hide" : "View"}
        </button>
      </div>
    </div>

    {/* Login Button */}
    <button
      onClick={handleLogin}
      className="w-full py-3 text-white font-semibold rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 transition-all duration-300"
    >
      Login as {mode === "admin" ? "Admin" : "Employee"}
    </button>
  </div>
</div>

  
  );
}

export default Login;
