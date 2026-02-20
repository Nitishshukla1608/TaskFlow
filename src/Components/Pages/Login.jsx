import { useState } from "react";
import { loginUser } from "../../Services/authService";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../../Context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // 1️⃣ Firebase Auth (ONLY)
      const authUser = await loginUser(email, password);

      // 2️⃣ Store minimal auth user
      dispatch(setUser(authUser));

      // 3️⃣ Redirect to root
      // DashboardWrapper will route based on role once listener updates
      navigate("/DashBoardWrapper", { replace: true });

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Login</button>
      </form>

      {error && <p className="error">{error}</p>}

      <p className="switch-link">
        New here? <Link to="/signup">Register</Link>
      </p>
    </div>
  );
};

export default Login;
