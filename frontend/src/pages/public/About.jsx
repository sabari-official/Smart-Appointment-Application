import React from "react";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";

const About = () => (
  <div className="min-h-screen" style={{ background: '#0a0a1a', color: '#f1f5f9' }}>
    <Navbar />
    <section className="pt-32 pb-24 px-6 relative grid-bg">
      <div className="bg-orb bg-orb-1"></div>
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-16 animate-fade-in-up">
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: '#818cf8' }}>About Us</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Redefining <span className="text-gradient">Appointment Scheduling</span>
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: '#94a3b8' }}>
            Smart Appoint is an AI-powered scheduling platform that connects customers with service providers effortlessly. Our mission is to eliminate scheduling friction.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {[
            { icon: "🎯", title: "Our Mission", desc: "To simplify appointment scheduling through AI-driven matching, automated communications, and intuitive interfaces." },
            { icon: "👁️", title: "Our Vision", desc: "A world where booking an appointment is as simple as a conversation, powered by intelligent automation." },
            { icon: "💎", title: "Our Values", desc: "Security, simplicity, and innovation. We prioritize user privacy, ease of use, and cutting-edge AI technology." },
          ].map((item, i) => (
            <div key={i} className="glass-card p-8 text-center card-hover animate-fade-in-up" style={{ animationDelay: `${i * 0.15}s` }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5" style={{ background: 'rgba(99,102,241,0.15)' }}>{item.icon}</div>
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-sm" style={{ color: '#94a3b8' }}>{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="glass-card p-12 text-center animate-fade-in-up">
          <h2 className="text-2xl font-bold mb-4">Built With <span className="text-gradient">Modern Technology</span></h2>
          <p className="mb-8" style={{ color: '#94a3b8' }}>
            Our platform leverages the latest in AI, cloud computing, and web technologies.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {["React", "Node.js", "MongoDB", "Express", "Hugging Face AI", "JWT Auth", "Tailwind CSS", "Nodemailer"].map((t, i) => (
              <span key={i} className="badge badge-primary px-4 py-2 text-sm">{t}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
    <Footer />
  </div>
);

export default About;
