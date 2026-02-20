import React, { useState, useMemo } from "react";
import { Clock, X, AlertCircle, CheckCircle, Calendar } from "lucide-react";
import toast from "react-hot-toast";

const CustomerRescheduleConfirmation = ({
  notification,
  onClose,
  onConfirm,
}) => {
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [confirmChoice, setConfirmChoice] = useState("suggested"); // "suggested" or "choose"

  /**
   * CUSTOMER RESCHEDULE CONFIRMATION:
   * 1. Customer receives notification:
   *    type: "appointment_rescheduled", actionType: "confirm_reschedule"
   * 2. Shows:
   *    - Old time vs New suggested time
   *    - Option to confirm new time
   *    - Option to browse available slots
   *    - "Balance times" remaining to choose from
   * 3. Customer can:
   *    - Confirm the suggested time
   *    - Browse available slots and choose alternative
   *    - Reject and suggest alternative
   * 4. Provider gets notification of customer's choice
   * 5. Both parties see final confirmed time
   */

  const appointmentDetails = notification.details;

  // Get appointments from backend API with localStorage fallback
  const [appointments, setAppointments] = React.useState(() => {
    return JSON.parse(localStorage.getItem("appointments") || "[]");
  });

  React.useEffect(() => {
    // Try to load from backend
    const fetchAppointments = async () => {
      try {
        const response = await fetch('/api/customer/appointments');
        if (response.ok) {
          const data = await response.json();
          setAppointments(data.appointments || []);
        }
      } catch (error) {
        console.error("Error loading appointments:", error);
      }
    };
    fetchAppointments();
  }, []);

  // Generate available time slots
  const availableSlots = useMemo(() => {
    const slots = [];
    const today = new Date();

    // Generate 30 days of slots
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);

      const dateString = date.toISOString().split("T")[0];
      const timeSlotsByHour = [];

      // Generate slots: 9 AM to 5 PM, every 30 minutes
      for (let hour = 9; hour < 17; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const timeString = `${String(hour).padStart(2, "0")}:${String(
            minute
          ).padStart(2, "0")}`;

          // Check if this time is already booked
          const isBooked = appointments.some(
            (apt) =>
              apt.providerId === appointmentDetails.providerId &&
              apt.date === dateString &&
              apt.time === timeString &&
              apt.status !== "cancelled"
          );

          timeSlotsByHour.push({
            date: dateString,
            time: timeString,
            available: !isBooked,
          });
        }
      }

      slots.push({
        date: dateString,
        dayOfWeek: date.toLocaleDateString("en-US", { weekday: "short" }),
        dayNumber: date.getDate(),
        month: date.toLocaleDateString("en-US", { month: "short" }),
        slots: timeSlotsByHour,
      });
    }

    return slots;
  }, [appointments, appointmentDetails]);

  const availableTimesForDate = useMemo(() => {
    if (!selectedDate) return [];
    const dateObj = availableSlots.find((d) => d.date === selectedDate);
    return dateObj ? dateObj.slots.filter((slot) => slot.available) : [];
  }, [selectedDate, availableSlots]);

  const totalAvailableSlots = useMemo(() => {
    return availableSlots.reduce(
      (sum, day) => sum + day.slots.filter((s) => s.available).length,
      0
    );
  }, [availableSlots]);

  const handleConfirm = async () => {
    try {
      let confirmData;

      if (confirmChoice === "suggested") {
        confirmData = {
          action: "confirmed",
          newDate: appointmentDetails.newDate,
          newTime: appointmentDetails.newTime,
          remainingSlots: totalAvailableSlots - 1,
        };
      } else {
        if (!selectedDate || !selectedTime) {
          toast.error("Please select a date and time");
          return;
        }

        confirmData = {
          action: "chose_alternative",
          newDate: selectedDate,
          newTime: selectedTime,
          remainingSlots: totalAvailableSlots - 1,
          reason: "Customer selected alternative time",
        };
      }

      // Mark notification as read and handled
      let notifications = JSON.parse(
        localStorage.getItem("customerNotifications") || "[]"
      );
      const notificationIndex = notifications.findIndex(
        (n) => n.id === notification.id
      );

      if (notificationIndex !== -1) {
        notifications[notificationIndex].read = true;
        notifications[notificationIndex].actionRequired = false;
        localStorage.setItem(
          "customerNotifications",
          JSON.stringify(notifications)
        );
      }

      // Create callback notification for provider
      const providerNotifications = JSON.parse(
        localStorage.getItem("providerNotifications") || "[]"
      );

      const providerNotification = {
        id: Date.now(),
        type: "reschedule_confirmed",
        title: 'Appointment Reschedule ' + (confirmChoice === "suggested" ? "Confirmed" : "Changed"),
        message: `Customer ${confirmChoice === "suggested" ? "confirmed" : "chose alternative for"} appointment on ${confirmData.newDate} at ${confirmData.newTime}`,
        details: confirmData,
        timestamp: new Date().toISOString(),
        read: false,
        icon: "✅",
        priority: "high",
      };

      providerNotifications.unshift(providerNotification);
      localStorage.setItem(
        "providerNotifications",
        JSON.stringify(providerNotifications)
      );

      toast.success(
        confirmChoice === "suggested"
          ? "✅ Appointment confirmed!"
          : "✅ Alternative time selected!"
      );

      onConfirm && onConfirm(confirmData);
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to confirm reschedule");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between border-b border-blue-400 z-10">
          <div className="flex items-center gap-3">
            <Calendar className="text-white" size={24} />
            <h2 className="text-xl font-bold text-white">
              Appointment Rescheduled
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-500 rounded-lg p-2 transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Time Comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Old Time */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-xs font-semibold text-gray-600 uppercase mb-2">
                Previous Time
              </p>
              <p className="text-lg font-bold text-gray-900">
                {appointmentDetails.oldDate}
              </p>
              <p className="text-lg font-bold text-gray-900">
                {appointmentDetails.oldTime}
              </p>
            </div>

            {/* New Time - Suggested */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-xs font-semibold text-green-600 uppercase mb-2">
                Suggested New Time
              </p>
              <p className="text-lg font-bold text-gray-900">
                {appointmentDetails.newDate}
              </p>
              <p className="text-lg font-bold text-gray-900">
                {appointmentDetails.newTime}
              </p>
            </div>
          </div>

          {/* Provider Info */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Provider:</span>{" "}
              {appointmentDetails.providerName}{" "}
              {appointmentDetails.providerEmoji}
            </p>
          </div>

          {/* Choice Selection */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700">
              What would you like to do?
            </label>

            {/* Option 1: Confirm Suggested */}
            <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition"
              style={{
                borderColor: confirmChoice === "suggested" ? "#3b82f6" : "#e5e7eb",
                backgroundColor: confirmChoice === "suggested" ? "#eff6ff" : "#f9fafb",
              }}
            >
              <input
                type="radio"
                name="choice"
                value="suggested"
                checked={confirmChoice === "suggested"}
                onChange={(e) => setConfirmChoice(e.target.value)}
                className="mt-1 w-4 h-4"
              />
              <div className="flex-1">
                <p className="font-semibold text-gray-900">
                  ✓ Confirm Suggested Time
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Accept the new appointment time suggested by the provider
                </p>
              </div>
            </label>

            {/* Option 2: Choose Alternative */}
            <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition"
              style={{
                borderColor: confirmChoice === "choose" ? "#3b82f6" : "#e5e7eb",
                backgroundColor: confirmChoice === "choose" ? "#eff6ff" : "#f9fafb",
              }}
            >
              <input
                type="radio"
                name="choice"
                value="choose"
                checked={confirmChoice === "choose"}
                onChange={(e) => setConfirmChoice(e.target.value)}
                className="mt-1 w-4 h-4"
              />
              <div className="flex-1">
                <p className="font-semibold text-gray-900">
                  📅 Choose Alternative Time
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Browse available slots and select a different time
                </p>
              </div>
            </label>
          </div>

          {/* Alternative Time Selection */}
          {confirmChoice === "choose" && (
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
              {/* Date Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Date
                </label>
                <div className="grid grid-cols-7 gap-2 max-h-48 overflow-y-auto">
                  {availableSlots.map((day) => {
                    const availableCount = day.slots.filter(
                      (s) => s.available
                    ).length;
                    return (
                      <button
                        key={day.date}
                        onClick={() => setSelectedDate(day.date)}
                        disabled={availableCount === 0}
                        className={`p-2 rounded-lg border transition text-xs font-semibold ${
                          selectedDate === day.date
                            ? "border-blue-500 bg-blue-100 text-blue-700"
                            : availableCount === 0
                            ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <div>{day.dayOfWeek}</div>
                        <div className="font-bold">{day.dayNumber}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Time
                  </label>
                  <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                    {availableTimesForDate.map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => setSelectedTime(slot.time)}
                        className={`p-2 rounded-lg border transition font-semibold text-sm ${
                          selectedTime === slot.time
                            ? "border-blue-500 bg-blue-100 text-blue-700"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Balance Times */}
              {selectedDate && selectedTime && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-xs text-green-700">
                    <span className="font-semibold">{totalAvailableSlots - 1}</span>{" "}
                    balance time
                    {totalAvailableSlots - 1 !== 1 ? "s" : ""} remaining
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Info Message */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
            <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              Once confirmed, the provider will be notified of your decision. You
              will receive a final confirmation once both parties agree on the
              appointment time.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={
                confirmChoice === "choose" && (!selectedDate || !selectedTime)
              }
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg transition font-semibold flex items-center justify-center gap-2"
            >
              <CheckCircle size={18} />
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerRescheduleConfirmation;
