import React, { useState, useMemo } from "react";
import { Clock, X, AlertCircle, Calendar } from "lucide-react";
import toast from "react-hot-toast";

const RescheduleModal = ({
  isOpen,
  onClose,
  appointmentData,
  providerId,
  customerName,
  onConfirm,
  isLoading = false,
}) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  /**
   * RESCHEDULE SYSTEM:
   * 1. Provider clicks "Reschedule" button
   * 2. Modal shows available time slots
   * 3. Filters out:
   *    - Past dates/times
   *    - Dates when provider is unavailable
   *    - Times when provider has other appointments
   *    - Times when THIS customer has other appointments
   * 4. Shows "balance times" (remaining available slots)
   * 5. Customer gets notification with action buttons
   * 6. Customer confirms new time or suggests alternative
   * 7. Appointment status becomes "pending_confirmation"
   * 8. Notification counts how many slots customer passed
   */

  // Get available slots from backend API with localStorage fallback
  const [appointments, setAppointments] = React.useState(() => {
    // Load from localStorage for rescheduling display
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

  // Generate available time slots (next 30 days)
  const timeSlots = useMemo(() => {
    const slots = [];
    const today = new Date();
    const appointmentDate = new Date(appointmentData.date);

    // Generate 30 days of slots
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);

      const dateString = date.toISOString().split("T")[0];

      // Skip the original appointment date initially
      const timeSlotsByHour = [];

      // Generate slots: 9 AM to 5 PM, every 30 minutes
      for (let hour = 9; hour < 17; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const timeString = `${String(hour).padStart(2, "0")}:${String(
            minute
          ).padStart(2, "0")}`;

          // Check if this time is already booked for this provider
          const isProviderBooked = appointments.some(
            (apt) =>
              apt.providerId === providerId &&
              apt.date === dateString &&
              apt.time === timeString &&
              apt.status !== "cancelled"
          );

          // Check if customer has appointment at this time
          const isCustomerBooked = appointments.some(
            (apt) =>
              apt.customerName === customerName &&
              apt.date === dateString &&
              apt.time === timeString &&
              apt.appointmentId !== appointmentData.appointmentId &&
              apt.status !== "cancelled"
          );

          const isAvailable = !isProviderBooked && !isCustomerBooked;

          timeSlotsByHour.push({
            date: dateString,
            time: timeString,
            available: isAvailable,
            booked: isProviderBooked || isCustomerBooked,
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
  }, [appointments, providerId, customerName, appointmentData]);

  // Get available times for selected date
  const availableTimesForDate = useMemo(() => {
    if (!selectedDate) return [];

    const dateObj = timeSlots.find((d) => d.date === selectedDate);
    return dateObj
      ? dateObj.slots.filter((slot) => slot.available)
      : [];
  }, [selectedDate, timeSlots]);

  // Count total available slots
  const totalAvailableSlots = useMemo(() => {
    return timeSlots.reduce(
      (sum, day) => sum + day.slots.filter((s) => s.available).length,
      0
    );
  }, [timeSlots]);

  // Count slots remaining after selection
  const remainingSlots = useMemo(() => {
    if (!selectedDate || !selectedTime) return totalAvailableSlots;
    return totalAvailableSlots - 1;
  }, [selectedDate, selectedTime, totalAvailableSlots]);

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Please select date and time");
      return;
    }

    try {
      await onConfirm({
        newDate: selectedDate,
        newTime: selectedTime,
        remainingSlots,
      });

      // Reset form
      setSelectedDate("");
      setSelectedTime("");
    } catch (error) {
      toast.error(error.message || "Failed to reschedule");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between border-b border-blue-400 z-10">
          <div className="flex items-center gap-3">
            <Calendar className="text-white" size={24} />
            <div>
              <h2 className="text-xl font-bold text-white">
                Reschedule Appointment
              </h2>
              <p className="text-blue-100 text-sm">
                {appointmentData.providerName} {appointmentData.providerEmoji}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-500 rounded-lg p-2 transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Current Appointment Info */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-semibold">Current Appointment:</span>
            </p>
            <p className="text-gray-800">
              <Calendar size={16} className="inline mr-2" />
              {appointmentData.date} at {appointmentData.time}
            </p>
          </div>

          {/* Availability Summary */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 flex items-center gap-3">
            <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
            <div>
              <p className="text-sm font-semibold text-blue-900">
                {totalAvailableSlots} Available Slots Found
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Next 30 days • 9 AM to 5 PM • 30-min intervals
              </p>
            </div>
          </div>

          {/* Date Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Select Date
            </label>
            <div className="grid grid-cols-7 gap-2">
              {timeSlots.map((day) => {
                const availableCount = day.slots.filter(
                  (s) => s.available
                ).length;
                const isSelected = selectedDate === day.date;

                return (
                  <button
                    key={day.date}
                    onClick={() => setSelectedDate(day.date)}
                    disabled={availableCount === 0}
                    className={`p-3 rounded-lg border-2 transition text-center text-xs font-semibold ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : availableCount === 0
                        ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "border-gray-200 hover:border-blue-300 text-gray-800"
                    }`}
                  >
                    <div>{day.dayOfWeek}</div>
                    <div className="text-lg font-bold">{day.dayNumber}</div>
                    <div className="text-xs mt-1 text-gray-600">
                      {availableCount} slot{availableCount !== 1 ? "s" : ""}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Selection */}
          {selectedDate && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Select Time
              </label>
              <div className="grid grid-cols-4 gap-2">
                {availableTimesForDate.map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => setSelectedTime(slot.time)}
                    className={`p-3 rounded-lg border-2 transition font-semibold text-sm ${
                      selectedTime === slot.time
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-green-300 text-gray-800"
                    }`}
                  >
                    <Clock size={14} className="inline mr-1" />
                    {slot.time}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Balance Times Info */}
          {selectedDate && selectedTime && (
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm text-green-900 font-semibold">
                ✓ Selected: {selectedDate} at {selectedTime}
              </p>
              <p className="text-xs text-green-700 mt-2">
                <span className="font-semibold">{remainingSlots}</span> balance
                time
                {remainingSlots !== 1 ? "s" : ""} remaining for{" "}
                {customerName} to confirm
              </p>
            </div>
          )}

          {/* Info Message */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
            <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              After confirmation, customer will receive notification with option
              to confirm this new time or suggest an alternative from available
              slots.
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
              disabled={!selectedDate || !selectedTime || isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg transition font-semibold flex items-center justify-center gap-2"
            >
              <Clock size={18} />
              {isLoading ? "Submitting..." : "Confirm Reschedule"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RescheduleModal;
