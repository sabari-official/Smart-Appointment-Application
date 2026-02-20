import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { adminService } from "../../services/apiService";

const CancelledAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await adminService.getCancelledAppointments();
        if (res.success) setAppointments(res.data || []);
      } catch { } finally { setLoading(false); }
    })();
  }, []);

  const formatDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <DashboardLayout theme="admin">
      <div className="page-header">
        <h1 style={{ color: 'var(--text-primary)' }}>Cancelled <span className="text-gradient">Appointments</span> ❌</h1>
        <p>View all cancelled appointment records</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-16"></div>)}</div>
      ) : appointments.length > 0 ? (
        <div className="space-y-3">
          {appointments.map(a => (
            <div key={a._id} className="card p-4 flex flex-col md:flex-row md:items-center gap-4 animate-fade-in">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: 'rgba(239,68,68,0.1)' }}>❌</div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                  {a.customer?.name || "Customer"} → {a.provider?.name || "Provider"}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {formatDate(a.date)} • {a.startTime} - {a.endTime}
                </p>
              </div>
              <span className="badge badge-danger">Cancelled</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state py-16">
          <div className="empty-state-icon">✅</div>
          <p className="empty-state-title">No Cancellations</p>
          <p className="empty-state-text">Great! No appointments have been cancelled</p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CancelledAppointments;
