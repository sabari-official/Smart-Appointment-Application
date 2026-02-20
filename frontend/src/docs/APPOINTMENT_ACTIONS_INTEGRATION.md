/**
 * APPOINTMENT ACTIONS SYSTEM - COMPLETE INTEGRATION GUIDE
 * ========================================================
 * 
 * This guide explains how to integrate the complete appointment action
 * system into your application, including components, flows, and backend
 * requirements.
 * 
 * CREATED COMPONENTS:
 * 1. AppointmentActions.jsx - Provider actions (mark complete, reschedule, cancel)
 * 2. RescheduleModal.jsx - Time slot availability and selection
 * 3. FeedbackForm.jsx - Customer feedback collection
 * 4. CustomerAppointmentFeedback.jsx - Feedback modal for customers
 * 5. CustomerRescheduleConfirmation.jsx - Customer reschedule confirmation UI
 * 6. ProviderFeedbackWidget.jsx - Dashboard widget showing customer reviews
 */

// ============================================================================
// PART 1: PROVIDER-SIDE INTEGRATION
// ============================================================================

/**
 * USE CASE 1: Integrate AppointmentActions into ProviderAppointments Page
 * File: src/pages/provider/ProviderAppointments.jsx
 * 
 * Example implementation:
 */

import AppointmentActions from "@/components/appointment/AppointmentActions";
import toast from "react-hot-toast";

export default function ProviderAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Each appointment card should include AppointmentActions
  return (
    <div className="space-y-4">
      {appointments.map((apt) => (
        <div key={apt.appointmentId} className="bg-white rounded-lg shadow p-4">
          {/* Appointment Details */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-600">Customer</p>
              <p className="font-semibold">{apt.customerName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Date & Time</p>
              <p className="font-semibold">{apt.date} at {apt.time}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Reason</p>
              <p className="font-semibold text-sm">{apt.reason}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Status</p>
              <p className="font-semibold">{apt.status}</p>
            </div>
          </div>

          {/* Action Buttons and Confirmation Dialogs */}
          <AppointmentActions
            appointmentId={apt.appointmentId}
            appointmentData={apt}
            onComplete={async (appointmentId, data) => {
              setIsLoading(true);
              try {
                // TODO: Call backend API
                // await api.post('/appointments/:id/complete', { appointmentId })
                
                // Update appointment status locally
                let appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
                const index = appointments.findIndex(a => a.appointmentId === appointmentId);
                if (index !== -1) {
                  appointments[index].status = 'completed';
                  appointments[index].completedAt = new Date().toISOString();
                  localStorage.setItem('appointments', JSON.stringify(appointments));
                }
                
                setAppointments(appointments);
              } catch (error) {
                toast.error('Failed to mark appointment complete');
              } finally {
                setIsLoading(false);
              }
            }}
            onReschedule={async (appointmentId, data) => {
              setIsLoading(true);
              try {
                // TODO: Call backend API
                // await api.post('/appointments/:id/reschedule', { 
                //   appointmentId,
                //   newDate: data.newDate,
                //   newTime: data.newTime
                // })
                
                // Update appointment locally
                let appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
                const index = appointments.findIndex(a => a.appointmentId === appointmentId);
                if (index !== -1) {
                  appointments[index].status = 'pending_confirmation';
                  appointments[index].newDate = data.newDate;
                  appointments[index].newTime = data.newTime;
                  localStorage.setItem('appointments', JSON.stringify(appointments));
                }
                
                setAppointments(appointments);
              } catch (error) {
                toast.error('Failed to reschedule appointment');
              } finally {
                setIsLoading(false);
              }
            }}
            onCancel={async (appointmentId, data) => {
              setIsLoading(true);
              try {
                // TODO: Call backend API
                // await api.post('/appointments/:id/cancel', { 
                //   appointmentId,
                //   cancelReason: data.cancelReason
                // })
                
                // Update appointment locally
                let appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
                const index = appointments.findIndex(a => a.appointmentId === appointmentId);
                if (index !== -1) {
                  appointments[index].status = 'cancelled';
                  appointments[index].cancelReason = data.cancelReason;
                  appointments[index].cancelledAt = new Date().toISOString();
                  localStorage.setItem('appointments', JSON.stringify(appointments));
                }
                
                setAppointments(appointments);
              } catch (error) {
                toast.error('Failed to cancel appointment');
              } finally {
                setIsLoading(false);
              }
            }}
            isLoading={isLoading}
          />
        </div>
      ))}
    </div>
  );
}

/**
 * USE CASE 2: Add ProviderFeedbackWidget to Provider Dashboard
 * File: src/pages/provider/Dashboard.jsx
 * 
 * Example implementation:
 */

import ProviderFeedbackWidget from "@/components/dashboard/ProviderFeedbackWidget";

export default function ProviderDashboard() {
  const providerId = localStorage.getItem('currentUserId'); // Or get from auth context
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Stats Cards */}
      <div>{/* existing code */}</div>
      
      {/* Feedback Widget - takes entire row */}
      <div className="lg:col-span-3">
        <ProviderFeedbackWidget providerId={providerId} maxItems={5} />
      </div>
    </div>
  );
}

// ============================================================================
// PART 2: CUSTOMER-SIDE INTEGRATION
// ============================================================================

/**
 * USE CASE 3: Show Feedback Form When Appointment Marked Complete
 * File: src/pages/customer/MyAppointments.jsx
 * 
 * When customer receives notification with actionType: "feedback"
 * Display CustomerAppointmentFeedback modal
 */

import CustomerAppointmentFeedback from "@/components/appointment/CustomerAppointmentFeedback";
import { useState, useEffect } from "react";

export default function MyAppointments() {
  const [feedbackNotification, setFeedbackNotification] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Load notifications from localStorage
    const storedNotifications = JSON.parse(
      localStorage.getItem("customerNotifications") || "[]"
    );
    setNotifications(storedNotifications);

    // Find notifications requiring feedback
    const needingFeedback = storedNotifications.find(
      (n) => n.actionType === "feedback" && n.actionRequired
    );
    
    if (needingFeedback) {
      setFeedbackNotification(needingFeedback);
    }
  }, []);

  return (
    <div>
      {/* Render appointments list */}
      {/* ... existing code ... */}

      {/* Show Feedback Modal if Needed */}
      {feedbackNotification && (
        <CustomerAppointmentFeedback
          notification={feedbackNotification}
          onClose={() => {
            setFeedbackNotification(null);
            // Refresh notifications
            const storedNotifications = JSON.parse(
              localStorage.getItem("customerNotifications") || "[]"
            );
            setNotifications(storedNotifications);
          }}
          onFeedbackSubmitted={(feedbackData) => {
            console.log("Feedback submitted:", feedbackData);
            // TODO: Optionally send to backend API
            // await api.post('/feedback', feedbackData)
          }}
        />
      )}
    </div>
  );
}

/**
 * USE CASE 4: Show Reschedule Confirmation When Appointment Rescheduled
 * File: src/pages/customer/MyAppointments.jsx
 * 
 * When customer receives notification with actionType: "confirm_reschedule"
 * Display CustomerRescheduleConfirmation modal
 */

import CustomerRescheduleConfirmation from "@/components/appointment/CustomerRescheduleConfirmation";

export default function MyAppointments() {
  const [rescheduleNotification, setRescheduleNotification] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const storedNotifications = JSON.parse(
      localStorage.getItem("customerNotifications") || "[]"
    );
    setNotifications(storedNotifications);

    // Find reschedule notification needing confirmation
    const needingRescheduleConfirm = storedNotifications.find(
      (n) => n.actionType === "confirm_reschedule" && n.actionRequired
    );
    
    if (needingRescheduleConfirm) {
      setRescheduleNotification(needingRescheduleConfirm);
    }
  }, []);

  return (
    // JSX would go here in actual implementation
    // <div>
    //   {rescheduleNotification && (
    //     <CustomerRescheduleConfirmation
    //       notification={rescheduleNotification}
    //       onClose={() => {
    //         setRescheduleNotification(null);
    //         const storedNotifications = JSON.parse(
    //           localStorage.getItem("customerNotifications") || "[]"
    //         );
    //         setNotifications(storedNotifications);
    //       }}
    //       onConfirm={(confirmData) => {
    //         console.log("Reschedule confirmed:", confirmData);
    //       }}
    //     />
    //   )}
    // </div>
    null
  );
}

// ============================================================================
// PART 3: localStorage DATA STRUCTURES
// ============================================================================

/**
 * APPOINTMENTS STRUCTURE (Enhanced)
 */
const appointmentExample = {
  appointmentId: 1701234567890,
  providerId: 12,
  providerName: "Dr. John Doe",
  providerEmoji: "👨‍⚕️",
  providerDomain: "doctor",
  customerName: "Jane Smith",
  date: "2024-01-15",
  time: "14:30",
  status: "upcoming", // upcoming, completed, cancelled, pending_confirmation
  reason: "General Checkup",
  confirmed: true,
  confirmedAt: "2024-01-10T10:30:00Z",
  cancelReason: null,
  cancelledAt: null,
  completedAt: null,
  createdAt: "2024-01-08T15:20:00Z",
  
  // For rescheduled appointments
  newDate: null,
  newTime: null,
  originalDate: "2024-01-10",
  originalTime: "10:00",
};

/**
 * NOTIFICATIONS STRUCTURE (Enhanced with Actions)
 */
const notificationExample = {
  id: 1701234567890,
  type: "appointment_completed", // appointment_booked, appointment_completed, appointment_rescheduled, appointment_cancelled, new_feedback
  title: "Appointment Completed",
  message: "Your appointment with Dr. John Doe is marked as complete.",
  details: {
    appointmentId: 1701234567890,
    providerId: 12,
    providerName: "Dr. John Doe",
    providerEmoji: "👨‍⚕️",
    date: "2024-01-15",
    time: "14:30",
    status: "completed",
    completedAt: "2024-01-15T15:00:00Z",
  },
  timestamp: "2024-01-15T15:00:00Z",
  read: false,
  icon: "✅",
  priority: "high",
  actionRequired: true,
  actionType: "feedback", // feedback, confirm_reschedule
};

/**
 * FEEDBACK STRUCTURE
 */
const feedbackExample = {
  appointmentId: 1701234567890,
  providerId: 12,
  providerName: "Dr. John Doe",
  customerName: "Jane Smith",
  rating: 5, // 1-5 stars
  message: "Dr. John provided excellent service and made me feel comfortable.",
  appointmentDate: "2024-01-15",
  appointmentTime: "14:30",
  submittedAt: "2024-01-15T15:30:00Z",
};

/**
 * RESCHEDULE NOTIFICATION
 */
const rescheduleNotificationExample = {
  id: 1701234567890,
  type: "appointment_rescheduled",
  title: "Appointment Rescheduled",
  message: "Your appointment has been rescheduled to 2024-01-20 at 15:00",
  details: {
    appointmentId: 1701234567890,
    providerName: "Dr. John Doe",
    oldDate: "2024-01-15",
    oldTime: "14:30",
    newDate: "2024-01-20",
    newTime: "15:00",
    status: "pending_confirmation",
  },
  timestamp: "2024-01-15T15:05:00Z",
  read: false,
  icon: "📅",
  priority: "high",
  actionRequired: true,
  actionType: "confirm_reschedule",
};

// ============================================================================
// PART 4: BACKEND API REQUIREMENTS
// ============================================================================

/**
 * REQUIRED BACKEND ENDPOINTS:
 * 
 * 1. MARK APPOINTMENT AS COMPLETE
 *    POST /api/appointments/:appointmentId/complete
 *    Request: {
 *      appointmentId: string,
 *      providerId: string,
 *      completedAt: ISO8601 timestamp
 *    }
 *    Response: { success: true, appointment: {...} }
 * 
 * 2. RESCHEDULE APPOINTMENT
 *    POST /api/appointments/:appointmentId/reschedule
 *    Request: {
 *      appointmentId: string,
 *      newDate: "YYYY-MM-DD",
 *      newTime: "HH:MM",
 *      providerId: string
 *    }
 *    Response: { success: true, appointment: {...} }
 *    
 *    Validations:
 *    - Check provider availability
 *    - Check customer has no conflicts
 *    - Prevent double-booking
 *    - Save as pending_confirmation status
 * 
 * 3. CANCEL APPOINTMENT
 *    POST /api/appointments/:appointmentId/cancel
 *    Request: {
 *      appointmentId: string,
 *      cancelReason: string,
 *      providerId: string
 *    }
 *    Response: { success: true, appointment: {...} }
 *    
 *    Actions:
 *    - Mark status as cancelled
 *    - Send email to customer
 *    - Store cancellation reason
 * 
 * 4. SUBMIT FEEDBACK
 *    POST /api/feedback
 *    Request: {
 *      appointmentId: string,
 *      providerId: string,
 *      customerId: string,
 *      rating: number (1-5),
 *      message: string,
 *      submittedAt: ISO8601 timestamp
 *    }
 *    Response: { success: true, feedback: {...} }
 *    
 *    Actions:
 *    - Store feedback
 *    - Update provider average rating
 *    - Create provider notification
 *    - Update appointment with feedback flag
 * 
 * 5. GET PROVIDER FEEDBACK
 *    GET /api/feedback/provider/:providerId
 *    Response: {
 *      feedbacks: [...],
 *      stats: {
 *        averageRating: 4.5,
 *        totalReviews: 23,
 *        ratingDistribution: { 5: 15, 4: 5, 3: 2, 2: 0, 1: 0 }
 *      }
 *    }
 * 
 * 6. CONFIRM RESCHEDULE
 *    POST /api/appointments/:appointmentId/confirm-reschedule
 *    Request: {
 *      appointmentId: string,
 *      action: "confirmed|chose_alternative",
 *      newDate: "YYYY-MM-DD",
 *      newTime: "HH:MM",
 *      customerId: string
 *    }
 *    Response: { success: true, appointment: {...} }
 *    
 *    Actions:
 *    - Update appointment with confirmed date/time
 *    - Mark status as pending (from pending_confirmation)
 *    - Send confirmation email to both parties
 */

// ============================================================================
// PART 5: EMAIL NOTIFICATIONS
// ============================================================================

/**
 * EMAIL TEMPLATES NEEDED:
 * 
 * 1. APPOINTMENT_COMPLETED_FEEDBACK_REQUEST
 *    To: customer.email
 *    Subject: Feedback Requested - Your Appointment with {providerName}
 *    Body:
 *    - Appointment details
 *    - "Please rate your experience"
 *    - Button to submit feedback
 *    - Link to feedback form
 * 
 * 2. APPOINTMENT_RESCHEDULED
 *    To: customer.email
 *    Subject: Appointment Rescheduled - Action Required
 *    Body:
 *    - Old appointment date/time
 *    - New suggested date/time
 *    - "Please confirm or choose alternative"
 *    - Links to confirm or select different time
 * 
 * 3. RESCHEDULE_CONFIRMED
 *    To: provider.email, customer.email
 *    Subject: Appointment Confirmed - {date} at {time}
 *    Body:
 *    - Final confirmed date/time
 *    - Both parties details
 *    - Calendar attachment
 * 
 * 4. APPOINTMENT_CANCELLED
 *    To: customer.email
 *    Subject: Appointment Cancelled
 *    Body:
 *    - Original appointment details
 *    - Cancellation reason
 *    - Option to reschedule
 * 
 * 5. NEW_FEEDBACK_RECEIVED
 *    To: provider.email
 *    Subject: New Feedback - {rating} Stars from {customerName}
 *    Body:
 *    - Rating (stars)
 *    - Review text
 *    - Appointment details
 *    - Link to view on dashboard
 */

// ============================================================================
// PART 6: STATE MANAGEMENT BEST PRACTICES
// ============================================================================

/**
 * MANAGING APPOINTMENT STATE UPDATES
 * 
 * Flow: Provider Action → localStorage Update → UI Re-render → Backend Sync
 * 
 * Step 1: Update localStorage optimistically
 * Step 2: Show optimistic UI update
 * Step 3: Trigger backend API call
 * Step 4: If API fails, revert localStorage
 * Step 5: If API succeeds, sync final state
 * 
 * Example:
 */

async function handleAppointmentAction(appointmentId, action) {
  try {
    // 1. Get current appointments
    let appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const appointment = appointments.find(a => a.appointmentId === appointmentId);
    
    // 2. Create backup for rollback
    const backup = JSON.parse(JSON.stringify(appointment));
    
    // 3. Update locally (optimistic update)
    Object.assign(appointment, {
      status: action.status,
      [action.key]: action.value,
      updatedAt: new Date().toISOString(),
    });
    localStorage.setItem('appointments', JSON.stringify(appointments));
    
    // 4. Show optimistic feedback
    toast.loading('Updating appointment...');
    
    // 5. Call backend API
    const response = await fetch(`/api/appointments/${appointmentId}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(action),
    });
    
    if (!response.ok) throw new Error('API Error');
    
    // 6. Success feedback
    toast.success('Appointment updated!');
    
  } catch (error) {
    // 7. Rollback on failure
    appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const index = appointments.findIndex(a => a.appointmentId === appointmentId);
    if (index !== -1) {
      appointments[index] = backup;
      localStorage.setItem('appointments', JSON.stringify(appointments));
    }
    toast.error('Failed to update appointment');
  }
}

// ============================================================================
// PART 7: TESTING SCENARIOS
// ============================================================================

/**
 * TEST SCENARIO 1: Complete Appointment with Feedback
 * 
 * 1. Provider views ProviderAppointments page
 * 2. Provider clicks "Mark Complete" on appointment
 * 3. AppointmentActions shows confirmation "Ask for feedback"
 * 4. Provider confirms
 * 5. Appointment status changes to "completed"
 * 6. Customer receives notification: "Your appointment is complete"
 * 7. Customer sees CustomerAppointmentFeedback modal
 * 8. Customer rates with stars and writes review
 * 9. Feedback submitted to localStorage
 * 10. Provider dashboard ProviderFeedbackWidget shows new 5-star review
 * 11. Customer receives notification: "Thank you for feedback"
 */

/**
 * TEST SCENARIO 2: Reschedule with Customer Confirmation
 * 
 * 1. Provider views ProviderAppointments page
 * 2. Provider clicks "Reschedule" on appointment
 * 3. RescheduleModal opens showing available slots
 * 4. Provider selects new date: Jan 20, new time: 15:00
 * 5. Provider confirms reschedule
 * 6. Customer receives notification: "Appointment rescheduled"
 * 7. Customer sees CustomerRescheduleConfirmation modal
 * 8. Customer options:
 *    a) Confirm suggested time (Jan 20, 15:00)
 *    b) Choose alternative from available slots
 * 9. Customer confirms suggested time
 * 10. Provider receives notification: "Reschedule confirmed"
 * 11. Both parties see final appointment time
 * 12. ProviderAppointments shows appointment with new time
 */

/**
 * TEST SCENARIO 3: Cancel Appointment with Reason
 * 
 * 1. Provider views ProviderAppointments page
 * 2. Provider clicks "Cancel" on appointment
 * 3. AppointmentActions shows reason textarea
 * 4. Provider enters reason: "Emergency situation"
 * 5. Provider confirms cancel
 * 6. Appointment status changes to "cancelled"
 * 7. Customer receives notification: "Appointment cancelled"
 * 8. Notification shows reason
 * 9. Appointment moved to cancelled section
 * 10. Customer can reschedule if needed
 */

export default {
  appointmentExample,
  notificationExample,
  feedbackExample,
  rescheduleNotificationExample,
};
