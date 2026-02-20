import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Calendar, User, Bell, LogOut, ChevronDown, Star } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const CustomerSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isExpanded, setIsExpanded] = React.useState(true);

  const menuItems = [
    {
      path: "/customer-dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      badge: null,
    },
    {
      path: "/browse-providers",
      label: "Browse Providers",
      icon: <Users size={20} />,
      badge: null,
    },
    {
      path: "/my-appointments",
      label: "My Appointments",
      icon: <Calendar size={20} />,
      badge: "2",
    },
    {
      path: "/customer-reviews",
      label: "Reviews",
      icon: <Star size={20} />,
      badge: null,
    },
    {
      path: "/customer-profile",
      label: "Profile",
      icon: <User size={20} />,
      badge: null,
    },
    {
      path: "/notifications",
      label: "Notifications",
      icon: <Bell size={20} />,
      badge: "3",
    },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    toast.success("✅ Logged out successfully");
    navigate("/login");
  };

  return (
    <div
      className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-blue-600 to-blue-700 text-white transition-all duration-300 z-40 ${
        isExpanded ? "w-64" : "w-20"
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-blue-500 flex items-center justify-between">
        {isExpanded && <h2 className="text-xl font-bold">AppointmentHub</h2>}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-blue-500 rounded-lg transition"
        >
          <ChevronDown size={20} className={`transition-transform ${isExpanded ? "" : "rotate-90"}`} />
        </button>
      </div>

      {/* User Info */}
      {isExpanded && (
        <div className="p-4 border-b border-blue-500">
          <p className="text-sm font-semibold truncate">{user?.name || "User"}</p>
          <p className="text-xs text-blue-100 truncate">{user?.email || "customer@email.com"}</p>
        </div>
      )}

      {/* Menu Items */}
      <nav className="py-4 space-y-2 px-3">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition relative ${
              isActive(item.path)
                ? "bg-white text-blue-600 font-semibold"
                : "text-blue-100 hover:bg-blue-500"
            }`}
            title={!isExpanded ? item.label : ""}
          >
            <div>{item.icon}</div>
            {isExpanded && (
              <>
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </>
            )}
            {!isExpanded && item.badge && (
              <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="absolute bottom-4 left-3 right-3">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 bg-red-500 hover:bg-red-600 rounded-lg transition text-white font-semibold"
          title={!isExpanded ? "Logout" : ""}
        >
          <LogOut size={20} />
          {isExpanded && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default CustomerSidebar;
