import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, X, MessageSquare, Star, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import TopNavigation from "../../components/customer/TopNavigation";
import Footer from "../../components/common/Footer";

const MyAppointments = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  // Load appointments from backend
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        // TODO: Replace with backend API call when ready
        // const response = await customerService.getMyAppointments();
        // setAppointments(response.data.appointments || []);

        // Fallback: Get from localStorage
        const savedAppointments = JSON.parse(localStorage.getItem("appointments") || "[]");
        setAppointments(savedAppointments);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load appointments:", error);
        toast.error("Failed to load appointments");
        setAppointments([]);
        setLoading(false);
      }
    };

    loadAppointments();
  }, []);

  const getFilteredAppointments = () => {
    return appointments.filter((apt) => apt.status === activeTab);
  };

  const handleReschedule = (appointment) => {
    navigate(`/view-slots/${appointment.providerId}`, {
      state: { rescheduleAppointmentId: appointment.id, originalAppointment: appointment }
    });
    toast.info("📅 Select a new available time slot from your provider's vacancy");
  };

  const handleCancelClick = (appointment) => {
    setSelectedAppointment(appointment);
    setCancelReason("");
    setShowCancelModal(true);
  };

  const handleCancelConfirm = async () => {
    if (!cancelReason.trim()) {
      toast.error("Please enter a cancellation reason");
      return;
    }

    try {
      // Call backend API to cancel appointment
      // await customerService.cancelAppointment(selectedAppointment.id, {
      //   reason: cancelReason,
      // });

      // Update local state
      const updated = appointments.map((apt) =>
        apt.id === selectedAppointment.id
          ? {
              ...apt,
              status: "cancelled",
              cancelledBy: "customer",
              cancelReason: cancelReason,
              cancelledAt: new Date().toISOString(),
            }
          : apt
      );
      setAppointments(updated);

      // Backend will handle provider notification automatically
      toast.success(`✅ Appointment cancelled. Reason recorded: "${cancelReason}"`);
      setShowCancelModal(false);
      setSelectedAppointment(null);
      setCancelReason("");
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast.error(error.message || "Failed to cancel appointment");
    }
  };

  const handleConfirmAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowConfirmModal(true);
  };

  const handleConfirmationSubmit = async () => {
    try {
      // Call backend API to confirm appointment
      // await customerService.confirmAppointment(selectedAppointment.id);

      const updated = appointments.map((apt) =>
        apt.id === selectedAppointment.id
          ? { ...apt, confirmed: true, confirmedAt: new Date().toISOString() }
          : apt
      );
      setAppointments(updated);

      // Backend will send notification to customer and provider
      toast.success("✅ Appointment confirmed! Notification sent to provider.");
      setShowConfirmModal(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error("Error confirming appointment:", error);
      toast.error(error.message || "Failed to confirm appointment");
    }
  };

  const handleReviewClick = (appointment) => {
    setSelectedAppointment(appointment);
    setRating(appointment.rating || 0);
    setReviewText(appointment.review || "");
    setShowReviewModal(true);
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    try {
      // Call backend API to submit review
      // await customerService.submitAppointmentReview(selectedAppointment.id, {
      //   rating,
      //   review: reviewText,
      // });

      const updated = appointments.map((apt) =>
        apt.id === selectedAppointment.id ? { ...apt, rating, review: reviewText } : apt
      );
      setAppointments(updated);

      // Backend will handle provider notification automatically
      toast.success("Review submitted! Thank you! ⭐");
      setShowReviewModal(false);
      setRating(0);
      setReviewText("");
      setSelectedAppointment(null);
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error(error.message || "Failed to submit review");
    }
  };

  const filteredAppointments = getFilteredAppointments();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <TopNavigation />

      {/* Main Content */}
      <main className="flex-1 w-full">
        <div className="max-w-4xl mx-auto w-full px-4 md:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Appointments</h1>
            <p className="text-gray-600">Manage and track your appointments</p>
          </div>

          {/* Tabs */}
          <div className="flex space-x-2 mb-8 bg-white rounded-lg shadow-md p-1">
            {[
              { id: "upcoming", label: "Upcoming", count: appointments.filter((a) => a.status === "upcoming").length },
              { id: "completed", label: "Completed", count: appointments.filter((a) => a.status === "completed").length },
              { id: "cancelled", label: "Cancelled", count: appointments.filter((a) => a.status === "cancelled").length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab.label}
                <span className="ml-2 text-sm px-2 py-1 bg-opacity-30 rounded-full">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Appointments List */}
          <div className="space-y-4">
            {loading ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-lg text-gray-600 font-medium">Loading appointments...</p>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <AlertCircle size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-lg text-gray-600 font-medium">No {activeTab} appointments</p>
                <p className="text-gray-500 mt-2">
                  {activeTab === "upcoming"
                    ? "Book an appointment to get started"
                    : `You have no ${activeTab} appointments yet`}
                </p>
                {activeTab === "upcoming" && (
                  <button
                    onClick={() => navigate("/browse-providers")}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                  >
                    Browse Providers
                  </button>
                )}
              </div>
            ) : (
              filteredAppointments.map((appointment) => {
                // FIXED: Extract provider info from appointment object instead of undefined mockProviders
                const providerEmoji = appointment.providerEmoji || "📋";
                const providerName = appointment.providerName || "Unknown Provider";
                
                const appointmentDate = new Date(appointment.date);
                const isToday =
                  appointmentDate.toDateString() === new Date().toDateString();
                const isPast = appointmentDate < new Date();

                return (
                  <div
                    key={appointment.id}
                    className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden border-l-4 ${
                      appointment.status === "upcoming"
                        ? "border-blue-500"
                        : appointment.status === "completed"
                          ? "border-green-500"
                          : "border-red-500"
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="text-4xl">{providerEmoji}</div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">
                              {providerName}
                            </h3>
                            <p className="text-sm text-gray-600">{appointment.reason || "Appointment"}</p>
                          </div>
                        </div>
                        {isToday && appointment.status === "upcoming" && (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                            Today
                          </span>
                        )}
                      </div>

                      {/* Appointment Details */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-xs text-gray-600 font-medium">Date</p>
                          <p className="font-semibold text-gray-900">
                            {appointmentDate.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-medium">Time</p>
                          <p className="font-semibold text-gray-900 flex items-center">
                            <Clock size={14} className="mr-1" />
                            {appointment.time}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-medium">Status</p>
                          <p
                            className={`font-semibold capitalize ${
                              appointment.status === "upcoming"
                                ? "text-blue-600"
                                : appointment.status === "completed"
                                  ? "text-green-600"
                                  : "text-red-600"
                            }`}
                          >
                            {appointment.status}
                          </p>
                        </div>
                      </div>

                      {/* Review Section (if completed) */}
                      {appointment.status === "completed" && appointment.rating && (
                        <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center space-x-2 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={16}
                                className={
                                  i < appointment.rating
                                    ? "text-yellow-500 fill-yellow-500"
                                    : "text-gray-300"
                                }
                              />
                            ))}
                            <span className="font-semibold text-green-900">
                              {appointment.rating.toFixed(1)}
                            </span>
                          </div>
                          {appointment.review && (
                            <p className="text-sm text-green-800">"{appointment.review}"</p>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3">
                        {appointment.status === "upcoming" && (
                          <>
                            {!appointment.confirmed ? (
                              <button
                                onClick={() => handleConfirmAppointment(appointment)}
                                className="px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 font-semibold transition-colors flex items-center"
                              >
                                ✓ Confirm Appointment
                              </button>
                            ) : (
                              <div className="px-4 py-2 bg-green-50 text-green-700 rounded-lg border-2 border-green-300 font-semibold flex items-center">
                                ✓ Confirmed
                              </div>
                            )}
                            <button
                              onClick={() => handleReschedule(appointment)}
                              className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 font-semibold transition-colors"
                            >
                              📅 Reschedule
                            </button>
                            <button
                              onClick={() => handleCancelClick(appointment)}
                              className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 font-semibold transition-colors flex items-center"
                            >
                              <X size={16} className="mr-1" />
                              Cancel
                            </button>
                          </>
                        )}
                        {appointment.status === "completed" && !appointment.rating && (
                          <button
                            onClick={() => handleReviewClick(appointment)}
                            className="px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 font-semibold transition-colors flex items-center"
                          >
                            <MessageSquare size={16} className="mr-1" />
                            Leave Review
                          </button>
                        )}
                        {appointment.status === "completed" && appointment.rating && (
                          <button
                            onClick={() => handleReviewClick(appointment)}
                            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 font-semibold transition-colors flex items-center"
                          >
                            <Star size={16} className="mr-1" />
                            Edit Review
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Review Modal */}
        {showReviewModal && selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-8 max-w-md mx-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Leave a Review</h3>
              <p className="text-gray-600 mb-6">{selectedAppointment.providerName}</p>

              {/* Rating */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Rating
                </label>
                <div className="flex space-x-2 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="transition-transform"
                    >
                      <Star
                        size={32}
                        className={
                          star <= rating
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-gray-300"
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Text */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Your Review (Optional)
                </label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience..."
                  maxLength={200}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <p className="text-xs text-gray-500 mt-2">{reviewText.length}/200</p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReview}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cancellation Reason Modal */}
        {showCancelModal && selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Cancel Appointment</h3>
              <p className="text-gray-600 mb-6">
                {selectedAppointment.providerName} - {selectedAppointment.date} at {selectedAppointment.time}
              </p>

              {/* Cancellation Reason - MANDATORY */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Reason for Cancellation <span className="text-red-600">*</span> (Required)
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Please provide a reason for cancellation..."
                  maxLength={300}
                  rows={4}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 resize-none"
                />
                <p className="text-xs text-gray-500 mt-2">{cancelReason.length}/300</p>
                {!cancelReason.trim() && (
                  <p className="text-xs text-red-600 mt-1">✓ This field is mandatory</p>
                )}
              </div>

              {/* Important Notice */}
              <div className="mb-6 p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-700">
                  <strong>⚠️ Note:</strong> Your cancellation reason will be shared with the provider. This helps them understand your needs better.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setSelectedAppointment(null);
                    setCancelReason("");
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 font-semibold"
                >
                  Keep Appointment
                </button>
                <button
                  onClick={handleCancelConfirm}
                  disabled={!cancelReason.trim()}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                    cancelReason.trim()
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Cancel Appointment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Appointment Confirmation Modal */}
        {showConfirmModal && selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">✓ Confirm Appointment</h3>
              <p className="text-gray-600 mb-6">
                Please confirm your appointment details:
              </p>

              {/* Appointment Details */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-3">
                <div>
                  <p className="text-xs text-gray-600 font-medium">Provider</p>
                  <p className="font-semibold text-gray-900">{selectedAppointment.providerName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Service</p>
                  <p className="font-semibold text-gray-900">{selectedAppointment.reason}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Date</p>
                    <p className="font-semibold text-gray-900">{selectedAppointment.date}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Time</p>
                    <p className="font-semibold text-gray-900">{selectedAppointment.time}</p>
                  </div>
                </div>
              </div>

              {/* Confirmation Notice */}
              <div className="mb-6 p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-700">
                  <strong>✓ Confirmed appointments:</strong><br/>
                  • Send notification to you<br/>
                  • Send notification to provider<br/>
                  • Lock the provider's time slot
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setSelectedAppointment(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmationSubmit}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center justify-center"
                >
                  ✓ Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MyAppointments;
