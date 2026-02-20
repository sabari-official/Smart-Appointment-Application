import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { providerService } from "../../services/apiService";
import toast from "react-hot-toast";

const ManageSlots = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ date: "", startTime: "", endTime: "" });
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => { loadSlots(); }, []);

  const loadSlots = async () => {
    setLoading(true);
    try {
      const res = await providerService.getSlots();
      if (res.success) setSlots(res.data || []);
    } catch { } finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.date || !form.startTime || !form.endTime) { toast.error("Fill all fields"); return; }
    setCreating(true);
    try {
      const res = await providerService.createSlot(form);
      if (res.success) { toast.success("Slot created!"); setShowCreate(false); setForm({ date: "", startTime: "", endTime: "" }); loadSlots(); }
    } catch (err) { toast.error(err.response?.data?.message || "Failed to create slot"); }
    finally { setCreating(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await providerService.deleteSlot(deleteTarget);
      toast.success("Slot deleted");
      setDeleteTarget(null);
      loadSlots();
    } catch (err) { toast.error(err.response?.data?.message || "Delete failed"); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });

  const today = new Date().toISOString().split("T")[0];
  const grouped = slots.reduce((acc, s) => {
    const dk = new Date(s.date).toISOString().split("T")[0];
    if (!acc[dk]) acc[dk] = [];
    acc[dk].push(s);
    return acc;
  }, {});

  const availableCount = slots.filter(s => !s.isBooked).length;
  const bookedCount = slots.filter(s => s.isBooked).length;

  return (
    <DashboardLayout theme="provider">
      <div className="page-header">
        <h1 style={{ color: 'var(--text-primary)' }}>Manage <span className="text-gradient">Slots</span> 📅</h1>
        <p>Create and manage your appointment time slots</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6 max-w-2xl">
        {[
          { label: "Total", value: slots.length, color: "#14b8a6" },
          { label: "Available", value: availableCount, color: "#10b981" },
          { label: "Booked", value: bookedCount, color: "#f59e0b" },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-value" style={{ color: s.color, fontSize: '1.5rem' }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Create Button */}
      <button onClick={() => setShowCreate(true)} className="btn btn-primary mb-6">
        + Create New Slot
      </button>

      {/* Slots Grid */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i}>
              <div className="skeleton h-6 w-40 mb-3"></div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map(j => <div key={j} className="skeleton h-24"></div>)}
              </div>
            </div>
          ))}
        </div>
      ) : Object.keys(grouped).length > 0 ? (
        <div className="space-y-8">
          {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([dk, daySlots]) => (
            <div key={dk}>
              <h3 className="text-md font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                📅 {formatDate(dk)}
                <span className="badge badge-neutral">{daySlots.length} slots</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {daySlots.sort((a, b) => a.startTime.localeCompare(b.startTime)).map(slot => (
                  <div key={slot._id} className="card p-4 text-center">
                    <p className="font-bold text-lg" style={{ color: slot.isBooked ? '#f59e0b' : 'var(--primary)' }}>
                      {slot.startTime}
                    </p>
                    <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>to {slot.endTime}</p>
                    <span className={`badge ${slot.isBooked ? 'badge-warning' : 'badge-success'} mb-2`}>
                      {slot.isBooked ? "Booked" : "Available"}
                    </span>
                    {!slot.isBooked && (
                      <button onClick={() => setDeleteTarget(slot._id)} className="btn btn-sm btn-ghost text-red-400 w-full mt-1">
                        Delete
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state py-16">
          <div className="empty-state-icon">📅</div>
          <p className="empty-state-title">No Slots Created</p>
          <p className="empty-state-text">Create time slots for your customers to book appointments</p>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Create New Slot ✨</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="form-group">
                <label className="form-label">Date</label>
                <input type="date" className="form-input" min={today} value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Start Time</label>
                  <input type="time" className="form-input" value={form.startTime} onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">End Time</label>
                  <input type="time" className="form-input" value={form.endTime} onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))} required />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreate(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? "Creating..." : "Create Slot"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl" style={{ background: 'rgba(239,68,68,0.1)' }}>🗑️</div>
              <h3 className="modal-title">Delete Slot?</h3>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>This action cannot be undone.</p>
              <div className="modal-actions justify-center">
                <button onClick={() => setDeleteTarget(null)} className="btn btn-secondary">Cancel</button>
                <button onClick={handleDelete} className="btn btn-danger">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ManageSlots;
