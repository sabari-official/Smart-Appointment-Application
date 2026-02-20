import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { user, token } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const publicLinks = [
    { to: "/", label: "Home" },
    { to: "/services", label: "Services" },
    { to: "/about", label: "About" },
  ];

  const getDashboardLink = () => {
    if (!user) return null;
    const map = {
      customer: "/customer-dashboard",
      provider: "/provider-dashboard",
      admin: "/admin-dashboard",
    };
    return map[user.role];
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? "glass-strong shadow-lg py-3"
          : "bg-transparent py-5"
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
            S
          </div>
          <span className="font-display text-xl font-bold tracking-tight">
            <span className="text-gradient">Smart</span>
            <span className="text-white ml-1 opacity-80">Appoint</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {publicLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(link.to)
                  ? "text-white bg-white/10"
                  : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {token && user ? (
            <Link
              to={getDashboardLink()}
              className="btn btn-primary btn-sm"
            >
              <span>Dashboard</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-5 py-2 rounded-lg text-sm font-semibold text-white/80 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn btn-primary btn-sm"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
        >
          <div className="flex flex-col gap-1.5">
            <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden glass-strong mt-2 mx-4 rounded-2xl p-4 animate-fade-in-down">
          {publicLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive(link.to)
                  ? "text-white bg-white/10"
                  : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-white/10 mt-3 pt-3 flex flex-col gap-2">
            {token && user ? (
              <Link to={getDashboardLink()} className="btn btn-primary w-full">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary w-full">Sign In</Link>
                <Link to="/register" className="btn btn-primary w-full">Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
