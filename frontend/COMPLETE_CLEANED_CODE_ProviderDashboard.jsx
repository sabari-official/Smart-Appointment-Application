import React, { useState, useEffect } from "react";
import { Calendar, Clock, Plus, CheckCircle, Award, AlertCircle, User, TrendingUp, Edit3, Zap } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ProviderSidebar from "../../components/provider/ProviderSidebar";
import AIAssistant from "../../components/provider/AIAssistant";

const DOMAIN_CONFIG = {
  doctor: { emoji: "👨‍⚕️", name: "Doctor", color: "blue" },
  psychiatrist: { emoji: "🧠", name: "Psychiatrist", color: "purple" },
  businessman: { emoji: "💼", name: "Businessman", color: "indigo" },
  automobiles: { emoji: "🚗", name: "Automobiles Works", color: "orange" },
};

const calculateProfileCompletion = (user) => {
  let completedFields = 0;
  let totalFields = 10;

  if (user?.name) completedFields++;
  if (user?.email) completedFields++;
  if (user?.phone) completedFields++;
  if (user?.address) completedFields++;
  if (user?.city) completedFields++;
  if (user?.gender) completedFields++;
  if (user?.businessName) completedFields++;
  if (user?.domain) completedFields++;
  if (user?.description) completedFields++;
  if (user?.keywords?.length > 0) completedFields++;

  return Math.round((completedFields / totalFields) * 100);
};

const ProviderDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalBookings: 0,
    avgRating: 0,
    pendingAppointments: 0,
  });
  const [appointments, setAppointments] = useState([]);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [loadingRating, setLoadingRating] = useState(false);

  // Auto-refresh appointments every 3 seconds
  useEffect(() => {
    const loadAppointments = () => {
      try {
        // Get all appointments from localStorage
        const allAppointments = JSON.parse(localStorage.getItem("appointments") || "[]");

        // Filter appointments for current provider
        const providerAppointments = allAppointments
          .filter((apt) => apt.providerId === parseInt(user?._id || 0) || user?.domain)
          .map((apt) => ({
            id: apt.id,
            customerName: apt.customerName || "Unknown Customer",
            date: apt.date,
            time: apt.time,
            status: apt.confirmed ? "Confirmed" : "Pending",
            reason: apt.reason || "Appointment",
            createdAt: apt.createdAt,
          }))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Check if there's a new appointment and show notification
        const currentCount = appointments.length;
        if (currentCount > 0 && providerAppointments.length > currentCount) {
          const newAppointments = providerAppointments.slice(0, providerAppointments.length - currentCount);
          newAppointments.forEach((apt) => {
            toast.success(`📅 New Appointment: ${apt.customerName} booked!`, {
              duration: 4,
              position: "top-right",
            });
          });
        }

        setAppointments(providerAppointments);

        // Calculate stats
        const today = new Date().toISOString().split("T")[0];
        const todayCount = providerAppointments.filter((apt) => apt.date === today).length;
        const pendingCount = providerAppointments.filter((apt) => apt.status === "Pending").length;

        setStats((prevStats) => ({
          ...prevStats,
          todayAppointments: todayCount,
          totalBookings: providerAppointments.length,
          pendingAppointments: pendingCount,
          // FIXED: avgRating is now loaded dynamically from backend (see useEffect below)
          // Previously was hardcoded: avgRating: 4.7
        }));

        setLastRefresh(new Date());
      } catch (error) {
        console.error("Error loading appointments:", error);
      }
    };

    // Load initially
    loadAppointments();

    // Set up auto-refresh interval
    const interval = setInterval(loadAppointments, 3000);

    return () => clearInterval(interval);
  }, [user, appointments.length]);

  // ADDED: Load average rating from backend (new effect)
  useEffect(() => {
    const loadAverageRating = async () => {
      try {
        setLoadingRating(true);

        // TODO: Replace with backend API call when ready
        // const response = await providerService.getMyReviews();
        // const reviews = response.data.reviews || [];
        // const avgRating = reviews.length > 0
        //   ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1))
        //   : 0;

        // Fallback: Get from localStorage reviews
        const savedReviews = JSON.parse(localStorage.getItem("reviews") || "[]");
        const providerReviews = savedReviews.filter((review) => review.providerId === user?._id);

        const avgRating =
          providerReviews.length > 0
            ? parseFloat(
                (providerReviews.reduce((sum, r) => sum + r.rating, 0) / providerReviews.length).toFixed(1)
              )
            : 0;

        setStats((prevStats) => ({
          ...prevStats,
          avgRating: avgRating,
        }));

        setLoadingRating(false);
      } catch (error) {
        console.error("Failed to load average rating:", error);
        setStats((prevStats) => ({
          ...prevStats,
          avgRating: 0,
        }));
        setLoadingRating(false);
      }
    };

    if (user) {
      loadAverageRating();
    }
  }, [user]);

  const profileCompletion = calculateProfileCompletion(user);
  const isProfileComplete = profileCompletion === 100;

  const domainInfo = DOMAIN_CONFIG[user?.domain] || { emoji: "🏢", name: "Provider", color: "gray" };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <ProviderSidebar />

      {/* Main Content */}
      <div className="flex-1 ml-20 md:ml-64 transition-all">
        {/* Profile Completion Alert */}
        {!isProfileComplete && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={24} />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-yellow-800">⚠️ Complete Your Profile</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Your profile is only {profileCompletion}% complete. Complete your profile to increase visibility and attract more clients!
                  </p>

                  {/* Progress Bar */}
                  <div className="mt-3 bg-yellow-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-green-500 h-full transition-all duration-500 ease-out"
                      style={{ width: `${profileCompletion}%` }}
                    />
                  </div>

                  {/* Missing Fields Info */}
                  <div className="mt-3 text-xs text-yellow-700">
                    <p className="font-semibold mb-1">Missing fields to reach 100%:</p>
                    <div className="grid grid-cols-2 gap-1">
                      {!user?.businessName && <span>✗ Business Name</span>}
                      {!user?.description && <span>✗ Professional Description</span>}
                      {!user?.phone && <span>✗ Phone Number</span>}
                      {!user?.address && <span>✗ Address</span>}
                      {!user?.city && <span>✗ City</span>}
                      {!user?.gender && <span>✗ Gender</span>}
                      {!user?.keywords?.length > 0 && <span>✗ Keywords/Specialties</span>}
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate("/complete-profile")}
                className="ml-4 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold flex items-center space-x-2 whitespace-nowrap transition"
              >
                <Edit3 size={18} />
                <span>Update Now</span>
              </button>
            </div>
          </div>
        )}

        {/* Success Message for Complete Profile */}
        {isProfileComplete && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg shadow">
            <div className="flex items-center space-x-3">
              <CheckCircle className="text-green-600" size={24} />
              <div>
                <h3 className="font-semibold text-green-800">✅ Profile Complete</h3>
                <p className="text-sm text-green-700">Your profile is 100% complete! You're all set to attract clients.</p>
              </div>
            </div>
          </div>
        )}

        {/* Profile Information Display */}
        {isProfileComplete && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Personal Info */}
            <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-blue-600">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User size={20} className="text-blue-600" />
                Profile Information
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600 font-semibold">Name</p>
                  <p className="text-gray-900">{user?.name || "Not set"}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Email</p>
                  <p className="text-gray-900">{user?.email || "Not set"}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Phone</p>
                  <p className="text-gray-900">{user?.phone || "Not set"}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Address</p>
                  <p className="text-gray-900">{user?.address || "Not set"}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">City</p>
                  <p className="text-gray-900">{user?.city || "Not set"}</p>
                </div>
              </div>
            </div>

            {/* Professional Info */}
            <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-purple-600">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-purple-600" />
                Professional Details
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600 font-semibold">Business Name</p>
                  <p className="text-gray-900">{user?.businessName || "Not set"}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Domain/Specialization</p>
                  <p className="text-gray-900">{user?.domain || "Not set"}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Description</p>
                  <p className="text-gray-900 line-clamp-2">{user?.description || "Not set"}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Working Hours</p>
                  <p className="text-gray-900">{user?.workingHours || "Not set"}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Gender</p>
                  <p className="text-gray-900">
                    {user?.gender ? (user.gender === "male" ? "👨 Male" : user.gender === "female" ? "👩 Female" : "🧑 Other") : "Not set"}
                  </p>
                </div>
                {user?.keywords?.length > 0 && (
                  <div>
                    <p className="text-gray-600 font-semibold mb-2">Keywords/Specialties</p>
                    <div className="flex flex-wrap gap-2">
                      {user.keywords.map((keyword, idx) => (
                        <span key={idx} className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-semibold">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          {/* Professional Domain Header with Stats */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-600 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <span className="text-5xl">{domainInfo.emoji}</span>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">
                    Welcome back, {user?.name || "Provider"}!
                  </h1>
                  <p className="text-gray-600">
                    <span className="font-semibold">{user?.businessName}</span> •
                    <span className="ml-2 font-semibold text-blue-600">{domainInfo.name}</span> •
                    <span className={`ml-2 font-bold ${isProfileComplete ? "text-green-600" : "text-orange-600"}`}>
                      {profileCompletion}% Complete
                    </span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-yellow-500">
                  {loadingRating ? "..." : (stats.avgRating || 0)}⭐
                </p>
                <p className="text-xs text-gray-600 mt-1">Average Rating</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards with Auto-Refresh Indicator */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-blue-600">
            <Clock className="text-blue-600 mb-2" size={32} />
            <p className="text-gray-600 text-sm font-semibold">Today's Appointments</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stats.todayAppointments || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-green-600">
            <Calendar className="text-green-600 mb-2" size={32} />
            <p className="text-gray-600 text-sm font-semibold">Total Bookings</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stats.totalBookings || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-orange-600">
            <Award className="text-orange-600 mb-2" size={32} />
            <p className="text-gray-600 text-sm font-semibold">Average Rating</p>
            <p className="text-3xl font-bold text-orange-600 mt-2">
              ⭐ {loadingRating ? "..." : (stats.avgRating || 0)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-red-600">
            <AlertCircle className="text-red-600 mb-2" size={32} />
            <p className="text-gray-600 text-sm font-semibold">Pending</p>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {stats.pendingAppointments || 0}
            </p>
          </div>
        </div>

        {/* Auto-Refresh Status */}
        <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="text-blue-600 animate-pulse" size={18} />
            <p className="text-sm text-blue-700">
              <span className="font-semibold">✓ Auto-refreshing every 3 seconds</span>
              <span className="ml-2 text-blue-600">Last updated: {lastRefresh.toLocaleTimeString()}</span>
            </p>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">📅 Today's Appointments</h2>
            <button
              onClick={() => navigate("/provider-appointments")}
              className="text-blue-600 hover:text-blue-700 font-semibold transition"
            >
              View All
            </button>
          </div>
          <div className="p-6">
            {appointments.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No appointments scheduled for today</p>
            ) : (
              <div className="space-y-3">
                {appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="border border-gray-200 rounded-lg p-4 flex justify-between items-center hover:shadow-md transition bg-gray-50"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{apt.customerName}</p>
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <Clock size={14} /> {apt.time}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                      {apt.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 flex flex-wrap gap-4 justify-center mb-6">
            {isProfileComplete && (
              <>
                <button
                  onClick={() => navigate("/provider-slots")}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 rounded-lg font-semibold transition flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <Calendar size={20} />
                  Manage Appointment Slots
                </button>
                <button
                  onClick={() => navigate("/appointed-patients")}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-3 rounded-lg font-semibold transition flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <User size={20} />
                  View Appointed Patients
                </button>
              </>
            )}
            <button
              onClick={() => navigate("/complete-profile")}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-lg font-semibold transition flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Edit3 size={20} />
              Update Profile
            </button>
          </div>
        </div>
      </div>

      <AIAssistant providerDomain={user?.domain || "general"} />
    </div>
  );
};

export default ProviderDashboard;
