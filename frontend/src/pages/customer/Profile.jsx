import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { profileService } from "../../services/apiService";
import toast from "react-hot-toast";

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ name: "", phone: "", address: "", gender: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await profileService.getProfile();
      if (res.success && res.data) {
        setForm({
          name: res.data.name || user?.name || "",
          phone: res.data.phone || "",
          address: res.data.address || "",
          gender: res.data.gender || "",
        });
      }
    } catch { toast.error("Failed to load profile"); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
      toast.error("Please fill all required fields"); return;
    }
    setSaving(true);
    try {
      const res = await profileService.updateProfile(form);
      if (res.success) {
        toast.success("Profile updated!");
        if (res.data?.isComplete) updateProfile({ profileCompleted: true });
      }
    } catch (err) { toast.error(err.response?.data?.message || "Update failed"); }
    finally { setSaving(false); }
  };

  return (
    <DashboardLayout theme="customer">
      <div className="page-header">
        <h1 style={{ color: 'var(--text-primary)' }}>My <span className="text-gradient">Profile</span> 👤</h1>
        <p>Manage your personal information</p>
      </div>
      <div className="max-w-2xl">
        <div className="card p-8">
          {/* Avatar */}
          <div className="flex items-center gap-5 mb-8 pb-8" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <div className="avatar avatar-xl">{(form.name || user?.name || "U")[0]}</div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{form.name || user?.name}</h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{user?.email}</p>
              <span className="badge badge-primary mt-1">Customer</span>
            </div>
          </div>

          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-14 w-full"></div>)}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input className="form-input" value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Address *</label>
                <textarea className="form-input" rows={3} value={form.address} onChange={(e) => setForm(p => ({ ...p, address: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select className="form-input" value={form.gender} onChange={(e) => setForm(p => ({ ...p, gender: e.target.value }))}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary btn-lg w-full" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
