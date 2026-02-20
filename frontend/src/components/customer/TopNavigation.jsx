import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Calendar, User, Bell, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import LogoutConfirmationModal from "../common/LogoutConfirmationModal";
import toast from "react-hot-toast";

const TopNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const menuItems = [
    {
      path: "/customer-dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={18} />,
      badge: null,
    },
    {
      path: "/browse-providers",
      label: "Browse Providers",
      icon: <Users size={18} />,
      badge: null,
    },
    {
      path: "/my-appointments",
      label: "My Appointments",
      icon: <Calendar size={18} />,
      badge: "2",
    },
    {
      path: "/customer-profile",
      label: "Profile",
      icon: <User size={18} />,
      badge: null,
    },
    {
      path: "/customer-notifications",
      label: "Notifications",
      icon: <Bell size={18} />,
      badge: "3",
    },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout();
    toast.success("✅ Logged out successfully");
    navigate("/login");
    setShowLogoutModal(false);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/customer-dashboard" className="flex items-center gap-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                DocBook
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition font-medium text-sm ${
                  isActive(item.path)
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* User Section */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">{user?.name?.split(" ")[0]}</span>
            </div>

            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-sm transition"
              title="Logout"
            >
              <LogOut size={18} />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-4 py-4">
          <div className="flex flex-col gap-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`px-4 py-3 rounded-lg flex items-center gap-3 transition font-medium ${
                  isActive(item.path)
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-auto inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      <LogoutConfirmationModal
        isOpen={showLogoutModal}
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </nav>
  );
};

export default TopNavigation;
