import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { customerService } from "../../services/apiService";

const Dashboard = () => {
  const { user, checkProfileComplete, profileComplete } = useAuth();
  const [stats, setStats] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkProfileComplete();
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, recRes, apptRes] = await Promise.all([
        customerService.getStats().catch(() => null),
        customerService.getRecommendedProviders(4).catch(() => null),
        customerService.getAppointments("confirmed").catch(() => null),
      ]);
      if (statsRes?.success) setStats(statsRes.data);
      if (recRes?.success) setRecommended(recRes.data?.slice(0, 4) || []);
      if (apptRes?.success) {
        const now = new Date();
        setUpcoming(
          (apptRes.data || [])
            .filter((a) => new Date(a.date) >= now && (a.status === "confirmed" || a.status === "pending"))
            .slice(0, 3)
        );
      }
    } catch { } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  if (!profileComplete) {
    return (
      <DashboardLayout theme="customer">
        <div className="flex flex-col items-center justify-center text-center py-20">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-6" style={{ background: 'rgba(14, 165, 233, 0.1)' }}>👤</div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Complete Your Profile</h2>
          <p className="mb-6 max-w-md" style={{ color: 'var(--text-secondary)' }}>
            Please complete your profile before booking appointments.
          </p>
          <Link to="/complete-profile" className="btn btn-primary btn-lg">Complete Profile →</Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout theme="customer">
      {/* Welcome */}
      <div className="page-header">
        <h1 style={{ color: 'var(--text-primary)' }}>
          Welcome back, <span className="text-gradient">{user?.name?.split(" ")[0] || "User"}</span> 👋
        </h1>
        <p>Here's an overview of your appointment activity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total", value: stats?.totalAppointments || 0, icon: "📅", color: "#0ea5e9" },
          { label: "Upcoming", value: stats?.upcomingAppointments || 0, icon: "⏰", color: "#10b981" },
          { label: "Completed", value: stats?.completedAppointments || 0, icon: "✅", color: "#8b5cf6" },
          { label: "Cancelled", value: stats?.cancelledAppointments || 0, icon: "❌", color: "#ef4444" },
        ].map((s, i) => (
          <div key={i} className="stat-card animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="stat-icon" style={{ background: `${s.color}15`, color: s.color }}>
              {s.icon}
            </div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Upcoming Appointments */}
        <div className="lg:col-span-3">
          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Upcoming Appointments</h3>
              <Link to="/my-appointments" className="text-sm font-medium" style={{ color: 'var(--primary)' }}>View All →</Link>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton h-20 w-full" style={{ opacity: 1 - i * 0.2 }}></div>
                ))}
              </div>
            ) : upcoming.length > 0 ? (
              <div className="space-y-3">
                {upcoming.map((appt) => (
                  <div key={appt._id} className="glass-card p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: 'rgba(14, 165, 233, 0.1)' }}>
                      🗓️
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                        {appt.provider?.name || "Provider"}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {formatDate(appt.date)} • {appt.startTime} - {appt.endTime}
                      </p>
                    </div>
                    <span className="badge badge-success">Confirmed</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state py-8">
                <div className="empty-state-icon">📅</div>
                <p className="empty-state-title">No Upcoming Appointments</p>
                <p className="empty-state-text">Browse providers to book your first appointment</p>
                <Link to="/browse-providers" className="btn btn-primary btn-sm mt-4">Browse Providers</Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions + Recommended */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Quick Actions</h3>
            <div className="space-y-2">
              {[
                { to: "/browse-providers", icon: "🔍", label: "Find a Provider", color: "#0ea5e9" },
                { to: "/my-appointments", icon: "📋", label: "My Appointments", color: "#8b5cf6" },
                { to: "/customer-profile", icon: "👤", label: "Edit Profile", color: "#14b8a6" },
              ].map((action, i) => (
                <Link key={i} to={action.to} className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:translate-x-1" style={{ background: `${action.color}08`, border: `1px solid ${action.color}15` }}>
                  <span className="text-lg">{action.icon}</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{action.label}</span>
                  <span className="ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>→</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Recommended Providers */}
          {recommended.length > 0 && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  <span className="mr-1">🤖</span> AI Recommended
                </h3>
              </div>
              <div className="space-y-3">
                {recommended.slice(0, 3).map((p, i) => (
                  <Link key={i} to={`/view-slots/${p.providerId || p.user?._id}`} className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:translate-x-1" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)' }}>
                    <div className="avatar avatar-sm" style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}>
                      {(p.businessName || p.user?.name || "P")[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                        {p.businessName || p.user?.name}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{p.domain || "General"}</p>
                    </div>
                    <div className="text-xs font-bold" style={{ color: '#fbbf24' }}>
                      ★ {(p.rating || 0).toFixed(1)}
                    </div>
                  </Link>
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
