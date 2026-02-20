import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/apiService";
import toast from "react-hot-toast";

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const email = location.state?.email || "";
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputs = useRef([]);

  useEffect(() => {
    if (!email) navigate("/register");
    inputs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (i, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[i] = value.slice(-1);
    setOtp(newOtp);
    if (value && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length > 0) {
      const newOtp = [...otp];
      text.split("").forEach((c, i) => { if (i < 6) newOtp[i] = c; });
      setOtp(newOtp);
      inputs.current[Math.min(text.length, 5)]?.focus();
    }
    e.preventDefault();
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 6) { toast.error("Enter complete 6-digit code"); return; }
    setLoading(true);
    try {
      const res = await authService.verifyOTP(email, code);
      if (res.success) {
        toast.success("Email verified! 🎉");
        if (res.data?.token && res.data?.user) {
          login(res.data.user, res.data.token);
          const dashboards = { customer: "/customer-dashboard", provider: "/provider-dashboard", admin: "/admin-dashboard" };
          navigate(res.data.user.profileCompleted ? (dashboards[res.data.user.role] || "/") : "/complete-profile");
        } else {
          navigate("/login");
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification failed");
      setOtp(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authService.resendOTP(email);
      toast.success("OTP resent successfully!");
      setCountdown(60);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend");
    } finally { setResending(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center grid-bg px-6" style={{ background: '#0a0a1a' }}>
      <div className="bg-orb bg-orb-1"></div>
      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        <div className="card p-10 text-center">
          <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl animate-float" style={{ background: 'rgba(99,102,241,0.15)' }}>
            📧
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#f1f5f9' }}>Verify Your Email</h1>
          <p className="text-sm mb-8" style={{ color: '#94a3b8' }}>
            We sent a 6-digit OTP to <span className="font-semibold" style={{ color: '#818cf8' }}>{email}</span>
          </p>

          {/* OTP Input */}
          <div className="flex justify-center gap-2 mb-8" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={el => inputs.current[i] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                className="w-12 h-14 text-center text-xl font-bold rounded-xl outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: digit ? '2px solid #6366f1' : '2px solid rgba(255,255,255,0.1)',
                  color: '#f1f5f9',
                  boxShadow: digit ? '0 0 0 3px rgba(99,102,241,0.15)' : 'none',
                }}
                id={`otp-input-${i}`}
              />
            ))}
          </div>

          <button onClick={handleVerify} className="btn btn-primary w-full btn-lg mb-4" disabled={loading || otp.join("").length !== 6}>
            {loading ? "Verifying..." : "Verify Email"}
          </button>

          <div className="text-sm" style={{ color: '#94a3b8' }}>
            {countdown > 0 ? (
              <p>Resend OTP in <span className="font-bold" style={{ color: '#818cf8' }}>{countdown}s</span></p>
            ) : (
              <button onClick={handleResend} disabled={resending} className="font-semibold hover:underline" style={{ color: '#818cf8' }}>
                {resending ? "Sending..." : "Resend OTP"}
              </button>
            )}
          </div>

          <div className="mt-6">
            <Link to="/login" className="text-sm hover:underline" style={{ color: '#64748b' }}>← Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
