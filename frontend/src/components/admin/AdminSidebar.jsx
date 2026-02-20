import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Building2, Calendar, Trash2, RotateCcw, Bell, Bot, LogOut, Menu, X, ChevronDown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import LogoutConfirmationModal from "../common/LogoutConfirmationModal";
import toast from "react-hot-toast";

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isExpanded, setIsExpanded] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const menuItems = [
    {
      path: "/admin-dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      path: "/admin/users",
      label: "Users",
      icon: <Users size={20} />,
    },
    {
      path: "/admin/providers",
      label: "Providers",
      icon: <Building2 size={20} />,
    },
    {
      path: "/admin/appointments",
      label: "Appointments",
      icon: <Calendar size={20} />,
    },
    {
      path: "/admin/cancelled-appointments",
      label: "Cancelled",
      icon: <Trash2 size={20} />,
    },
    {
      path: "/admin/reset-system",
      label: "Reset System",
      icon: <RotateCcw size={20} />,
    },
    {
      path: "/admin/notifications",
      label: "Notifications",
      icon: <Bell size={20} />,
    },
    {
      path: "/admin/ai-help-desk",
      label: "AI Help Desk",
      icon: <Bot size={20} />,
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
    <aside className={`bg-gray-900 text-white h-screen sticky top-0 transition-all duration-300 ${isExpanded ? "w-64" : "w-20"} border-r border-gray-800`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          {isExpanded && <h1 className="text-xl font-bold">DocBook Admin</h1>}
          <button onClick={() => setIsExpanded(!isExpanded)} className="p-1 hover:bg-gray-800 rounded-lg transition">
            {isExpanded ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-3 mx-2 rounded-lg mb-2 flex items-center gap-3 transition ${
                isActive(item.path)
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
              title={!isExpanded ? item.label : ""}
            >
              {item.icon}
              {isExpanded && <span className="font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-800 p-4">
          {isExpanded && (
            <div className="mb-4 pb-4 border-b border-gray-800">
              <p className="text-xs text-gray-500 mb-1">Logged in as</p>
              <p className="text-sm font-semibold truncate">{user?.name || "Admin"}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition flex items-center gap-2 justify-center"
          >
            <LogOut size={18} />
            {isExpanded && "Logout"}
          </button>
        </div>

        {/* Logout Confirmation Modal */}
        <LogoutConfirmationModal
          isOpen={showLogoutModal}
          onConfirm={confirmLogout}
          onCancel={() => setShowLogoutModal(false)}
        />
      </div>
    </aside>
  );
};

export default AdminSidebar;
