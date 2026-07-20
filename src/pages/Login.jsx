import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { loginUser } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import "../styles/Login.css";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loginAsAdmin, setLoginAsAdmin] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();


  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

try {
  const res = await loginUser(form);
  const { token, ...userData } = res.data;  

  if (loginAsAdmin && userData.role !== "ADMIN") {
    setError("This account does not have admin access.");
    setLoading(false);
    return;
  }

  login(userData, token);                    

  if (userData.role === "ADMIN") {
    navigate("/admin", { replace: true });
  } else {
    const from = location.state?.from?.pathname || "/";
    navigate(from, { replace: true });
  }
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <h2 className="login-title">⚽ Welcome Back</h2>

        <p className="login-subtitle">
          Login to your Sportify account
        </p>

        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">

          <div className="login-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="login-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <label className="login-checkbox">
            <input
              type="checkbox"
              checked={loginAsAdmin}
              onChange={(e) => setLoginAsAdmin(e.target.checked)}
            />
            <FontAwesomeIcon icon={faShieldHalved} /> Login as Admin
          </label>

          <button
            type="submit"
            disabled={loading}
            className="login-btn"
          >
            {loading ? "Logging in..." : loginAsAdmin ? "LOGIN AS ADMIN" : "LOGIN"}
          </button>

        <Link to="/forgot-password" style={{ color: '#ff0033', fontSize: '13px', textAlign: 'right', display: 'block', marginTop: '8px' }}>
  Forgot Password?
</Link>

        </form>

        <p className="login-footer">
          Don't have an account?{" "}
          <Link to="/register">Register here</Link>
        </p>

      </div>
    </div>
  );
}