import React, { useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { adminService } from "../../services/apiService";
import toast from "react-hot-toast";

const ResetSystem = () => {
  const [password, setPassword] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleVerify = async () => {
    if (!password) { toast.error("Enter admin password"); return; }
    setVerifying(true);
    try {
      const res = await adminService.verifyResetPassword(password);
      if (res.success) { setConfirmed(true); toast.success("Password verified"); }
    } catch (err) { toast.error(err.response?.data?.message || "Verification failed"); }
    finally { setVerifying(false); }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      const res = await adminService.resetSystem(password);
      if (res.success) { toast.success("System reset successfully!"); setPassword(""); setConfirmed(false); }
    } catch (err) { toast.error(err.response?.data?.message || "Reset failed"); }
    finally { setLoading(false); }
  };

  return (
    <DashboardLayout theme="admin">
      <div className="page-header">
        <h1 style={{ color: 'var(--text-primary)' }}>System <span className="text-gradient">Reset</span> ⚙️</h1>
        <p>Reset all system data. This action is irreversible.</p>
      </div>

      <div className="max-w-lg">
        <div className="card p-8">
          <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl" style={{ background: 'rgba(239,68,68,0.1)' }}>
            ⚠️
          </div>

          <div className="text-center mb-8">
            <h2 className="text-xl font-bold mb-2" style={{ color: '#ef4444' }}>Danger Zone</h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              This will permanently delete ALL data including users, appointments, reviews, notifications, and profiles.
            </p>
          </div>

          {!confirmed ? (
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label">Admin Password</label>
                <input type="password" className="form-input" placeholder="Enter your password to verify" value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              <button onClick={handleVerify} className="btn btn-warning w-full btn-lg" disabled={verifying}>
                {verifying ? "Verifying..." : "Verify Identity"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                <p className="text-sm font-bold" style={{ color: '#ef4444' }}>
                  ⚠️ Identity verified. Are you absolutely sure you want to reset the entire system?
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => { setConfirmed(false); setPassword(""); }} className="btn btn-secondary">Cancel</button>
                <button onClick={handleReset} className="btn btn-danger" disabled={loading}>
                  {loading ? "Resetting..." : "🗑️ Reset System"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ResetSystem;
