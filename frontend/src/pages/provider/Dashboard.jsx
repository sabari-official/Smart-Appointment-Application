import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { providerService, profileService } from "../../services/apiService";

const Dashboard = () => {
  const { user, checkProfileComplete, profileComplete } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [reviews, setReviews] = useState({ stats: { avgRating: 0, totalReviews: 0 } });
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkProfileComplete();
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [apptRes, reviewRes, slotRes] = await Promise.all([
        providerService.getAppointments().catch(() => null),
        providerService.getReviews().catch(() => null),
        providerService.getSlots().catch(() => null),
      ]);
      if (apptRes?.success) setAppointments(apptRes.data || []);
      if (reviewRes?.success) setReviews({ data: reviewRes.data || [], stats: reviewRes.stats || { avgRating: 0, totalReviews: 0 } });
      if (slotRes?.success) setSlots(slotRes.data || []);
    } catch { } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const todayAppts = appointments.filter((a) => a.date?.startsWith?.(today) || new Date(a.date).toISOString().split("T")[0] === today);
  const confirmedAppts = appointments.filter((a) => a.status === "confirmed");
  const completedAppts = appointments.filter((a) => a.status === "completed");
  const availableSlots = slots.filter((s) => !s.isBooked);

  const formatDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  if (!profileComplete) {
    return (
      <DashboardLayout theme="provider">
        <div className="flex flex-col items-center justify-center text-center py-20">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-6" style={{ background: 'rgba(20, 184, 166, 0.1)' }}>🏥</div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Complete Your Profile</h2>
          <p className="mb-6 max-w-md" style={{ color: 'var(--text-secondary)' }}>
            Please complete your provider profile to start accepting appointments.
          </p>
          <Link to="/complete-profile" className="btn btn-primary btn-lg">Complete Profile →</Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout theme="provider">
      <div className="page-header">
        <h1 style={{ color: 'var(--text-primary)' }}>
          Welcome, <span className="text-gradient">{user?.name?.split(" ")[0] || "Provider"}</span> 🩺
        </h1>
        <p>Manage your appointments and track your performance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Today's Bookings", value: todayAppts.length, icon: "📋", color: "#14b8a6" },
          { label: "Total Bookings", value: appointments.length, icon: "📊", color: "#0ea5e9" },
          { label: "Avg Rating", value: (reviews.stats.avgRating || 0).toFixed(1) + "★", icon: "⭐", color: "#f59e0b" },
          { label: "Available Slots", value: availableSlots.length, icon: "🕐", color: "#8b5cf6" },
        ].map((s, i) => (
          <div key={i} className="stat-card animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="stat-icon" style={{ background: `${s.color}15`, color: s.color }}>{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Today's Appointments */}
        <div className="lg:col-span-3">
          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Today's Appointments</h3>
              <Link to="/provider-appointments" className="text-sm font-medium" style={{ color: 'var(--primary)' }}>View All →</Link>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (<div key={i} className="skeleton h-20 w-full"></div>))}
              </div>
            ) : todayAppts.length > 0 ? (
              <div className="space-y-3">
                {todayAppts.map((appt) => (
                  <div key={appt._id} className="glass-card p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: 'rgba(20, 184, 166, 0.1)' }}>
                      👤
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                        {appt.customer?.name || "Customer"}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {appt.startTime} - {appt.endTime}
                      </p>
                    </div>
                    <span className={`badge ${appt.status === "confirmed" ? "badge-success" : appt.status === "completed" ? "badge-primary" : "badge-neutral"}`}>
                      {appt.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state py-8">
                <div className="empty-state-icon">📅</div>
                <p className="empty-state-title">No Appointments Today</p>
                <p className="empty-state-text">You have no scheduled appointments for today</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Quick Actions</h3>
            <div className="space-y-2">
              {[
                { to: "/manage-slots", icon: "📅", label: "Manage Slots", color: "#14b8a6" },
                { to: "/provider-appointments", icon: "📋", label: "All Appointments", color: "#0ea5e9" },
                { to: "/provider-reviews", icon: "⭐", label: "Reviews", color: "#f59e0b" },
                { to: "/provider-profile", icon: "👤", label: "Edit Profile", color: "#8b5cf6" },
              ].map((action, i) => (
                <Link key={i} to={action.to} className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:translate-x-1" style={{ background: `${action.color}08`, border: `1px solid ${action.color}15` }}>
                  <span className="text-lg">{action.icon}</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{action.label}</span>
                  <span className="ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>→</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Performance */}
          <div className="card">
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Performance</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span style={{ color: 'var(--text-secondary)' }}>Completion Rate</span>
                  <span className="font-bold" style={{ color: '#10b981' }}>
                    {appointments.length > 0 ? Math.round((completedAppts.length / appointments.length) * 100) : 0}%
                  </span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${appointments.length > 0 ? Math.round((completedAppts.length / appointments.length) * 100) : 0}%`, background: 'linear-gradient(90deg, #10b981, #14b8a6)' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span style={{ color: 'var(--text-secondary)' }}>Reviews</span>
                  <span className="font-bold" style={{ color: '#f59e0b' }}>{reviews.stats.totalReviews || 0}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${Math.min((reviews.stats.totalReviews || 0) * 10, 100)}%`, background: 'linear-gradient(90deg, #f59e0b, #fbbf24)' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
