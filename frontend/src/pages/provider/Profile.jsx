import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { profileService, aiService } from "../../services/apiService";
import toast from "react-hot-toast";

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    businessName: "", domain: "", description: "", contactNumber: "", address: "",
    workingHoursStart: "", workingHoursEnd: "", appointmentInstructions: "",
  });
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingKeywords, setGeneratingKeywords] = useState(false);

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await profileService.getProfile();
      if (res.success && res.data) {
        setForm({
          businessName: res.data.businessName || "",
          domain: res.data.domain || "",
          description: res.data.description || "",
          contactNumber: res.data.contactNumber || "",
          address: res.data.address || "",
          workingHoursStart: res.data.workingHours?.start || res.data.workingHoursStart || "",
          workingHoursEnd: res.data.workingHours?.end || res.data.workingHoursEnd || "",
          appointmentInstructions: res.data.appointmentInstructions || "",
        });
        setKeywords(res.data.aiKeywords || []);
      }
    } catch { } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.businessName || !form.domain || !form.contactNumber) {
      toast.error("Please fill required fields"); return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        workingHours: { start: form.workingHoursStart, end: form.workingHoursEnd },
      };
      const res = await profileService.updateProfile(payload);
      if (res.success) {
        toast.success("Profile updated!");
        if (res.data?.isComplete) updateProfile({ profileCompleted: true });
      }
    } catch (err) { toast.error(err.response?.data?.message || "Update failed"); }
    finally { setSaving(false); }
  };

  const generateKeywords = async () => {
    setGeneratingKeywords(true);
    try {
      const res = await aiService.generateKeywords();
      if (res.success && res.data?.keywords) {
        setKeywords(res.data.keywords);
        toast.success("AI Keywords generated!");
      }
    } catch { toast.error("Keyword generation failed"); }
    finally { setGeneratingKeywords(false); }
  };

  return (
    <DashboardLayout theme="provider">
      <div className="page-header">
        <h1 style={{ color: 'var(--text-primary)' }}>Provider <span className="text-gradient">Profile</span> 🏥</h1>
        <p>Manage your business information and enhance discoverability</p>
      </div>

      <div className="max-w-3xl">
        <div className="card p-8 mb-6">
          <div className="flex items-center gap-5 mb-8 pb-8" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <div className="avatar avatar-xl" style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}>
              {(form.businessName || user?.name || "P")[0]}
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{form.businessName || user?.name}</h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{user?.email}</p>
              <span className="badge badge-success mt-1">Provider</span>
            </div>
          </div>

          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton h-14 w-full"></div>)}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div className="form-group">
                  <label className="form-label">Business Name *</label>
                  <input className="form-input" value={form.businessName} onChange={e => setForm(p => ({ ...p, businessName: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Domain/Specialty *</label>
                  <input className="form-input" placeholder="e.g. Dentist, Cardiologist" value={form.domain} onChange={e => setForm(p => ({ ...p, domain: e.target.value }))} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={4} placeholder="Describe your services..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div className="form-group">
                  <label className="form-label">Contact Number *</label>
                  <input className="form-input" value={form.contactNumber} onChange={e => setForm(p => ({ ...p, contactNumber: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input className="form-input" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div className="form-group">
                  <label className="form-label">Working Hours Start</label>
                  <input type="time" className="form-input" value={form.workingHoursStart} onChange={e => setForm(p => ({ ...p, workingHoursStart: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Working Hours End</label>
                  <input type="time" className="form-input" value={form.workingHoursEnd} onChange={e => setForm(p => ({ ...p, workingHoursEnd: e.target.value }))} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Appointment Instructions</label>
                <textarea className="form-input" rows={3} placeholder="Special instructions for patients..." value={form.appointmentInstructions} onChange={e => setForm(p => ({ ...p, appointmentInstructions: e.target.value }))} />
              </div>

              <button type="submit" className="btn btn-primary btn-lg w-full" disabled={saving}>
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </form>
          )}
        </div>

        {/* AI Keywords */}
        <div className="card p-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>🤖 AI Keywords</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>AI-generated keywords to improve your discoverability</p>
            </div>
            <button onClick={generateKeywords} className="btn btn-sm btn-primary" disabled={generatingKeywords}>
              {generatingKeywords ? "Generating..." : "🤖 Generate"}
            </button>
          </div>
          {keywords.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {keywords.map((kw, i) => (
                <span key={i} className="badge badge-primary">{kw}</span>
              ))}
            </div>
          ) : (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No keywords yet. Click "Generate" to create AI-powered keywords.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
