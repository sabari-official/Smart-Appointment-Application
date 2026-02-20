/**
 * APPOINTMENT ACTIONS SYSTEM - QUICK REFERENCE GUIDE
 * ==================================================
 * 
 * Fast lookup for component usage, props, and integration points
 */

// ============================================================================
// 🎯 QUICK START: Import Map
// ============================================================================

import AppointmentActions from "@/components/appointment/AppointmentActions";
import RescheduleModal from "@/components/appointment/RescheduleModal";
import FeedbackForm from "@/components/appointment/FeedbackForm";
import CustomerAppointmentFeedback from "@/components/appointment/CustomerAppointmentFeedback";
import CustomerRescheduleConfirmation from "@/components/appointment/CustomerRescheduleConfirmation";
import ProviderFeedbackWidget from "@/components/dashboard/ProviderFeedbackWidget";

// ============================================================================
// 📝 Component Usage Quick Reference
// ============================================================================

/**
 * 1. APPOINTMENT ACTIONS
 *    Use in: ProviderAppointments page, for each appointment
 *    Shows: Mark Complete, Reschedule, Cancel buttons
 */
<AppointmentActions
  appointmentId="12345"
  appointmentData={{
    appointmentId: "12345",
    providerId: 1,
    providerName: "Dr. John",
    providerEmoji: "👨‍⚕️",
    customerName: "Jane",
    date: "2024-01-15",
    time: "14:30",
    status: "upcoming"
  }}
  onComplete={async (id, data) => {
    // TODO: Call backend API
    console.log("Mark complete:", id);
  }}
  onReschedule={async (id, data) => {
    // TODO: Call backend API
    console.log("Reschedule:", id, data);
  }}
  onCancel={async (id, data) => {
    // TODO: Call backend API
    console.log("Cancel:", id, data);
  }}
  isLoading={false}
/>

/**
 * 2. FEEDBACK FORM (Standalone)
 *    Use in: Custom modal or wrapper
 *    Shows: Star rating + review textarea
 */
<FeedbackForm
  appointmentId="12345"
  appointmentData={{
    appointmentId: "12345",
    providerId: 1,
    providerName: "Dr. John",
    providerEmoji: "👨‍⚕️",
    date: "2024-01-15",
    time: "14:30",
    customerName: "Jane"
  }}
  onSubmit={async (feedbackData) => {
    console.log("Feedback submitted:", feedbackData);
  }}
  isLoading={false}
/>

/**
 * 3. CUSTOMER FEEDBACK MODAL (Wrapper)
 *    Use in: MyAppointments, triggered by notification
 *    Shows: Feedback modal when actionType="feedback"
 */
{feedbackNotification && (
  <CustomerAppointmentFeedback
    notification={feedbackNotification}
    onClose={() => setFeedbackNotification(null)}
    onFeedbackSubmitted={(data) => {
      console.log("Feedback from customer:", data);
    }}
  />
)}

/**
 * 4. CUSTOMER RESCHEDULE CONFIRMATION (Modal)
 *    Use in: MyAppointments, triggered by notification
 *    Shows: Confirm or choose alternative time
 */
{rescheduleNotification && (
  <CustomerRescheduleConfirmation
    notification={rescheduleNotification}
    onClose={() => setRescheduleNotification(null)}
    onConfirm={(data) => {
      console.log("Reschedule choice:", data);
    }}
  />
)}

/**
 * 5. FEEDBACK WIDGET (Dashboard)
 *    Use in: Provider Dashboard page
 *    Shows: Customer reviews and rating stats
 */
<ProviderFeedbackWidget
  providerId={currentProviderId}
  maxItems={5}
/>

// ============================================================================
// 🔄 State Management Quick Guide
// ============================================================================

// READING FROM localStorage
const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
const notifications = JSON.parse(localStorage.getItem('customerNotifications') || '[]');
const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');

// WRITING TO localStorage
function updateAppointment(appointmentId, updates) {
  let appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
  const index = appointments.findIndex(a => a.appointmentId === appointmentId);
  if (index !== -1) {
    appointments[index] = { ...appointments[index], ...updates };
    localStorage.setItem('appointments', JSON.stringify(appointments));
  }
}

// CREATING NOTIFICATION
function createNotification(type, details) {
  const notification = {
    id: Date.now(),
    type, // "appointment_completed", "appointment_rescheduled", etc
    title: "...",
    message: "...",
    details,
    timestamp: new Date().toISOString(),
    read: false,
    icon: "emoji",
    priority: "high",
    actionRequired: type === "appointment_completed" || type === "appointment_rescheduled",
    actionType: type === "appointment_completed" ? "feedback" : 
               type === "appointment_rescheduled" ? "confirm_reschedule" : "none"
  };
  
  const notifications = JSON.parse(localStorage.getItem('customerNotifications') || '[]');
  notifications.unshift(notification);
  localStorage.setItem('customerNotifications', JSON.stringify(notifications));
}

// ============================================================================
// 📊 Data Structures at a Glance
// ============================================================================

// Appointment
{
  appointmentId: 1701234567890,
  providerId: 12,
  providerName: "Dr. John",
  providerEmoji: "👨‍⚕️",
  providerDomain: "doctor",
  customerName: "Jane Smith",
  date: "2024-01-15",
  time: "14:30",
  status: "upcoming", // upcoming|completed|cancelled|pending_confirmation
  reason: "Checkup",
  confirmed: true,
  confirmedAt: "2024-01-10T10:30:00Z",
  cancelReason: null,
  cancelledAt: null,
  completedAt: null,
  createdAt: "2024-01-08T15:20:00Z"
}

// Notification
{
  id: 1701234567890,
  type: "appointment_completed",
  title: "Appointment Completed",
  message: "Your appointment with...",
  details: { /* appointment data */ },
  timestamp: "2024-01-15T15:00:00Z",
  read: false,
  icon: "✅",
  priority: "high",
  actionRequired: true,
  actionType: "feedback" // "feedback" | "confirm_reschedule" | "none"
}

// Feedback
{
  appointmentId: 1701234567890,
  providerId: 12,
  providerName: "Dr. John",
  customerName: "Jane Smith",
  rating: 5,
  message: "Great service!",
  appointmentDate: "2024-01-15",
  appointmentTime: "14:30",
  submittedAt: "2024-01-15T15:30:00Z"
}

// ============================================================================
// ✅ Common Integration Tasks
// ============================================================================

// TASK 1: Add AppointmentActions to appointment row
// File: src/pages/provider/ProviderAppointments.jsx
{appointments.map(apt => (
  <div key={apt.appointmentId} className="appointment-card">
    {/* Existing appointment details */}
    <AppointmentActions
      appointmentId={apt.appointmentId}
      appointmentData={apt}
      onComplete={() => { /* handle */ }}
      onReschedule={() => { /* handle */ }}
      onCancel={() => { /* handle */ }}
    />
  </div>
))}

// TASK 2: Show feedback modal when needed
// File: src/pages/customer/MyAppointments.jsx
useEffect(() => {
  const notifications = JSON.parse(localStorage.getItem('customerNotifications') || '[]');
  const feedbackNeeded = notifications.find(n => n.actionType === 'feedback' && n.actionRequired);
  setFeedbackNotification(feedbackNeeded || null);
}, []);

// TASK 3: Show reschedule confirmation when needed
// File: src/pages/customer/MyAppointments.jsx
useEffect(() => {
  const notifications = JSON.parse(localStorage.getItem('customerNotifications') || '[]');
  const rescheduleNeeded = notifications.find(n => n.actionType === 'confirm_reschedule' && n.actionRequired);
  setRescheduleNotification(rescheduleNeeded || null);
}, []);

// TASK 4: Add feedback widget to dashboard
// File: src/pages/provider/Dashboard.jsx
<div className="dashboard-grid">
  {/* Stats cards */}
  <div className="col-span-3">
    <ProviderFeedbackWidget providerId={currentProviderId} maxItems={5} />
  </div>
</div>

// ============================================================================
// 🔗 Integration Checklist
// ============================================================================

PROVIDER SIDE:
☐ Import AppointmentActions
☐ Add to ProviderAppointments page
☐ Connect onComplete callback
☐ Connect onReschedule callback
☐ Connect onCancel callback
☐ Import ProviderFeedbackWidget
☐ Add to Provider Dashboard
☐ Test feedback widget displays reviews

CUSTOMER SIDE:
☐ Import CustomerAppointmentFeedback
☐ Import CustomerRescheduleConfirmation
☐ Add feedback modal detection in MyAppointments
☐ Add reschedule modal detection in MyAppointments
☐ Test feedback form submission
☐ Test reschedule confirmation flow
☐ Test alternative time selection

BACKEND:
☐ Create /api/appointments/:id/complete endpoint
☐ Create /api/appointments/:id/reschedule endpoint
☐ Create /api/appointments/:id/cancel endpoint
☐ Create /api/feedback endpoint
☐ Create GET /api/feedback/provider/:id endpoint
☐ Create /api/appointments/:id/confirm-reschedule endpoint
☐ Set up email sending for notifications
☐ Add database migrations

// ============================================================================
// 🚨 Common Pitfalls & Solutions
// ============================================================================

PITFALL 1: RescheduleModal not showing
SOLUTION: Check isOpen prop is true, make sure RescheduleModal is imported

PITFALL 2: Notifications not appearing
SOLUTION: Verify localStorage key names match exactly
  - 'customerNotifications' for customers
  - 'providerNotifications' for providers

PITFALL 3: Feedback not showing on dashboard
SOLUTION: Make sure ProviderFeedbackWidget has correct providerId
  And feedbacks are stored in localStorage['feedbacks']

PITFALL 4: Double-booking still possible
SOLUTION: RescheduleModal filters appointments in real-time
  Check that appointments have correct providerId
  Verify cancelled appointments excluded from availability

PITFALL 5: Forms not validating
SOLUTION: All components have built-in validation
  Check isLoading prop isn't blocking submission
  Verify callback errors are handled properly

// ============================================================================
// 📚 Documentation Files Map
// ============================================================================

File: DELIVERY_SUMMARY.md
Purpose: Complete project summary and status
Use when: You need to understand what was delivered

File: APPOINTMENT_ACTIONS_README.md
Purpose: Feature overview and integration checklist
Use when: You're planning the integration work

File: APPOINTMENT_ACTIONS_INTEGRATION.js
Purpose: Detailed integration examples and code snippets
Use when: You're actually doing the integration

File: APPOINTMENT_ACTIONS_ARCHITECTURE.js
Purpose: Technical architecture and system design
Use when: You need to understand how everything connects

File: BACKEND_INTEGRATION_GUIDE.js
Purpose: Backend API specifications
Use when: You're building the backend

This file (QUICK_REFERENCE.js):
Purpose: Fast lookup and common patterns
Use when: You need quick answers during development

// ============================================================================
// ⚡ Command Quick Reference
// ============================================================================

// Check if notification requires action
const needsAction = notification.actionRequired && notification.actionType;

// Get all appointments for a provider
const providerApts = appointments.filter(a => a.providerId === providerId);

// Get all feedback for a provider
const providerFeedback = feedbacks.filter(f => f.providerId === providerId);

// Calculate provider average rating
const avgRating = feedbacks
  .filter(f => f.providerId === providerId)
  .reduce((sum, f) => sum + f.rating, 0) / feedbacks.length;

// Check if time slot is available
const isAvailable = !appointments.some(a =>
  a.providerId === providerId &&
  a.date === selectedDate &&
  a.time === selectedTime &&
  a.status !== 'cancelled'
);

// Mark notification as read
notification.read = true;

// Mark action as completed
notification.actionRequired = false;

// Get current provider/customer ID
const currentUserId = localStorage.getItem('currentUserId');
const currentUserRole = localStorage.getItem('currentUserRole');

// ============================================================================
// 🎯 Next Steps
// ============================================================================

IMMEDIATE (Today):
1. Read DELIVERY_SUMMARY.md
2. Review component structure in each .jsx file
3. Open APPOINTMENT_ACTIONS_INTEGRATION.js
4. Identify integration points (ProviderAppointments.jsx, MyAppointments.jsx)

NEXT (This week):
1. Integrate AppointmentActions into ProviderAppointments
2. Test with localStorage (no backend needed)
3. Add feedback modal logic to MyAppointments
4. Add reschedule confirmation logic to MyAppointments

FOLLOWING (Next week):
1. Start backend API development
2. Switch from localStorage to API calls
3. Add email notification sending
4. Full integration testing

FINAL (Before launch):
1. Comprehensive user testing
2. Accessibility audit
3. Performance optimization
4. Deploy to production

// ============================================================================
// 📞 Troubleshooting
// ============================================================================

Issue: Component not rendering
→ Check all required props are passed
→ Verify imports are correct
→ Check for JavaScript console errors

Issue: Data not persisting
→ Verify localStorage.setItem() is called
→ Check localStorage key names are exact
→ Try localStorage.clear() and refresh if stuck

Issue: Notifications not showing
→ Check correct notification key (customerNotifications vs providerNotifications)
→ Verify notification object has all required fields
→ Make sure actionType is spelled correctly

Issue: Modal not closing
→ Check onClose callback is connected
→ Verify modal state is updated after action
→ Make sure parent component detects state change

Issue: Availability filtering not working
→ Verify appointment providerId matches
→ Check appointment status is not 'cancelled'
→ Make sure dates are in "YYYY-MM-DD" format
→ Verify times are in "HH:MM" format

================================ END QUICK REFERENCE ================================
*/

export default {
  lastUpdated: "January 2024",
  purpose: "Quick lookup and common patterns",
  useWhen: "During development and integration",
};
