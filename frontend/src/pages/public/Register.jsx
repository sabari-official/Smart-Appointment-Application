import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../services/apiService";
import toast from "react-hot-toast";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "customer",
    termsAccepted: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const passwordRules = [
    { label: "At least 8 characters", test: (p) => p.length >= 8 },
    { label: "One uppercase letter (A-Z)", test: (p) => /[A-Z]/.test(p) },
    { label: "One lowercase letter (a-z)", test: (p) => /[a-z]/.test(p) },
    { label: "One number (0-9)", test: (p) => /[0-9]/.test(p) },
    { label: "One special character", test: (p) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(p) },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const validateStep1 = () => {
    if (!form.name.trim()) { toast.error("Name is required"); return false; }
    if (!form.username.trim()) { toast.error("Username is required"); return false; }
    if (!form.email.trim()) { toast.error("Email is required"); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { toast.error("Invalid email format"); return false; }
    return true;
  };

  const validateStep2 = () => {
    if (!passwordRules.every((r) => r.test(form.password))) {
      toast.error("Password doesn't meet requirements");
      return false;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords don't match");
      return false;
    }
    if (!form.termsAccepted) {
      toast.error("You must accept Terms & Conditions");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setLoading(true);
    try {
      const res = await authService.register({
        name: form.name.trim(),
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
        termsAccepted: true,
      });
      if (res.success) {
        toast.success("Registration successful! Check your email for OTP.");
        navigate("/verify-email", { state: { email: form.email.trim().toLowerCase() } });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = passwordRules.filter((r) => r.test(form.password)).length;
  const strengthColors = ["#ef4444", "#f59e0b", "#f59e0b", "#10b981", "#10b981"];
  const strengthLabels = ["Weak", "Fair", "Good", "Strong", "Very Strong"];

  return (
    <div className="min-h-screen grid-bg flex" style={{ background: '#0a0a1a' }}>
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden items-center justify-center" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #06b6d4 100%)' }}>
        <div className="bg-orb" style={{ width: '400px', height: '400px', background: 'rgba(255,255,255,0.08)', top: '-100px', right: '-100px' }}></div>
        <div className="bg-orb" style={{ width: '300px', height: '300px', background: 'rgba(255,255,255,0.08)', bottom: '-100px', left: '-50px' }}></div>

        <div className="relative z-10 text-center text-white px-12 max-w-lg">
          <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-4xl mx-auto mb-8 animate-float">
            ✨
          </div>
          <h1 className="text-4xl font-bold mb-4 font-display">Join Us Today</h1>
          <p className="text-lg opacity-90 leading-relaxed">
            Create your account and start booking appointments with top-rated providers powered by AI.
          </p>

          {/* Role Selection Preview */}
          <div className="mt-12 space-y-3">
            {[
              { role: "customer", icon: "👤", label: "Customer", desc: "Book appointments & find providers" },
              { role: "provider", icon: "🏥", label: "Provider", desc: "Manage slots & serve clients" },
            ].map((r) => (
              <button
                key={r.role}
                onClick={() => setForm((prev) => ({ ...prev, role: r.role }))}
                className={`w-full p-4 rounded-xl text-left flex items-center gap-4 transition-all duration-200 ${form.role === r.role
                    ? "bg-white/20 border-2 border-white/50 scale-105"
                    : "bg-white/5 border-2 border-transparent hover:bg-white/10"
                  }`}
              >
                <span className="text-2xl">{r.icon}</span>
                <div>
                  <p className="font-semibold">{r.label}</p>
                  <p className="text-xs opacity-80">{r.desc}</p>
                </div>
                {form.role === r.role && (
                  <span className="ml-auto text-lg">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-lg animate-fade-in-up">
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-lg">S</div>
            <span className="font-display text-xl font-bold text-white">Smart Appoint</span>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#f1f5f9' }}>Create Account</h2>
            <p className="text-sm" style={{ color: '#94a3b8' }}>
              Step {step} of 2 — {step === 1 ? "Your Details" : "Security & Terms"}
            </p>
          </div>

          {/* Progress */}
          <div className="flex gap-2 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex-1 h-1.5 rounded-full transition-all duration-300" style={{ background: s <= step ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.08)' }}></div>
            ))}
          </div>

          {/* Mobile Role Selection */}
          <div className="lg:hidden mb-6">
            <label className="form-label" style={{ color: '#94a3b8' }}>I am a</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { role: "customer", icon: "👤", label: "Customer" },
                { role: "provider", icon: "🏥", label: "Provider" },
              ].map((r) => (
                <button
                  key={r.role}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, role: r.role }))}
                  className={`p-3 rounded-xl text-center text-sm font-medium transition-all duration-200 ${form.role === r.role
                      ? "border-2 text-white"
                      : "border-2 text-gray-400"
                    }`}
                  style={{
                    background: form.role === r.role ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.03)',
                    borderColor: form.role === r.role ? '#6366f1' : 'rgba(255,255,255,0.08)',
                  }}
                >
                  <span className="text-xl block mb-1">{r.icon}</span>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div className="form-group">
                  <label className="form-label" style={{ color: '#94a3b8' }}>Full Name</label>
                  <input name="name" className="form-input" placeholder="John Doe" value={form.name} onChange={handleChange} required id="register-name" />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ color: '#94a3b8' }}>Username</label>
                  <input name="username" className="form-input" placeholder="johndoe" value={form.username} onChange={handleChange} required id="register-username" />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ color: '#94a3b8' }}>Email Address</label>
                  <input name="email" type="email" className="form-input" placeholder="john@example.com" value={form.email} onChange={handleChange} required id="register-email" />
                </div>
                <button type="button" onClick={() => { if (validateStep1()) setStep(2); }} className="btn btn-primary w-full btn-lg mt-2">
                  Continue
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <div className="form-group">
                  <label className="form-label" style={{ color: '#94a3b8' }}>Password</label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      className="form-input"
                      placeholder="Create a strong password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      id="register-password"
                      style={{ paddingRight: '3rem' }}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#64748b' }}>
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>

                  {/* Password Strength */}
                  {form.password && (
                    <div className="mt-3">
                      <div className="flex gap-1 mb-2">
                        {[0, 1, 2, 3, 4].map((i) => (
                          <div key={i} className="flex-1 h-1.5 rounded-full transition-all duration-300" style={{ background: i < passwordStrength ? strengthColors[passwordStrength - 1] : 'rgba(255,255,255,0.08)' }}></div>
                        ))}
                      </div>
                      <p className="text-xs font-medium" style={{ color: passwordStrength > 0 ? strengthColors[passwordStrength - 1] : '#64748b' }}>
                        {passwordStrength > 0 ? strengthLabels[passwordStrength - 1] : "Enter password"}
                      </p>
                      <div className="mt-2 space-y-1">
                        {passwordRules.map((rule, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs" style={{ color: rule.test(form.password) ? '#10b981' : '#64748b' }}>
                            <span>{rule.test(form.password) ? "✓" : "○"}</span>
                            <span>{rule.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ color: '#94a3b8' }}>Confirm Password</label>
                  <input
                    name="confirmPassword"
                    type="password"
                    className="form-input"
                    placeholder="Confirm your password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    id="register-confirm-password"
                  />
                  {form.confirmPassword && form.password !== form.confirmPassword && (
                    <p className="form-error">Passwords don't match</p>
                  )}
                </div>

                <div className="form-checkbox">
                  <input
                    type="checkbox"
                    name="termsAccepted"
                    checked={form.termsAccepted}
                    onChange={handleChange}
                    id="register-terms"
                  />
                  <label htmlFor="register-terms" className="text-sm cursor-pointer" style={{ color: '#94a3b8' }}>
                    I agree to the{" "}
                    <Link to="/terms" className="underline" style={{ color: '#818cf8' }}>Terms of Service</Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="underline" style={{ color: '#818cf8' }}>Privacy Policy</Link>
                  </label>
                </div>

                <div className="flex gap-3 mt-2">
                  <button type="button" onClick={() => setStep(1)} className="btn btn-secondary flex-1">
                    ← Back
                  </button>
                  <button type="submit" className="btn btn-primary flex-1 btn-lg" disabled={loading || !form.termsAccepted} id="register-submit">
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="spinner spinner-sm" style={{ borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }}></span>
                        Creating...
                      </span>
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm" style={{ color: '#94a3b8' }}>
              Already have an account?{" "}
              <Link to="/login" className="font-semibold" style={{ color: '#818cf8' }}>Sign In</Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link to="/" className="text-sm hover:underline" style={{ color: '#64748b' }}>← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
