import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { customerService } from "../../services/apiService";
import toast from "react-hot-toast";

const ViewSlots = () => {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => { loadSlots(); }, [providerId]);

  const loadSlots = async () => {
    setLoading(true);
    try {
      const res = await customerService.getProviderSlots(providerId);
      if (res.success) setSlots(res.data || []);
    } catch { toast.error("Failed to load slots"); }
    finally { setLoading(false); }
  };

  const handleBook = async (slot) => {
    setBookingLoading(true);
    try {
      const res = await customerService.bookAppointment({ slotId: slot._id });
      if (res.success) {
        toast.success("Appointment booked successfully! 🎉");
        setBooking(null);
        loadSlots();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking failed");
    } finally {
      setBookingLoading(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });

  // Group slots by date
  const grouped = slots.reduce((acc, slot) => {
    const dateKey = new Date(slot.date).toISOString().split("T")[0];
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(slot);
    return acc;
  }, {});

  return (
    <DashboardLayout theme="customer">
      <div className="page-header">
        <button onClick={() => navigate(-1)} className="text-sm mb-3 flex items-center gap-1" style={{ color: 'var(--primary)' }}>
          ← Back to Providers
        </button>
        <h1 style={{ color: 'var(--text-primary)' }}>
          Available <span className="text-gradient">Slots</span> 📅
        </h1>
        <p>Select a time slot to book your appointment</p>
      </div>

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <div className="skeleton h-6 w-40 mb-3"></div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((j) => <div key={j} className="skeleton h-20"></div>)}
              </div>
            </div>
          ))}
        </div>
      ) : Object.keys(grouped).length > 0 ? (
        <div className="space-y-8">
          {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([dateKey, dateSlots]) => (
            <div key={dateKey} className="animate-fade-in-up">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9' }}>📅</span>
                {formatDate(dateKey)}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {dateSlots.sort((a, b) => a.startTime.localeCompare(b.startTime)).map((slot) => (
                  <button
                    key={slot._id}
                    onClick={() => setBooking(slot)}
                    className="card card-hover p-4 text-center cursor-pointer transition-all duration-200"
                    style={{ border: '1px solid var(--border-color)' }}
                  >
                    <p className="font-bold text-lg mb-1" style={{ color: 'var(--primary)' }}>
                      {slot.startTime}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      to {slot.endTime}
                    </p>
                    <span className="badge badge-success mt-2">Available</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state py-16">
          <div className="empty-state-icon">📅</div>
          <p className="empty-state-title">No Available Slots</p>
          <p className="empty-state-text">This provider has no available time slots at the moment. Check back later.</p>
          <button onClick={() => navigate(-1)} className="btn btn-primary btn-sm mt-4">Browse Other Providers</button>
        </div>
      )}

      {/* Booking Confirmation Modal */}
      {booking && (
        <div className="modal-overlay" onClick={() => setBooking(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl" style={{ background: 'rgba(14, 165, 233, 0.1)' }}>📅</div>
              <h3 className="modal-title">Confirm Booking</h3>
              <div className="glass-card p-4 mb-6 text-left">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-secondary)' }}>Date:</span>
                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{formatDate(booking.date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-secondary)' }}>Time:</span>
                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{booking.startTime} - {booking.endTime}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                You'll receive an email confirmation after booking.
              </p>
              <div className="modal-actions justify-center">
                <button onClick={() => setBooking(null)} className="btn btn-secondary" disabled={bookingLoading}>Cancel</button>
                <button onClick={() => handleBook(booking)} className="btn btn-primary" disabled={bookingLoading}>
                  {bookingLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="spinner spinner-sm" style={{ borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }}></span>
                      Booking...
                    </span>
                  ) : "Confirm Booking"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ViewSlots;
