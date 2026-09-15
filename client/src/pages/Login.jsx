import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("admin@stockflow.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (error) {
      setError(
        error.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <section className="login-brand-panel">
        <div className="brand-content">
          <div className="brand-logo">
            <span className="brand-logo-mark">S</span>
            <span>StockFlow</span>
          </div>

          <div className="brand-message">
            <p className="brand-eyebrow">INVENTORY & SALES</p>

            <h1>
              Keep your
              <br />
              business <span>flowing.</span>
            </h1>

            <p className="brand-description">
              Manage inventory, track stock movements, and monitor
              sales from one simple workspace.
            </p>
          </div>

          <div className="brand-stats">
            <div>
              <strong>01</strong>
              <span>Inventory</span>
            </div>

            <div>
              <strong>02</strong>
              <span>Sales</span>
            </div>

            <div>
              <strong>03</strong>
              <span>Reports</span>
            </div>
          </div>
        </div>

        <div className="brand-pattern">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </section>

      <section className="login-form-panel">
        <div className="login-form-container">
          <div className="login-heading">
            <p>WELCOME BACK</p>
            <h2>Sign in to StockFlow</h2>
            <span>Enter your account details to continue.</span>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-form-group">
              <label htmlFor="email">Email address</label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="login-form-group">
              <label htmlFor="password">Password</label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <p className="login-error">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="login-footer">
            StockFlow Inventory Management System
          </p>
        </div>
      </section>
    </div>
  );
}

export default Login;