import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import { publicService } from "../../services/apiService";

const Home = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "");
    loadStats();
    return () => document.documentElement.removeAttribute("data-theme");
  }, []);

  const loadStats = async () => {
    try {
      const res = await publicService.getStatistics();
      if (res.success) setStats(res.data);
    } catch { }
  };

  return (
    <div className="min-h-screen" style={{ background: '#0a0a1a', color: '#f1f5f9' }}>
      <Navbar />

      {/* Hero */}
      <section className="hero-section grid-bg relative px-6" style={{ minHeight: '100vh' }}>
        <div className="bg-orb bg-orb-1"></div>
        <div className="bg-orb bg-orb-2"></div>
        <div className="bg-orb bg-orb-3" style={{ opacity: 0.08 }}></div>

        <div className="max-w-7xl mx-auto w-full relative z-10 flex items-center" style={{ minHeight: '100vh' }}>
          <div className="grid lg:grid-cols-2 gap-16 items-center w-full pt-24">
            <div className="hero-content animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm font-medium" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                AI-Powered Scheduling Platform
              </div>

              <h1 className="hero-title">
                Smart Scheduling,{" "}
                <span className="text-gradient">Effortless</span>{" "}
                Appointments
              </h1>

              <p className="hero-subtitle" style={{ color: '#94a3b8' }}>
                Book, manage, and optimize appointments with AI-driven provider recommendations,
                automated emails, and real-time availability tracking.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to="/register" className="btn btn-primary btn-lg group">
                  Start Free
                  <svg className="group-hover:translate-x-1 transition-transform" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </Link>
                <Link to="/services" className="btn btn-secondary btn-lg">
                  Explore Features
                </Link>
              </div>

              {/* Mini Stats */}
              {stats && (
                <div className="flex flex-wrap gap-8 mt-12 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  {[
                    { value: stats.totalProviders || 0, label: "Providers" },
                    { value: stats.totalAppointments || 0, label: "Appointments" },
                    { value: stats.avgRating ? `${stats.avgRating.toFixed(1)}★` : "5.0★", label: "Avg Rating" },
                  ].map((s, i) => (
                    <div key={i} className="animate-fade-in-up" style={{ animationDelay: `${0.3 + i * 0.1}s` }}>
                      <p className="font-display text-2xl font-bold text-gradient">{s.value}</p>
                      <p className="text-sm" style={{ color: '#64748b' }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Hero Visual */}
            <div className="hidden lg:flex items-center justify-center relative animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="relative">
                {/* Floating Cards */}
                <div className="w-80 glass-card p-6 animate-float" style={{ animationDelay: '0s' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ background: 'rgba(99, 102, 241, 0.15)' }}>🗓️</div>
                    <div>
                      <p className="font-semibold text-sm">Upcoming Appointment</p>
                      <p className="text-xs" style={{ color: '#94a3b8' }}>Today, 2:30 PM</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="avatar avatar-sm" style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}>D</div>
                      <span className="text-sm font-medium">Dr. Sarah Wilson</span>
                    </div>
                    <span className="badge badge-success">Confirmed</span>
                  </div>
                </div>

                <div className="absolute -top-8 -right-16 w-64 glass-card p-4 animate-float" style={{ animationDelay: '2s' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">🤖</span>
                    <span className="text-sm font-semibold">AI Suggestion</span>
                  </div>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Based on your history, Dr. Johnson would be a great fit for your needs.</p>
                </div>

                <div className="absolute -bottom-12 -left-12 w-56 glass-card p-4 animate-float" style={{ animationDelay: '4s' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">⭐</span>
                    <span className="text-sm font-semibold">New Review</span>
                  </div>
                  <div className="flex gap-1 text-yellow-400 text-sm">★★★★★</div>
                  <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>"Excellent service, highly recommended!"</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 relative" style={{ background: '#111127' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: '#818cf8' }}>Features</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to{" "}
              <span className="text-gradient">Manage Appointments</span>
            </h2>
            <p className="max-w-2xl mx-auto" style={{ color: '#94a3b8' }}>
              Our platform combines cutting-edge AI technology with intuitive design to deliver
              a seamless scheduling experience for everyone.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "🤖", title: "AI-Powered Chat", desc: "Get instant help from our AI assistant. Book appointments, find providers, and get personalized recommendations through natural conversation.", color: "#6366f1" },
              { icon: "🔍", title: "Smart Recommendations", desc: "Our AI analyzes your needs and matches you with the best providers based on specialty, ratings, and availability.", color: "#06b6d4" },
              { icon: "📧", title: "AI Email Notifications", desc: "Receive professionally crafted, AI-generated email confirmations, reminders, and updates for all your appointments.", color: "#8b5cf6" },
              { icon: "📅", title: "Easy Slot Management", desc: "Providers can create, edit, and manage time slots with overlap detection and a 15 daily slot limit for quality service.", color: "#10b981" },
              { icon: "⭐", title: "Reviews & Ratings", desc: "Rate your experience after each appointment. Help others find the best providers with authentic reviews.", color: "#f59e0b" },
              { icon: "🔒", title: "Secure & Verified", desc: "OTP-based email verification, JWT authentication, and role-based access control keep your data safe.", color: "#ef4444" },
            ].map((feature, i) => (
              <div key={i} className="glass-card p-6 card-hover animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-5" style={{ background: `${feature.color}15` }}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: '#f1f5f9' }}>{feature.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#94a3b8' }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 relative grid-bg" style={{ background: '#0a0a1a' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: '#22d3ee' }}>How It Works</p>
            <h2 className="text-3xl md:text-4xl font-bold">
              Get Started in{" "}
              <span className="text-gradient">3 Simple Steps</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Create Account", desc: "Register as a Customer or Provider. Verify your email with OTP and complete your profile to get started.", icon: "👤" },
              { step: "02", title: "Find & Book", desc: "Search for providers using AI-powered recommendations. Browse available slots and book your preferred time.", icon: "🔍" },
              { step: "03", title: "Manage & Review", desc: "Track all your appointments in one place. Reschedule, cancel, or leave reviews after completed sessions.", icon: "✅" },
            ].map((item, i) => (
              <div key={i} className="relative text-center animate-fade-in-up" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="text-7xl font-black font-display mb-4" style={{ color: 'rgba(99, 102, 241, 0.08)' }}>
                  {item.step}
                </div>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-5" style={{ background: 'var(--gradient-primary)' }}>
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#94a3b8' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Highlights */}
      <section className="py-24 px-6" style={{ background: '#111127' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: '#a78bfa' }}>Multi-Role Platform</p>
            <h2 className="text-3xl md:text-4xl font-bold">
              Built for{" "}
              <span className="text-gradient">Everyone</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { role: "Customer", desc: "Browse providers, book appointments with AI recommendations, manage bookings, leave reviews, and get email notifications.", color: "#0ea5e9", features: ["AI Provider Search", "Smart Booking", "Review System", "Email Alerts"] },
              { role: "Provider", desc: "Create and manage time slots, view appointments, track reviews and ratings, and use AI assistant for insights.", color: "#14b8a6", features: ["Slot Management", "Appointment Tracking", "Review Analytics", "AI Assistant"] },
              { role: "Admin", desc: "Monitor system-wide activity, manage users and providers, view analytics, and use advanced AI help desk.", color: "#8b5cf6", features: ["User Management", "System Analytics", "AI Help Desk", "System Reset"] },
            ].map((item, i) => (
              <div key={i} className="glass-card p-8 text-center card-hover animate-fade-in-up" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mx-auto mb-5" style={{ background: `${item.color}20`, border: `2px solid ${item.color}40` }}>
                  {item.role === "Customer" ? "👤" : item.role === "Provider" ? "🏥" : "👑"}
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: item.color }}>{item.role}</h3>
                <p className="text-sm mb-6 leading-relaxed" style={{ color: '#94a3b8' }}>{item.desc}</p>
                <div className="space-y-2">
                  {item.features.map((f, j) => (
                    <div key={j} className="flex items-center gap-2 justify-center text-sm" style={{ color: '#cbd5e1' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill={item.color} stroke="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 relative overflow-hidden" style={{ background: '#0a0a1a' }}>
        <div className="bg-orb bg-orb-1" style={{ opacity: 0.1 }}></div>
        <div className="bg-orb bg-orb-2" style={{ opacity: 0.1 }}></div>
        <div className="max-w-3xl mx-auto text-center relative z-10 animate-fade-in-up">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Transform Your{" "}
            <span className="text-gradient">Scheduling?</span>
          </h2>
          <p className="text-lg mb-10" style={{ color: '#94a3b8' }}>
            Join our AI-powered platform today and experience the future of appointment management.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/register" className="btn btn-primary btn-lg group">
              Create Free Account
              <svg className="group-hover:translate-x-1 transition-transform" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
            <Link to="/about" className="btn btn-secondary btn-lg">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
