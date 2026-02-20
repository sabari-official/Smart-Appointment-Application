import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LogoutConfirmationModal from "../common/LogoutConfirmationModal";
import {
  LayoutDashboard,
  User,
  Calendar,
  Clock,
  Star,
  Bell,
  LogOut,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

const ProviderSidebar = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const DOMAIN_CONFIG = {
    doctor: { emoji: "👨‍⚕️", color: "from-blue-600 to-blue-700" },
    psychiatrist: { emoji: "🧠", color: "from-purple-600 to-purple-700" },
    businessman: { emoji: "💼", color: "from-indigo-600 to-indigo-700" },
    automobiles: { emoji: "🚗", color: "from-orange-600 to-orange-700" },
  };

  const domainInfo = DOMAIN_CONFIG[user?.domain] || {
    emoji: "🏢",
    color: "from-gray-600 to-gray-700",
  };

  const menuItems = [
    { path: "/provider-dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { path: "/provider-profile", label: "Profile", icon: <User size={20} /> },
    { path: "/manage-slots", label: "Manage Slots", icon: <Calendar size={20} /> },
    { path: "/provider-appointments", label: "Appointments", icon: <Clock size={20} /> },
    { path: "/provider-reviews", label: "Reviews", icon: <Star size={20} /> },
    { path: "/provider-notifications", label: "Notifications", icon: <Bell size={20} />, badge: "3" },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout();
    toast.success("Logged out successfully!");
    navigate("/login");
    setShowLogoutModal(false);
  };

  return (
    <div
      className={`fixed left-0 top-0 h-screen bg-gradient-to-b ${domainInfo.color} transition-all duration-300 z-40 ${
        isExpanded ? "w-64" : "w-20"
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-white border-opacity-20">
        <div className="flex items-center justify-between">
          <div className={`text-3xl ${!isExpanded && "mx-auto"}`}>{domainInfo.emoji}</div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-white hover:bg-white hover:bg-opacity-10 p-1 rounded-lg transition-colors"
          >
            {isExpanded ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {isExpanded && (
          <div className="mt-3">
            <p className="text-white font-bold text-sm truncate">{user?.businessName || "Provider"}</p>
            <p className="text-white text-opacity-75 text-xs truncate">{user?.email}</p>
          </div>
        )}
      </div>

      {/* Menu Items */}
      <nav className="mt-8 space-y-2 px-3">
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center justify-between px-3 py-3 rounded-lg transition-all ${
                active
                  ? "bg-white bg-opacity-20 text-white"
                  : "text-white text-opacity-75 hover:bg-white hover:bg-opacity-10"
              }`}
              title={!isExpanded ? item.label : ""}
            >
              <div className="flex items-center space-x-3 flex-1">
                {item.icon}
                {isExpanded && <span className="font-medium text-sm">{item.label}</span>}
              </div>
              {isExpanded && item.badge && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
              {isExpanded && active && <ChevronRight size={16} />}
            </button>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white border-opacity-20">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-3 py-3 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition-all font-medium"
        >
          <LogOut size={20} />
          {isExpanded && <span>Logout</span>}
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmationModal
        isOpen={showLogoutModal}
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </div>
  );
};

export default ProviderSidebar;
