import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { adminService } from "../../services/apiService";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAppointments(); }, []);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllAppointments();
      if (res.success) setAppointments(res.data || []);
    } catch { } finally { setLoading(false); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <DashboardLayout theme="admin">
      <div className="page-header">
        <h1 style={{ color: 'var(--text-primary)' }}>All <span className="text-gradient">Appointments</span> 📅</h1>
        <p>Monitor all system appointments</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton h-16"></div>)}</div>
      ) : appointments.length > 0 ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr><th>Customer</th><th>Provider</th><th>Date</th><th>Time</th><th>Status</th></tr>
              </thead>
              <tbody>
                {appointments.map(a => (
                  <tr key={a._id}>
                    <td><span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{a.customer?.name || "—"}</span></td>
                    <td><span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{a.provider?.name || "—"}</span></td>
                    <td><span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{formatDate(a.date)}</span></td>
                    <td><span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{a.startTime} - {a.endTime}</span></td>
                    <td><span className={`badge ${a.status === 'confirmed' ? 'badge-success' : a.status === 'completed' ? 'badge-primary' : a.status === 'cancelled' ? 'badge-danger' : 'badge-warning'}`}>{a.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="empty-state py-16">
          <div className="empty-state-icon">📅</div>
          <p className="empty-state-title">No Appointments</p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Appointments;
