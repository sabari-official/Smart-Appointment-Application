import React from "react";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";

const Services = () => (
  <div className="min-h-screen" style={{ background: '#0a0a1a', color: '#f1f5f9' }}>
    <Navbar />
    <section className="pt-32 pb-24 px-6 relative grid-bg">
      <div className="bg-orb bg-orb-1"></div>
      <div className="bg-orb bg-orb-2"></div>
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16 animate-fade-in-up">
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: '#22d3ee' }}>Services</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Powerful Features for <span className="text-gradient">Smart Scheduling</span>
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: '#94a3b8' }}>
            Everything you need to manage appointments efficiently, powered by AI and designed for simplicity.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            { icon: "🤖", title: "AI-Powered Chatbot", desc: "Conversational AI assistant available on every page. Get help with booking, searching providers, and managing appointments through natural conversation.", color: "#6366f1" },
            { icon: "🔍", title: "Smart Provider Recommendations", desc: "Our AI semantically analyzes your needs and matches you with the best providers based on specialty, ratings, availability, and AI-generated keywords.", color: "#06b6d4" },
            { icon: "📧", title: "AI Email Notifications", desc: "Automatically generated professional email notifications for appointment confirmations, cancellations, and rescheduling using AI content generation.", color: "#8b5cf6" },
            { icon: "🔑", title: "AI Keyword Generation", desc: "Providers can auto-generate search-optimized keywords from their profile using AI, improving their visibility in search results.", color: "#10b981" },
            { icon: "📅", title: "Slot Management", desc: "Providers can create, edit, and manage time slots with overlap detection and daily limits. Customers see only available slots in real-time.", color: "#f59e0b" },
            { icon: "⭐", title: "Review & Rating System", desc: "After completed appointments, customers can leave detailed reviews and star ratings, helping others make informed decisions.", color: "#ef4444" },
            { icon: "🔒", title: "Secure Authentication", desc: "OTP-based email verification, JWT authentication, role-based access control, and bcrypt password hashing ensure your data is always secure.", color: "#14b8a6" },
            { icon: "👑", title: "Admin Dashboard", desc: "Comprehensive admin panel with system analytics, user management, provider oversight, AI help desk, and system reset capabilities.", color: "#a78bfa" },
          ].map((svc, i) => (
            <div key={i} className="glass-card p-8 card-hover animate-fade-in-up" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: `${svc.color}15` }}>
                  {svc.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">{svc.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#94a3b8' }}>{svc.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
    <Footer />
  </div>
);

export default Services;
