import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const PublicNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? "text-blue-600 font-semibold" : "text-gray-700 hover:text-blue-600";
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">📅</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              AppointmentHub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className={`transition font-medium ${isActive("/")}`}>
              Home
            </Link>
            <Link to="/about" className={`transition font-medium ${isActive("/about")}`}>
              About
            </Link>
            <Link to="/services" className={`transition font-medium ${isActive("/services")}`}>
              Services
            </Link>
          </div>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            <Link
              to="/login"
              className="px-6 py-2 text-blue-600 font-semibold hover:text-blue-700 transition"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-md"
            >
              Register
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-700 hover:text-blue-600 transition"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100">
            <Link to="/" className="block py-2 px-2 text-gray-700 hover:text-blue-600 transition">
              Home
            </Link>
            <Link to="/about" className="block py-2 px-2 text-gray-700 hover:text-blue-600 transition">
              About
            </Link>
            <Link to="/services" className="block py-2 px-2 text-gray-700 hover:text-blue-600 transition">
              Services
            </Link>
            <div className="pt-4 space-y-2 border-t border-gray-100 mt-4">
              <Link to="/login" className="block py-2 px-2 text-center text-blue-600 font-semibold">
                Login
              </Link>
              <Link
                to="/register"
                className="block py-2 px-2 text-center bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
              >
                Register
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default PublicNav;
