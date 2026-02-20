import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/apiService";
import toast from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!credential.trim() || !password) {
      toast.error("Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      const res = await authService.login(credential.trim(), password);
      if (res.success && res.data) {
        login(res.data.user, res.data.token);
        toast.success("Welcome back!");
        const dashboards = {
          customer: "/customer-dashboard",
          provider: "/provider-dashboard",
          admin: "/admin-dashboard",
        };
        navigate(dashboards[res.data.user.role] || "/");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      toast.error(msg);
      if (msg.includes("verify") || msg.includes("OTP")) {
        navigate("/verify-email", { state: { email: credential } });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid-bg flex" style={{ background: '#0a0a1a' }}>
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
        <div className="bg-orb" style={{ width: '400px', height: '400px', background: 'rgba(255,255,255,0.1)', top: '-100px', right: '-100px' }}></div>
        <div className="bg-orb" style={{ width: '300px', height: '300px', background: 'rgba(255,255,255,0.1)', bottom: '-100px', left: '-50px' }}></div>

        <div className="relative z-10 text-center text-white px-12 max-w-lg">
          <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-4xl mx-auto mb-8 animate-float">
            🗓️
          </div>
          <h1 className="text-4xl font-bold mb-4 font-display">Welcome Back</h1>
          <p className="text-lg opacity-90 leading-relaxed">
            Sign in to manage your appointments, track bookings, and connect with providers.
          </p>
          <div className="mt-12 flex gap-6 justify-center">
            {["🔒 Secure", "🤖 AI-Powered", "⚡ Fast"].map((item, i) => (
              <span key={i} className="text-sm opacity-80">{item}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md animate-fade-in-up">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-lg">S</div>
            <span className="font-display text-xl font-bold text-white">Smart Appoint</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#f1f5f9' }}>Sign In</h2>
            <p className="text-sm" style={{ color: '#94a3b8' }}>Enter your credentials to access your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="form-group">
              <label className="form-label" style={{ color: '#94a3b8' }}>Email or Username</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter email or username"
                value={credential}
                onChange={(e) => setCredential(e.target.value)}
                autoComplete="username"
                required
                id="login-credential"
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#94a3b8' }}>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  id="login-password"
                  style={{ paddingRight: '3rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
                  style={{ color: '#64748b' }}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full btn-lg"
              disabled={loading}
              id="login-submit"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="spinner spinner-sm" style={{ borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }}></span>
                  Signing In...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm" style={{ color: '#94a3b8' }}>
              Don't have an account?{" "}
              <Link to="/register" className="font-semibold" style={{ color: '#818cf8' }}>
                Create Account
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link to="/" className="text-sm hover:underline" style={{ color: '#64748b' }}>
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
