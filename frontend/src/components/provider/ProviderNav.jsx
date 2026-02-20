import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Calendar, MessageSquare, Star, Briefcase, Settings, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const ProviderNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems = [
    {
      path: "/provider-dashboard",
      label: "Dashboard",
      icon: <Briefcase size={20} />,
      badge: null,
    },
    {
      path: "/provider-appointments",
      label: "My Appointments",
      icon: <Calendar size={20} />,
      badge: "5",
    },
    {
      path: "/provider-reviews",
      label: "My Reviews",
      icon: <Star size={20} />,
      badge: "3",
    },
    {
      path: "/provider-services",
      label: "Services",
      icon: <Briefcase size={20} />,
      badge: null,
    },
    {
      path: "/provider-ai-assistant",
      label: "AI Assistant",
      icon: <MessageSquare size={20} />,
      badge: null,
    },
  ];

  const handleLogout = () => {
    logout();
    toast.success("✅ Logged out successfully");
    navigate("/login");
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Header with logo and user info */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📋</span>
            <div>
              <h1 className="font-bold text-lg">DocBook Pro</h1>
              <p className="text-xs text-blue-100">{user?.businessName || "Provider"}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right text-sm">
              <p className="font-semibold">{user?.name || "User"}</p>
              <p className="text-xs text-blue-100">{user?.domain || "Professional"}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-lg text-sm font-semibold transition flex items-center gap-2"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto gap-2 pb-2">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap font-semibold transition ${
                location.pathname === item.path
                  ? "bg-white text-blue-600 shadow-lg"
                  : "bg-blue-700 hover:bg-blue-500 text-white"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full ml-1">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default ProviderNav;
