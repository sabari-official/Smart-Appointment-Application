import React, { useState } from "react";
import { CheckCircle, Clock, X, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import RescheduleModal from "./RescheduleModal";
import FeedbackForm from "./FeedbackForm";

const AppointmentActions = ({ 
  appointmentId, 
  appointmentData, 
  onComplete, 
  onReschedule, 
  onCancel,
  isLoading = false 
}) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showConfirmAction, setShowConfirmAction] = useState(null); // "complete", "reschedule", "cancel"

  /**
   * MARK AS COMPLETE FLOW:
   * 1. Provider clicks "Mark Complete"
   * 2. Confirmation dialog shows
   * 3. Backend:
   *    - Updates appointment status to "completed"
   *    - Sets completedAt timestamp
   *    - Creates notification for customer
   *    - Triggers feedback request (front-end shows feedback form)
   * 4. Customer receives notification:
   *    - "Your appointment is complete"
   *    - "Please share your feedback"
   *    - Shows feedback form
   * 5. Provider dashboard shows:
   *    - Customer feedback/rating
   *    - Appointment marked complete
   */
  const handleMarkComplete = async () => {
    try {
      // Backend API call
      await onComplete(appointmentId, appointmentData);
      
      // Create notification via backend API
      // const notification = {
      //   type: "appointment_completed",
      //   appointmentId,
      //   customerId: appointmentData.customerId,
      //   title: "Appointment Completed",
      //   message: `Your appointment with ${appointmentData.providerName} on ${appointmentData.date} at ${appointmentData.time} is marked as complete.`,
      // };
      // await notificationService.createNotification(notification);

      toast.success("✅ Appointment marked as complete! Customer notified.");
      setShowConfirmAction(null);
    } catch (error) {
      toast.error(error.message || "Failed to mark appointment as complete");
    }
  };

  /**
   * RESCHEDULE FLOW:
   * 1. Provider clicks "Mark Reschedule"
   * 2. Modal shows available time slots
   * 3. Provider selects new time
   * 4. System checks:
   *    - If customer has conflicting appointment
   *    - Shows available slots for this provider
   * 5. Customer receives notification:
   *    - "Appointment rescheduled"
   *    - "Please confirm new time"
   *    - Shows confirmation buttons
   * 6. Customer confirms or chooses different time
   * 7. Both parties notified of final time
   */
  const handleReschedule = async (newDate, newTime) => {
    try {
      await onReschedule(appointmentId, {
        ...appointmentData,
        newDate,
        newTime,
      });

      // Create notification via backend API
      // const notification = {
      //   type: "appointment_rescheduled",
      //   appointmentId,
      //   customerId: appointmentData.customerId,
      //   title: "Appointment Rescheduled",
      //   message: `Your appointment with ${appointmentData.providerName} has been rescheduled to ${newDate} at ${newTime}.`,
      // };
      // await notificationService.createNotification(notification);

      toast.success("📅 Appointment rescheduled! Customer confirmation required.");
      setShowConfirmAction(null);
    } catch (error) {
      toast.error(error.message || "Failed to reschedule appointment");
    }
  };

  /**
   * CANCEL FLOW:
   * 1. Provider clicks "Cancel"
   * 2. Modal asks for reason
   * 3. Backend:
   *    - Updates status to "cancelled"
   *    - Stores cancellation reason
   *    - Creates notification for customer
   * 4. Customer receives notification
   * 5. Provider dashboard updated
   * 6. Appointment moves to cancelled list
   */
  const handleCancelAppointment = async () => {
    if (!cancelReason.trim()) {
      toast.error("Please provide a cancellation reason");
      return;
    }

    try {
      await onCancel(appointmentId, {
        ...appointmentData,
        cancelReason: cancelReason.trim(),
      });

      // Create notification via backend API
      // const notification = {
      //   type: "appointment_cancelled",
      //   appointmentId,
      //   customerId: appointmentData.customerId,
      //   title: "Appointment Cancelled",
      //   message: `Your appointment with ${appointmentData.providerName} on ${appointmentData.date} at ${appointmentData.time} has been cancelled.`,
      //   reason: cancelReason,
      // };
      // await notificationService.createNotification(notification);

      toast.success("❌ Appointment cancelled. Customer notified.");
      setShowCancelModal(false);
      setCancelReason("");
      setShowConfirmAction(null);
    } catch (error) {
      toast.error(error.message || "Failed to cancel appointment");
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Complete Button */}
        <button
          onClick={() => setShowConfirmAction("complete")}
          disabled={isLoading || appointmentData.status === "completed"}
          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition ${
            appointmentData.status === "completed"
              ? "bg-green-100 text-green-700 cursor-not-allowed"
              : "bg-green-100 text-green-700 hover:bg-green-200"
          }`}
        >
          <CheckCircle size={18} />
          Mark Complete
        </button>

        {/* Reschedule Button */}
        <button
          onClick={() => setShowConfirmAction("reschedule")}
          disabled={isLoading || appointmentData.status === "completed" || appointmentData.status === "cancelled"}
          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition ${
            appointmentData.status === "completed" || appointmentData.status === "cancelled"
              ? "bg-blue-100 text-blue-700 cursor-not-allowed opacity-50"
              : "bg-blue-100 text-blue-700 hover:bg-blue-200"
          }`}
        >
          <Clock size={18} />
          Reschedule
        </button>

        {/* Cancel Button */}
        <button
          onClick={() => setShowConfirmAction("cancel")}
          disabled={isLoading || appointmentData.status === "completed" || appointmentData.status === "cancelled"}
          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition ${
            appointmentData.status === "completed" || appointmentData.status === "cancelled"
              ? "bg-red-100 text-red-700 cursor-not-allowed opacity-50"
              : "bg-red-100 text-red-700 hover:bg-red-200"
          }`}
        >
          <X size={18} />
          Cancel
        </button>
      </div>

      {/* Confirmation Dialogs */}

      {/* Mark Complete Confirmation */}
      {showConfirmAction === "complete" && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-gray-700 mb-4">
            Are you sure you want to mark this appointment as complete? The customer will receive a notification and be asked to provide feedback.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleMarkComplete}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition disabled:bg-gray-300"
            >
              {isLoading ? "Processing..." : "Confirm Complete"}
            </button>
            <button
              onClick={() => setShowConfirmAction(null)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      <RescheduleModal
        isOpen={showConfirmAction === "reschedule"}
        onClose={() => setShowConfirmAction(null)}
        appointmentData={appointmentData}
        providerId={appointmentData.providerId}
        customerName={appointmentData.customerName}
        onConfirm={async (rescheduleData) => {
          await handleReschedule(rescheduleData.newDate, rescheduleData.newTime);
          setShowConfirmAction(null);
        }}
        isLoading={isLoading}
      />

      {/* Cancel Confirmation */}
      {showConfirmAction === "cancel" && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-gray-700 mb-4">
            Provide a reason for cancellation. This will be sent to the customer.
          </p>
          <div className="space-y-3">
            {/* Cancellation Reason */}
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter cancellation reason (e.g., Emergency, Weather conditions, System Issue)"
              maxLength={300}
              className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none ${
                cancelReason ? "border-red-500" : "border-gray-300 focus:border-red-500"
              }`}
              rows={3}
            />
            <p className="text-xs text-gray-600">
              {cancelReason.length}/300 characters
            </p>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCancelAppointment}
                disabled={isLoading || !cancelReason.trim()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white rounded-lg font-semibold transition"
              >
                {isLoading ? "Cancelling..." : "Confirm Cancel"}
              </button>
              <button
                onClick={() => {
                  setShowConfirmAction(null);
                  setCancelReason("");
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Badge */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-600">Status:</span>
        <span
          className={`px-3 py-1 rounded-full font-semibold ${
            appointmentData.status === "completed"
              ? "bg-green-100 text-green-700"
              : appointmentData.status === "cancelled"
              ? "bg-red-100 text-red-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {appointmentData.status === "completed"
            ? "✓ Completed"
            : appointmentData.status === "cancelled"
            ? "✗ Cancelled"
            : "⏳ Pending"}
        </span>
      </div>
    </div>
  );
};

export default AppointmentActions;
