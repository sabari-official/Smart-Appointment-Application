import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { providerService } from "../../services/apiService";

const AppointedPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadPatients(); }, []);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const res = await providerService.getAppointedPatients();
      if (res.success) setPatients(res.data || []);
    } catch { } finally { setLoading(false); }
  };

  return (
    <DashboardLayout theme="provider">
      <div className="page-header">
        <h1 style={{ color: 'var(--text-primary)' }}>
          Appointed <span className="text-gradient">Patients</span> 👥
        </h1>
        <p>View your patients who have booked appointments</p>
      </div>

      {loading ? (
        <div className="space-y-4">{[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-20"></div>)}</div>
      ) : patients.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map((p, i) => (
            <div key={p._id || i} className="card p-5 animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="flex items-center gap-4">
                <div className="avatar">{(p.name || p.customer?.name || "P")[0]}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                    {p.name || p.customer?.name || "Patient"}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {p.email || p.customer?.email || ""}
                  </p>
                  {p.appointmentCount && (
                    <span className="badge badge-primary mt-1">{p.appointmentCount} appointments</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state py-16">
          <div className="empty-state-icon">👥</div>
          <p className="empty-state-title">No Patients Yet</p>
          <p className="empty-state-text">Patients will appear here once they book appointments with you</p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AppointedPatients;
