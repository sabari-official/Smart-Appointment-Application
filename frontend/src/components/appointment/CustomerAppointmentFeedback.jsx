import React, { useState } from "react";
import { X, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import FeedbackForm from "./FeedbackForm";

const CustomerAppointmentFeedback = ({
  notification,
  onClose,
  onFeedbackSubmitted,
}) => {
  /**
   * CUSTOMER FEEDBACK DISPLAY:
   * 1. Customer receives notification with actionType: "feedback"
   * 2. Displays modal/card with FeedbackForm component
   * 3. Customer rates (1-5 stars) and writes review
   * 4. After submission:
   *    - Notification marked as actioned
   *    - Feedback stored and linked to provider
   *    - Provider dashboard updated with new review
   *    - Customer sees confirmation
   * 5. Skip button allows postponing feedback
   */

  const [isSubmitted, setIsSubmitted] = useState(false);

  const appointmentData = {
    appointmentId: notification.details.appointmentId,
    providerName: notification.details.providerName,
    providerEmoji: notification.details.providerEmoji,
    date: notification.details.date,
    time: notification.details.time,
    providerId: notification.details.providerId || "unknown",
    customerName:
      localStorage.getItem("currentUser") || "Customer",
  };

  const handleFeedbackSubmit = async (feedbackData) => {
    try {
      // Mark notification as acted upon
      let tasks = JSON.parse(localStorage.getItem("customerNotifications") || "[]");
      const taskIndex = tasks.findIndex(
        (t) =>
          t.id === notification.id ||
          (t.details && t.details.appointmentId === notification.details.appointmentId)
      );

      if (taskIndex !== -1) {
        tasks[taskIndex].read = true;
        tasks[taskIndex].actionRequired = false;
        localStorage.setItem("customerNotifications", JSON.stringify(tasks));
      }

      setIsSubmitted(true);

      // Call the callback
      onFeedbackSubmitted && onFeedbackSubmitted(feedbackData);

      // Auto-close after 3 seconds
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      toast.error(error.message || "Failed to process feedback");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between border-b border-blue-400 z-10">
          <h2 className="text-xl font-bold text-white">Share Your Feedback</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-500 rounded-lg p-2 transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {isSubmitted ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-2xl font-bold text-green-700 mb-2">
                Thank You!
              </h3>
              <p className="text-gray-600 mb-4">
                Your feedback has been submitted to{" "}
                <span className="font-semibold">
                  {appointmentData.providerName}
                </span>
              </p>
              <p className="text-sm text-gray-500">
                Redirecting in a moment...
              </p>
            </div>
          ) : (
            <FeedbackForm
              appointmentId={appointmentData.appointmentId}
              appointmentData={appointmentData}
              onSubmit={handleFeedbackSubmit}
            />
          )}

          {!isSubmitted && (
            <div className="mt-6 text-center">
              <button
                onClick={onClose}
                className="text-gray-600 hover:text-gray-700 font-semibold text-sm"
              >
                I'll leave feedback later
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerAppointmentFeedback;
