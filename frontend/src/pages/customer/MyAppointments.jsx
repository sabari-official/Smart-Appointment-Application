import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { customerService } from "../../services/apiService";
import toast from "react-hot-toast";

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState(null); // { type: 'cancel'|'review'|'reschedule', appointment }
  const [reviewData, setReviewData] = useState({ rating: 5, comment: "" });
  const [rescheduleSlot, setRescheduleSlot] = useState(null);
  const [slots, setSlots] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { loadAppointments(); }, [filter]);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const res = await customerService.getAppointments(filter);
      if (res.success) setAppointments(res.data || []);
    } catch { toast.error("Failed to load appointments"); }
    finally { setLoading(false); }
  };

  const handleCancel = async () => {
    if (!action?.appointment) return;
    setActionLoading(true);
    try {
      const res = await customerService.cancelAppointment(action.appointment._id);
      if (res.success) { toast.success("Appointment cancelled"); setAction(null); loadAppointments(); }
    } catch (err) { toast.error(err.response?.data?.message || "Cancel failed"); }
    finally { setActionLoading(false); }
  };

  const handleReview = async () => {
    if (!action?.appointment) return;
    if (!reviewData.comment.trim()) { toast.error("Comment required"); return; }
    setActionLoading(true);
    try {
      const res = await customerService.submitReview(action.appointment._id, reviewData);
      if (res.success) { toast.success("Review submitted!"); setAction(null); loadAppointments(); }
    } catch (err) { toast.error(err.response?.data?.message || "Review failed"); }
    finally { setActionLoading(false); }
  };

  const handleReschedule = async () => {
    if (!action?.appointment || !rescheduleSlot) return;
    setActionLoading(true);
    try {
      const res = await customerService.rescheduleAppointment(action.appointment._id, { slotId: rescheduleSlot });
      if (res.success) { toast.success("Appointment rescheduled!"); setAction(null); setRescheduleSlot(null); loadAppointments(); }
    } catch (err) { toast.error(err.response?.data?.message || "Reschedule failed"); }
    finally { setActionLoading(false); }
  };

  const loadSlots = async (providerId) => {
    try {
      const res = await customerService.getProviderSlots(providerId);
      if (res.success) setSlots(res.data || []);
    } catch { setSlots([]); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const statusColors = {
    confirmed: { bg: "rgba(16,185,129,0.1)", color: "#10b981", badge: "badge-success" },
    completed: { bg: "rgba(99,102,241,0.1)", color: "#6366f1", badge: "badge-primary" },
    cancelled: { bg: "rgba(239,68,68,0.1)", color: "#ef4444", badge: "badge-danger" },
    pending: { bg: "rgba(245,158,11,0.1)", color: "#f59e0b", badge: "badge-warning" },
    booked: { bg: "rgba(59,130,246,0.1)", color: "#3b82f6", badge: "badge-info" },
  };

  const tabs = [
    { value: "all", label: "All" },
    { value: "confirmed", label: "Confirmed" },
    { value: "pending", label: "Pending" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  return (
    <DashboardLayout theme="customer">
      <div className="page-header">
        <h1 style={{ color: 'var(--text-primary)' }}>
          My <span className="text-gradient">Appointments</span> 📋
        </h1>
        <p>Track and manage all your appointment bookings</p>
      </div>

      {/* Filter Tabs */}
      <div className="tabs mb-6 max-w-xl">
        {tabs.map((t) => (
          <button key={t.value} onClick={() => setFilter(t.value)} className={`tab ${filter === t.value ? "active" : ""}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-28 w-full"></div>)}
        </div>
      ) : appointments.length > 0 ? (
        <div className="space-y-4">
          {appointments.map((appt) => {
            const sc = statusColors[appt.status?.toLowerCase()] || statusColors.pending;
            return (
              <div key={appt._id} className="card p-5 animate-fade-in-up">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: sc.bg }}>
                    {appt.status === "completed" ? "✅" : appt.status === "cancelled" ? "❌" : "📅"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                        {appt.provider?.name || "Provider"}
                      </h3>
                      <span className={`badge ${sc.badge}`}>{appt.status}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <span>📅 {formatDate(appt.date)}</span>
                      <span>⏰ {appt.startTime} - {appt.endTime}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    {(appt.status === "confirmed" || appt.status === "pending" || appt.status === "booked") && (
                      <>
                        <button onClick={() => { setAction({ type: "reschedule", appointment: appt }); loadSlots(appt.provider?._id || appt.provider); }} className="btn btn-sm btn-secondary">
                          Reschedule
                        </button>
                        <button onClick={() => setAction({ type: "cancel", appointment: appt })} className="btn btn-sm btn-danger">
                          Cancel
                        </button>
                      </>
                    )}
                    {appt.status === "completed" && !appt.reviewed && (
                      <button onClick={() => { setAction({ type: "review", appointment: appt }); setReviewData({ rating: 5, comment: "" }); }} className="btn btn-sm btn-primary">
                        ⭐ Review
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state py-16">
          <div className="empty-state-icon">📋</div>
          <p className="empty-state-title">No Appointments</p>
          <p className="empty-state-text">
            {filter !== "all" ? `No ${filter} appointments found` : "You haven't booked any appointments yet"}
          </p>
        </div>
      )}

      {/* Cancel Modal */}
      {action?.type === "cancel" && (
        <div className="modal-overlay" onClick={() => setAction(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl" style={{ background: 'rgba(239,68,68,0.1)' }}>❌</div>
              <h3 className="modal-title">Cancel Appointment?</h3>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>This action cannot be undone. The provider will be notified.</p>
              <div className="modal-actions justify-center">
                <button onClick={() => setAction(null)} className="btn btn-secondary" disabled={actionLoading}>Keep</button>
                <button onClick={handleCancel} className="btn btn-danger" disabled={actionLoading}>
                  {actionLoading ? "Cancelling..." : "Cancel Appointment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {action?.type === "review" && (
        <div className="modal-overlay" onClick={() => setAction(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Leave a Review ⭐</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              Rate your experience with {action.appointment.provider?.name || "this provider"}
            </p>
            <div className="mb-4">
              <label className="form-label">Rating</label>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} onClick={() => setReviewData((p) => ({ ...p, rating: star }))} className={`star ${star <= reviewData.rating ? "filled" : "empty"}`} style={{ fontSize: '2rem', cursor: 'pointer' }}>
                    ★
                  </span>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Comment</label>
              <textarea className="form-input" rows={4} placeholder="Share your experience..." value={reviewData.comment} onChange={(e) => setReviewData((p) => ({ ...p, comment: e.target.value }))} />
            </div>
            <div className="modal-actions">
              <button onClick={() => setAction(null)} className="btn btn-secondary" disabled={actionLoading}>Cancel</button>
              <button onClick={handleReview} className="btn btn-primary" disabled={actionLoading}>
                {actionLoading ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {action?.type === "reschedule" && (
        <div className="modal-overlay" onClick={() => setAction(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <h3 className="modal-title">Reschedule Appointment 📅</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Select a new time slot:</p>
            {slots.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                {slots.map((slot) => (
                  <button key={slot._id} onClick={() => setRescheduleSlot(slot._id)} className={`card p-3 text-center cursor-pointer transition-all ${rescheduleSlot === slot._id ? 'glow-border' : ''}`}>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{new Date(slot.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                    <p className="text-xs" style={{ color: 'var(--primary)' }}>{slot.startTime} - {slot.endTime}</p>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm py-8" style={{ color: 'var(--text-muted)' }}>No available slots for rescheduling</p>
            )}
            <div className="modal-actions">
              <button onClick={() => { setAction(null); setRescheduleSlot(null); }} className="btn btn-secondary" disabled={actionLoading}>Cancel</button>
              <button onClick={handleReschedule} className="btn btn-primary" disabled={actionLoading || !rescheduleSlot}>
                {actionLoading ? "Rescheduling..." : "Reschedule"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default MyAppointments;
