import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { notificationService } from "../../services/apiService";

const DashboardLayout = ({ children, theme = "customer" }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showLogout, setShowLogout] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        return () => document.documentElement.removeAttribute("data-theme");
    }, [theme]);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    const fetchNotifications = async () => {
        try {
            const res = await notificationService.getNotifications(true);
            if (res.success) {
                setUnreadCount(res.data?.filter?.((n) => !n.read)?.length || 0);
            }
        } catch { }
    };

    const navItems = getNavItems(theme, unreadCount);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div className="dashboard-layout" style={{ background: 'var(--bg-primary)' }}>
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`dashboard-sidebar glass-strong ${sidebarOpen ? 'open' : ''}`}
                style={{ background: theme === 'admin' ? 'var(--bg-secondary)' : 'var(--bg-secondary)' }}
            >
                {/* Brand */}
                <div className="flex items-center gap-3 px-2 mb-6">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ background: 'var(--gradient-primary)' }}>
                        S
                    </div>
                    <div className="flex-1">
                        <p className="font-display font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                            Smart Appoint
                        </p>
                        <p className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>
                            {theme} Portal
                        </p>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        ✕
                    </button>
                </div>

                {/* User Info */}
                <div className="px-2 mb-6">
                    <div className="glass-card p-3 flex items-center gap-3">
                        <div className="avatar avatar-sm">
                            {user?.name?.[0] || "U"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
                            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 px-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`sidebar-nav-item ${isActive(item.path) ? 'active' : ''}`}
                        >
                            <span className="text-lg">{item.icon}</span>
                            <span className="flex-1">{item.label}</span>
                            {item.badge > 0 && (
                                <span className="min-w-[20px] h-5 rounded-full text-xs font-bold flex items-center justify-center px-1.5"
                                    style={{ background: 'var(--danger)', color: 'white' }}>
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    ))}
                </nav>

                {/* Logout */}
                <div className="mt-auto pt-4 px-1">
                    <button
                        onClick={() => setShowLogout(true)}
                        className="sidebar-nav-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                        <span className="text-lg">🚪</span>
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="dashboard-main">
                {/* Top Bar */}
                <div className="flex items-center justify-between mb-6 lg:mb-8">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
                    </button>
                    <div className="hidden lg:block"></div>

                    <div className="flex items-center gap-3">
                        <Link
                            to={theme === 'customer' ? '/customer-notifications' : theme === 'provider' ? '/provider-notifications' : '/admin/notifications'}
                            className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                            style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" /></svg>
                            {unreadCount > 0 && <span className="notification-count">{unreadCount}</span>}
                        </Link>
                        <div className="avatar">{user?.name?.[0] || "U"}</div>
                    </div>
                </div>

                {/* Page Content */}
                <div className="animate-fade-in">
                    {children}
                </div>
            </main>

            {/* Logout Confirmation Modal */}
            {showLogout && (
                <div className="modal-overlay" onClick={() => setShowLogout(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                                🚪
                            </div>
                            <h3 className="modal-title">Confirm Logout</h3>
                            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                                Are you sure you want to sign out of your account?
                            </p>
                            <div className="modal-actions justify-center">
                                <button onClick={() => setShowLogout(false)} className="btn btn-secondary">
                                    Cancel
                                </button>
                                <button onClick={handleLogout} className="btn btn-danger">
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

function getNavItems(theme, unreadCount) {
    const items = {
        customer: [
            { path: "/customer-dashboard", label: "Dashboard", icon: "📊" },
            { path: "/browse-providers", label: "Browse Providers", icon: "🔍" },
            { path: "/my-appointments", label: "My Appointments", icon: "📅" },
            { path: "/customer-profile", label: "Profile", icon: "👤" },
            { path: "/customer-notifications", label: "Notifications", icon: "🔔", badge: unreadCount },
        ],
        provider: [
            { path: "/provider-dashboard", label: "Dashboard", icon: "📊" },
            { path: "/provider-profile", label: "Profile", icon: "👤" },
            { path: "/manage-slots", label: "Manage Slots", icon: "📅" },
            { path: "/provider-appointments", label: "Appointments", icon: "📋" },
            { path: "/provider-reviews", label: "Reviews", icon: "⭐" },
            { path: "/provider-notifications", label: "Notifications", icon: "🔔", badge: unreadCount },
        ],
        admin: [
            { path: "/admin-dashboard", label: "Dashboard", icon: "📊" },
            { path: "/admin/users", label: "Users", icon: "👥" },
            { path: "/admin/providers", label: "Providers", icon: "🏥" },
            { path: "/admin/appointments", label: "Appointments", icon: "📅" },
            { path: "/admin/cancelled-appointments", label: "Cancelled", icon: "❌" },
            { path: "/admin/reset-system", label: "Reset System", icon: "⚙️" },
            { path: "/admin/notifications", label: "Notifications", icon: "🔔", badge: unreadCount },
            { path: "/admin/ai-help-desk", label: "AI Help Desk", icon: "🤖" },
        ],
    };
    return (items[theme] || items.customer).map((item) => ({
        ...item,
        badge: item.badge || 0,
    }));
}

export default DashboardLayout;
