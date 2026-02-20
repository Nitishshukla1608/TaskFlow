import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

// Redux actions
import { setUser } from "../Context/AuthContext";
import { setTask } from "../Context/TaskContext";

function Login({ employeeData, adminData }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [mode, setMode] = useState("employee");

  const dispatch = useDispatch();

  // ✅ CORRECT selectors (MATCH STORE KEYS)
  const reduxUser = useSelector((state) => state?.AuthContext?.user);
  const reduxTasks = useSelector((state) => state?.TaskContext?.tasks);

  const handleLogin = () => {
    console.log("Login button clicked");
    let foundUser = null;

    if (mode === "employee") {
      foundUser = employeeData.find(
        (emp) =>
          emp.email === email.trim() &&
          emp.password === password &&
          emp.userId === Number(userId) &&
          emp.name.toLowerCase().trim() === name.toLowerCase().trim()
      );
    } else {
      foundUser = adminData.find(
        (admin) =>
          admin.email === email.trim() &&
          admin.password === password &&
          admin.userId === Number(userId) &&
          admin.name.toLowerCase().trim() === name.toLowerCase().trim()
      );
    }
    if (!foundUser) {
      alert("Invalid credentials");
      return;
    }

    // ✅ IMMEDIATE LOGS (local data)
    console.log("✅ Logged-in user (local):", foundUser);
    console.log("📋 User tasks (local):", foundUser.yourAssignedTasks);

    // ✅ DISPATCH TO REDUX...
    dispatch(setUser({ ...foundUser, role: mode }));
    dispatch(setTask(foundUser?.yourAssignedTasks || []));
    console.log("Task set via dispatch:", foundUser?.yourAssignedTasks || []);
  };

  // ✅ LOG AFTER REDUX UPDATE
  useEffect(() => {
    if (reduxUser) {
      console.log("🟢 Redux User updated:", reduxUser);
    }
  }, [reduxUser]);

  useEffect(() => {
    if (reduxTasks) {
      console.log("🟣 Redux Tasks updated:", reduxTasks);
    }
  }, [reduxTasks]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-indigo-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

        <h2 className="text-3xl font-extrabold text-center text-indigo-600 mb-2">
          {mode === "employee" ? "Employee Login" : "Admin Login"}
        </h2>

        <p className="text-center text-gray-500 mb-8">
          Access your TaskFlow dashboard
        </p>

        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="w-full px-4 py-3 mb-4 border rounded-lg bg-gray-50"
        >
          <option value="employee">Employee</option>
          <option value="admin">Admin</option>
        </select>

        <input
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="w-full px-4 py-3 mb-4 border rounded-lg"
        />

        <input
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 mb-4 border rounded-lg"
        />

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 mb-4 border rounded-lg"
        />

        <div className="flex gap-2 mb-6">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="flex-1 px-4 py-3 border rounded-lg"
          />
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="px-4 py-3 border rounded-lg text-indigo-600"
          >
            {showPassword ? "Hide" : "View"}
          </button>
        </div>

        <button
          onClick={handleLogin}
          className="w-full py-3 text-white font-semibold rounded-lg bg-indigo-600"
        >
          Login as {mode}
        </button>
      </div>
    </div>
  );
}

export default Login;
