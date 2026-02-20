import React from "react";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";

const Terms = () => (
  <div className="min-h-screen" style={{ background: '#0a0a1a', color: '#f1f5f9' }}>
    <Navbar />
    <section className="pt-32 pb-24 px-6">
      <div className="max-w-3xl mx-auto animate-fade-in-up">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Terms of <span className="text-gradient">Service</span></h1>
        <div className="card p-8 space-y-6 text-sm leading-relaxed" style={{ color: '#94a3b8' }}>
          <div>
            <h2 className="text-lg font-bold mb-2" style={{ color: '#f1f5f9' }}>1. Acceptance of Terms</h2>
            <p>By accessing and using Smart Appoint, you agree to be bound by these terms. If you do not agree, please do not use the platform.</p>
          </div>
          <div>
            <h2 className="text-lg font-bold mb-2" style={{ color: '#f1f5f9' }}>2. User Accounts</h2>
            <p>Users must register with a valid email and verify via OTP. You are responsible for maintaining account security and all activities under your account.</p>
          </div>
          <div>
            <h2 className="text-lg font-bold mb-2" style={{ color: '#f1f5f9' }}>3. Service Usage</h2>
            <p>The platform may be used for scheduling legitimate appointments. Misuse, spam, or fraudulent activity will result in account suspension.</p>
          </div>
          <div>
            <h2 className="text-lg font-bold mb-2" style={{ color: '#f1f5f9' }}>4. AI Features</h2>
            <p>AI-generated content (chatbot responses, emails, keywords, recommendations) is provided as-is. We do not guarantee accuracy of AI-generated content.</p>
          </div>
          <div>
            <h2 className="text-lg font-bold mb-2" style={{ color: '#f1f5f9' }}>5. Privacy</h2>
            <p>Your data is handled in accordance with our Privacy Policy. We use industry-standard security practices including bcrypt hashing and JWT authentication.</p>
          </div>
          <div>
            <h2 className="text-lg font-bold mb-2" style={{ color: '#f1f5f9' }}>6. Limitation of Liability</h2>
            <p>Smart Appoint is provided "as is". We are not liable for any missed appointments, scheduling conflicts, or damages arising from platform use.</p>
          </div>
        </div>
      </div>
    </section>
    <Footer />
  </div>
);

export default Terms;
