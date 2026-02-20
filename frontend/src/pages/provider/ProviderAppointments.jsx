import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { providerService } from "../../services/apiService";
import toast from "react-hot-toast";

const ProviderAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(null);

  useEffect(() => { loadAppointments(); }, [filter]);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const params = filter !== "all" ? { status: filter } : {};
      const res = await providerService.getAppointments(params);
      if (res.success) setAppointments(res.data || []);
    } catch { } finally { setLoading(false); }
  };

  const handleComplete = async (id) => {
    setCompleting(id);
    try {
      const res = await providerService.completeAppointment(id);
      if (res.success) { toast.success("Appointment marked complete"); loadAppointments(); }
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    finally { setCompleting(null); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const tabs = [
    { value: "all", label: "All" },
    { value: "confirmed", label: "Confirmed" },
    { value: "pending", label: "Pending" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  return (
    <DashboardLayout theme="provider">
      <div className="page-header">
        <h1 style={{ color: 'var(--text-primary)' }}>
          <span className="text-gradient">Appointments</span> 📋
        </h1>
        <p>View and manage all your appointment bookings</p>
      </div>

      <div className="tabs mb-6 max-w-xl">
        {tabs.map(t => (
          <button key={t.value} onClick={() => setFilter(t.value)} className={`tab ${filter === t.value ? "active" : ""}`}>{t.label}</button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">{[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-24"></div>)}</div>
      ) : appointments.length > 0 ? (
        <div className="space-y-4">
          {appointments.map(appt => (
            <div key={appt._id} className="card p-5 flex flex-col md:flex-row md:items-center gap-4 animate-fade-in">
              <div className="avatar" style={{ background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)' }}>
                {(appt.customer?.name || "C")[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                  {appt.customer?.name || "Customer"}
                </p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {formatDate(appt.date)} • {appt.startTime} - {appt.endTime}
                </p>
              </div>
              <span className={`badge ${appt.status === 'confirmed' ? 'badge-success' :
                  appt.status === 'completed' ? 'badge-primary' :
                    appt.status === 'cancelled' ? 'badge-danger' : 'badge-warning'
                }`}>{appt.status}</span>
              {appt.status === "confirmed" && (
                <button onClick={() => handleComplete(appt._id)} disabled={completing === appt._id} className="btn btn-sm btn-success">
                  {completing === appt._id ? "..." : "✓ Complete"}
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state py-16">
          <div className="empty-state-icon">📋</div>
          <p className="empty-state-title">No Appointments</p>
          <p className="empty-state-text">{filter !== "all" ? `No ${filter} appointments` : "No appointments yet"}</p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ProviderAppointments;
