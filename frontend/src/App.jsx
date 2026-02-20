import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Common Components
import AIChat from "./components/common/AIChat";

// Public Pages
import Home from "./pages/public/Home";
import About from "./pages/public/About";
import Services from "./pages/public/Services";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";
import VerifyEmail from "./pages/auth/VerifyEmail";
import Terms from "./pages/public/Terms";
import Privacy from "./pages/public/Privacy";
import CompleteProfile from "./pages/public/CompleteProfile";

// Customer Pages
import CustomerDashboard from "./pages/customer/Dashboard";
import BrowseProviders from "./pages/customer/BrowseProviders";
import ViewSlots from "./pages/customer/ViewSlots";
import MyAppointments from "./pages/customer/MyAppointments";
import CustomerProfile from "./pages/customer/Profile";
import CustomerNotifications from "./pages/customer/Notifications";

// Provider Pages
import ProviderDashboard from "./pages/provider/Dashboard";
import ProviderProfile from "./pages/provider/Profile";
import ManageSlots from "./pages/provider/ManageSlots";
import Slots from "./pages/provider/Slots";
import AppointedPatients from "./pages/provider/AppointedPatients";
import ProviderAppointments from "./pages/provider/ProviderAppointments";
import ProviderReviews from "./pages/provider/ProviderReviews";
import ProviderServices from "./pages/provider/ProviderServices";
import ProviderAIAssistant from "./pages/provider/ProviderAIAssistant";
import ProviderNotifications from "./pages/provider/Notifications";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminProviders from "./pages/admin/Providers";
import AdminAppointments from "./pages/admin/Appointments";
import AdminCancelledAppointments from "./pages/admin/CancelledAppointments";
import AdminResetSystem from "./pages/admin/ResetSystem";
import AdminNotifications from "./pages/admin/Notifications";
import AdminAIHelpDesk from "./pages/admin/AIHelpDesk";

// Protected Route Component
const ProtectedRoute = ({ element, requiredRole = null }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen" style={{ background: 'var(--bg-primary)' }}>
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Redirect to appropriate dashboard based on role
    const dashboards = {
      customer: "/customer-dashboard",
      provider: "/provider-dashboard",
      admin: "/admin-dashboard",
    };
    return <Navigate to={dashboards[user.role] || "/login"} replace />;
  }

  return element;
};

// Redirect authenticated users away from auth pages
const AuthRoute = ({ element }) => {
  const { user, token } = useAuth();

  if (token && user) {
    const dashboards = {
      customer: "/customer-dashboard",
      provider: "/provider-dashboard",
      admin: "/admin-dashboard",
    };
    return <Navigate to={dashboards[user.role] || "/"} replace />;
  }

  return element;
};

function AppRoutes() {
  return (
    <div className="min-h-screen bg-white">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />

        {/* Auth Routes - redirect if already logged in */}
        <Route path="/login" element={<AuthRoute element={<Login />} />} />
        <Route
          path="/register"
          element={<AuthRoute element={<Register />} />}
        />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Profile Completion */}
        <Route
          path="/complete-profile"
          element={<ProtectedRoute element={<CompleteProfile />} />}
        />

        {/* Customer Routes */}
        <Route
          path="/customer-dashboard"
          element={
            <ProtectedRoute
              element={<CustomerDashboard />}
              requiredRole="customer"
            />
          }
        />
        <Route
          path="/browse-providers"
          element={
            <ProtectedRoute
              element={<BrowseProviders />}
              requiredRole="customer"
            />
          }
        />
        <Route
          path="/view-slots/:providerId"
          element={
            <ProtectedRoute element={<ViewSlots />} requiredRole="customer" />
          }
        />
        <Route
          path="/my-appointments"
          element={
            <ProtectedRoute
              element={<MyAppointments />}
              requiredRole="customer"
            />
          }
        />
        <Route
          path="/customer-profile"
          element={
            <ProtectedRoute
              element={<CustomerProfile />}
              requiredRole="customer"
            />
          }
        />
        <Route
          path="/customer-notifications"
          element={
            <ProtectedRoute
              element={<CustomerNotifications />}
              requiredRole="customer"
            />
          }
        />

        {/* Provider Routes */}
        <Route
          path="/provider-dashboard"
          element={
            <ProtectedRoute
              element={<ProviderDashboard />}
              requiredRole="provider"
            />
          }
        />
        <Route
          path="/provider-profile"
          element={
            <ProtectedRoute
              element={<ProviderProfile />}
              requiredRole="provider"
            />
          }
        />
        <Route
          path="/manage-slots"
          element={
            <ProtectedRoute
              element={<ManageSlots />}
              requiredRole="provider"
            />
          }
        />
        <Route
          path="/provider-slots"
          element={
            <ProtectedRoute element={<Slots />} requiredRole="provider" />
          }
        />
        <Route
          path="/appointed-patients"
          element={
            <ProtectedRoute
              element={<AppointedPatients />}
              requiredRole="provider"
            />
          }
        />
        <Route
          path="/provider-appointments"
          element={
            <ProtectedRoute
              element={<ProviderAppointments />}
              requiredRole="provider"
            />
          }
        />
        <Route
          path="/provider-reviews"
          element={
            <ProtectedRoute
              element={<ProviderReviews />}
              requiredRole="provider"
            />
          }
        />
        <Route
          path="/provider-services"
          element={
            <ProtectedRoute
              element={<ProviderServices />}
              requiredRole="provider"
            />
          }
        />
        <Route
          path="/provider-ai-assistant"
          element={
            <ProtectedRoute
              element={<ProviderAIAssistant />}
              requiredRole="provider"
            />
          }
        />
        <Route
          path="/provider-notifications"
          element={
            <ProtectedRoute
              element={<ProviderNotifications />}
              requiredRole="provider"
            />
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute
              element={<AdminDashboard />}
              requiredRole="admin"
            />
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute element={<AdminUsers />} requiredRole="admin" />
          }
        />
        <Route
          path="/admin/providers"
          element={
            <ProtectedRoute
              element={<AdminProviders />}
              requiredRole="admin"
            />
          }
        />
        <Route
          path="/admin/appointments"
          element={
            <ProtectedRoute
              element={<AdminAppointments />}
              requiredRole="admin"
            />
          }
        />
        <Route
          path="/admin/cancelled-appointments"
          element={
            <ProtectedRoute
              element={<AdminCancelledAppointments />}
              requiredRole="admin"
            />
          }
        />
        <Route
          path="/admin/reset-system"
          element={
            <ProtectedRoute
              element={<AdminResetSystem />}
              requiredRole="admin"
            />
          }
        />
        <Route
          path="/admin/notifications"
          element={
            <ProtectedRoute
              element={<AdminNotifications />}
              requiredRole="admin"
            />
          }
        />
        <Route
          path="/admin/ai-help-desk"
          element={
            <ProtectedRoute
              element={<AdminAIHelpDesk />}
              requiredRole="admin"
            />
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* AI Chat - Available on all pages for authenticated users */}
      <AIChat />
    </div>
  );
}

function App() {
  const GOOGLE_CLIENT_ID =
    import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID_HERE";

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <AuthProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#363636",
                color: "#fff",
                borderRadius: "10px",
              },
              success: {
                iconTheme: { primary: "#10B981", secondary: "#fff" },
              },
              error: {
                iconTheme: { primary: "#EF4444", secondary: "#fff" },
              },
            }}
          />
        </AuthProvider>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
