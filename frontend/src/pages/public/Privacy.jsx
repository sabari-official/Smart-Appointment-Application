import React from "react";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";

const Privacy = () => (
  <div className="min-h-screen" style={{ background: '#0a0a1a', color: '#f1f5f9' }}>
    <Navbar />
    <section className="pt-32 pb-24 px-6">
      <div className="max-w-3xl mx-auto animate-fade-in-up">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Privacy <span className="text-gradient">Policy</span></h1>
        <div className="card p-8 space-y-6 text-sm leading-relaxed" style={{ color: '#94a3b8' }}>
          <div>
            <h2 className="text-lg font-bold mb-2" style={{ color: '#f1f5f9' }}>1. Data Collection</h2>
            <p>We collect necessary information including name, email, profile data, and appointment records to provide our scheduling services.</p>
          </div>
          <div>
            <h2 className="text-lg font-bold mb-2" style={{ color: '#f1f5f9' }}>2. Data Security</h2>
            <p>Your passwords are hashed using bcrypt. Authentication uses JWT tokens. All sensitive data is encrypted and secured with industry-standard practices.</p>
          </div>
          <div>
            <h2 className="text-lg font-bold mb-2" style={{ color: '#f1f5f9' }}>3. Data Usage</h2>
            <p>Your data is used to provide appointment scheduling services, AI-powered recommendations, and email notifications. We do not sell your data to third parties.</p>
          </div>
          <div>
            <h2 className="text-lg font-bold mb-2" style={{ color: '#f1f5f9' }}>4. AI Processing</h2>
            <p>Your interactions with our AI features (chatbot, recommendations) may be processed by third-party AI services (Hugging Face) to generate responses.</p>
          </div>
          <div>
            <h2 className="text-lg font-bold mb-2" style={{ color: '#f1f5f9' }}>5. Data Retention</h2>
            <p>Your account data is retained while your account is active. OTP codes automatically expire. You may request account deletion by contacting support.</p>
          </div>
        </div>
      </div>
    </section>
    <Footer />
  </div>
);

export default Privacy;
