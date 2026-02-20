import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { adminService } from "../../services/apiService";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, actRes] = await Promise.all([
        adminService.getDashboardStats().catch(() => null),
        adminService.getDashboardActivity().catch(() => null),
      ]);
      if (statsRes?.success) setStats(statsRes.data);
      if (actRes?.success) setActivity(actRes.data);
    } catch { } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <DashboardLayout theme="admin">
      <div className="page-header">
        <h1 style={{ color: 'var(--text-primary)' }}>
          Admin <span className="text-gradient">Control Panel</span> 👑
        </h1>
        <p>System-wide monitoring and management</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Users", value: stats?.totalUsers || 0, icon: "👥", color: "#8b5cf6" },
          { label: "Providers", value: stats?.totalProviders || 0, icon: "🏥", color: "#14b8a6" },
          { label: "Appointments", value: stats?.totalAppointments || 0, icon: "📅", color: "#0ea5e9" },
          { label: "Cancel Rate", value: (stats?.cancelledAppointments && stats?.totalAppointments > 0 ? Math.round((stats.cancelledAppointments / stats.totalAppointments) * 100) : 0) + "%", icon: "📊", color: "#ef4444" },
        ].map((s, i) => (
          <div key={i} className="stat-card animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="stat-icon" style={{ background: `${s.color}15`, color: s.color }}>{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Extra Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Customers", value: stats?.totalCustomers || 0, icon: "👤", color: "#06b6d4" },
          { label: "Completed", value: stats?.completedAppointments || 0, icon: "✅", color: "#10b981" },
          { label: "Avg Rating", value: stats?.avgRating || "0.0", icon: "⭐", color: "#f59e0b" },
          { label: "Suspended", value: stats?.suspendedUsers || 0, icon: "🚫", color: "#f97316" },
        ].map((s, i) => (
          <div key={i} className="stat-card animate-fade-in-up" style={{ animationDelay: `${(i + 4) * 0.1}s` }}>
            <div className="stat-icon" style={{ background: `${s.color}15`, color: s.color }}>{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Recent Appointments */}
        <div className="lg:col-span-3">
          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Recent Activity</h3>
              <Link to="/admin/appointments" className="text-sm font-medium" style={{ color: 'var(--primary)' }}>View All →</Link>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (<div key={i} className="skeleton h-16 w-full"></div>))}
              </div>
            ) : activity?.recentAppointments?.length > 0 ? (
              <div className="space-y-3">
                {activity.recentAppointments.slice(0, 6).map((appt) => (
                  <div key={appt._id} className="glass-card p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
                      📋
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                        {appt.customer?.name || "Customer"} → {appt.provider?.name || "Provider"}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {formatDate(appt.createdAt)}
                      </p>
                    </div>
                    <span className={`badge ${appt.status === "confirmed" ? "badge-success" :
                        appt.status === "completed" ? "badge-primary" :
                          appt.status === "cancelled" ? "badge-danger" : "badge-neutral"
                      }`}>
                      {appt.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state py-8">
                <div className="empty-state-icon">📊</div>
                <p className="empty-state-title">No Recent Activity</p>
                <p className="empty-state-text">System activity will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions + Recent Users */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>System Actions</h3>
            <div className="space-y-2">
              {[
                { to: "/admin/users", icon: "👥", label: "Manage Users", color: "#8b5cf6" },
                { to: "/admin/providers", icon: "🏥", label: "Manage Providers", color: "#14b8a6" },
                { to: "/admin/appointments", icon: "📅", label: "All Appointments", color: "#0ea5e9" },
                { to: "/admin/cancelled-appointments", icon: "❌", label: "Cancelled", color: "#ef4444" },
                { to: "/admin/ai-help-desk", icon: "🤖", label: "AI Help Desk", color: "#f59e0b" },
                { to: "/admin/reset-system", icon: "⚙️", label: "Reset System", color: "#f97316" },
              ].map((action, i) => (
                <Link key={i} to={action.to} className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:translate-x-1" style={{ background: `${action.color}08`, border: `1px solid ${action.color}15` }}>
                  <span className="text-lg">{action.icon}</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{action.label}</span>
                  <span className="ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>→</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Users */}
          {activity?.recentUsers?.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>New Users</h3>
              <div className="space-y-3">
                {activity.recentUsers.slice(0, 4).map((u) => (
                  <div key={u._id} className="flex items-center gap-3">
                    <div className="avatar avatar-sm">{(u.name || "U")[0]}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{u.name}</p>
                      <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{u.email}</p>
                    </div>
                    <span className="badge badge-primary text-xs">{u.role}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
