import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { providerService } from "../../services/apiService";
import toast from "react-hot-toast";

const ProviderServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", duration: "", price: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadServices(); }, []);

  const loadServices = async () => {
    setLoading(true);
    try {
      const res = await providerService.getServices();
      if (res.success) setServices(res.data || []);
    } catch { } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) { toast.error("Service name required"); return; }
    setSaving(true);
    try {
      let res;
      if (editing) {
        res = await providerService.updateService(editing, form);
      } else {
        res = await providerService.createService(form);
      }
      if (res.success) {
        toast.success(editing ? "Service updated!" : "Service created!");
        setShowForm(false);
        setEditing(null);
        setForm({ name: "", description: "", duration: "", price: "" });
        loadServices();
      }
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await providerService.deleteService(id);
      toast.success("Service deleted");
      loadServices();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const startEdit = (svc) => {
    setEditing(svc._id);
    setForm({ name: svc.name || "", description: svc.description || "", duration: svc.duration || "", price: svc.price || "" });
    setShowForm(true);
  };

  return (
    <DashboardLayout theme="provider">
      <div className="page-header">
        <h1 style={{ color: 'var(--text-primary)' }}>My <span className="text-gradient">Services</span> 🛠️</h1>
        <p>Manage the services you offer to clients</p>
      </div>

      <button onClick={() => { setShowForm(true); setEditing(null); setForm({ name: "", description: "", duration: "", price: "" }); }} className="btn btn-primary mb-6">
        + Add Service
      </button>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">{[1, 2, 3].map(i => <div key={i} className="skeleton h-32"></div>)}</div>
      ) : services.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          {services.map((svc, i) => (
            <div key={svc._id || i} className="card p-5 card-hover animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <h3 className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{svc.name}</h3>
              {svc.description && <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{svc.description}</p>}
              <div className="flex flex-wrap gap-2 mb-3">
                {svc.duration && <span className="badge badge-info">⏱ {svc.duration}</span>}
                {svc.price && <span className="badge badge-success">💰 {svc.price}</span>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(svc)} className="btn btn-sm btn-secondary">Edit</button>
                <button onClick={() => handleDelete(svc._id)} className="btn btn-sm btn-ghost text-red-400">Delete</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state py-16">
          <div className="empty-state-icon">🛠️</div>
          <p className="empty-state-title">No Services Yet</p>
          <p className="empty-state-text">Add services you offer to help customers understand what you provide</p>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">{editing ? "Edit Service" : "Add Service"} ✨</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-group">
                <label className="form-label">Service Name *</label>
                <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Duration</label>
                  <input className="form-input" placeholder="e.g. 30 min" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Price</label>
                  <input className="form-input" placeholder="e.g. $50" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : editing ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ProviderServices;
