import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
      {/* Decorative top border */}
      <div className="h-px w-full" style={{ background: 'var(--gradient-primary)' }}></div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-lg">
                S
              </div>
              <span className="font-display text-xl font-bold">
                <span className="text-gradient">Smart</span>
                <span style={{ color: 'var(--text-primary)' }} className="ml-1 opacity-80">Appoint</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              AI-powered appointment scheduling for the modern world. Connect with the right providers effortlessly.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>
              Platform
            </h4>
            <ul className="space-y-3">
              {[
                { to: "/", label: "Home" },
                { to: "/services", label: "Services" },
                { to: "/about", label: "About Us" },
                { to: "/register", label: "Get Started" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm hover:text-white transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>
              Legal
            </h4>
            <ul className="space-y-3">
              {[
                { to: "/terms", label: "Terms of Service" },
                { to: "/privacy", label: "Privacy Policy" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm hover:text-white transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>
              Support
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/login" className="text-sm hover:text-white transition-colors" style={{ color: 'var(--text-secondary)' }}>
                  Sign In
                </Link>
              </li>
              <li>
                <a href="mailto:support@smartappoint.com" className="text-sm hover:text-white transition-colors" style={{ color: 'var(--text-secondary)' }}>
                  Contact Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderTop: '1px solid var(--border-color)' }}>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            © {currentYear} Smart Appointment Scheduling. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Powered by AI ✨
            </span>
          </div>
        </div>
      </div>

      {/* Background orbs */}
      <div className="bg-orb bg-orb-2" style={{ opacity: 0.05 }}></div>
    </footer>
  );
};

export default Footer;
