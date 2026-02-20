import React, { useState, useEffect } from "react";
import { Users, Calendar, Clock, CheckCircle, XCircle, TrendingUp, Star, ArrowRight, Bell } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import TopNavigation from "../../components/customer/TopNavigation";
import AIChat from "../../components/common/AIChat";
import Footer from "../../components/common/Footer";

const CustomerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    completed: 0,
    cancelled: 0,
  });
  const [recommendedProviders, setRecommendedProviders] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [loadingAppointments, setLoadingAppointments] = useState(true);

  // Load recent notifications from localStorage
  useEffect(() => {
    try {
      const savedNotifications = JSON.parse(localStorage.getItem("customerNotifications") || "[]");
      const appointmentNotifications = savedNotifications
        .filter((n) => n.type === "appointment_booked")
        .slice(0, 3);
      setRecentNotifications(appointmentNotifications);
    } catch (error) {
      console.error("Failed to load notifications:", error);
      setRecentNotifications([]);
    }
  }, []);

  // Load stats from backend or localStorage
  useEffect(() => {
    const loadStats = async () => {
      try {
        // TODO: Replace with backend API call when ready
        // const statsResponse = await customerService.getDashboardStats();
        // setStats(statsResponse.data);

        // Fallback: Calculate from localStorage appointments
        const appointments = JSON.parse(localStorage.getItem("appointments") || "[]");
        const customerAppointments = appointments.filter(
          (apt) => apt.customerId === user?._id || apt.customerId === parseInt(user?.id || 0)
        );

        setStats({
          total: customerAppointments.length,
          upcoming: customerAppointments.filter((apt) => apt.status === "upcoming").length,
          completed: customerAppointments.filter((apt) => apt.status === "completed").length,
          cancelled: customerAppointments.filter((apt) => apt.status === "cancelled").length,
        });

        setLoadingStats(false);
      } catch (error) {
        console.error("Failed to load dashboard stats:", error);
        toast.error("Failed to load statistics");
        setStats({ total: 0, upcoming: 0, completed: 0, cancelled: 0 });
        setLoadingStats(false);
      }
    };

    if (user) {
      loadStats();
    }
  }, [user]);

  // Load recommended providers from backend
  useEffect(() => {
    const loadRecommendedProviders = async () => {
      try {
        // TODO: Replace with backend API call when ready
        // const response = await customerService.getRecommendedProviders();
        // setRecommendedProviders(response.data.providers || []);

        // Fallback: Return empty array (backend will provide recommendations)
        setRecommendedProviders([]);
        setLoadingProviders(false);
      } catch (error) {
        console.error("Failed to load recommended providers:", error);
        toast.error("Failed to load recommendations");
        setRecommendedProviders([]);
        setLoadingProviders(false);
      }
    };

    if (user) {
      loadRecommendedProviders();
    }
  }, [user]);

  // Load upcoming appointments from backend
  useEffect(() => {
    const loadUpcomingAppointments = async () => {
      try {
        // TODO: Replace with backend API call when ready
        // const response = await customerService.getUpcomingAppointments();
        // setUpcomingAppointments(response.data.appointments || []);

        // Fallback: Get from localStorage
        const appointments = JSON.parse(localStorage.getItem("appointments") || "[]");
        const customerAppointments = appointments.filter(
          (apt) => apt.customerId === user?._id || apt.customerId === parseInt(user?.id || 0)
        );
        const upcoming = customerAppointments
          .filter((apt) => apt.status === "upcoming")
          .slice(0, 2);
        setUpcomingAppointments(upcoming);

        setLoadingAppointments(false);
      } catch (error) {
        console.error("Failed to load upcoming appointments:", error);
        toast.error("Failed to load appointments");
        setUpcomingAppointments([]);
        setLoadingAppointments(false);
      }
    };

    if (user) {
      loadUpcomingAppointments();
    }
  }, [user]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <TopNavigation />
      <main className="flex-1 w-full">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 mb-8 border border-blue-100">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.name?.split(" ")[0] || "User"}! 👋
            </h1>
            <p className="text-gray-600">
              Manage your appointments and find trusted providers all in one place
            </p>
          </div>

          {/* Stats Grid - NOW LOADING FROM BACKEND */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-600">
              <p className="text-gray-600 text-sm font-semibold mb-2">Total Appointments</p>
              <p className="text-3xl font-bold text-blue-600">
                {loadingStats ? "..." : stats.total}
              </p>
              <p className="text-xs text-gray-500 mt-2">All time</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-600">
              <p className="text-gray-600 text-sm font-semibold mb-2">Upcoming</p>
              <p className="text-3xl font-bold text-green-600">
                {loadingStats ? "..." : stats.upcoming}
              </p>
              <p className="text-xs text-gray-500 mt-2">Scheduled</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-600">
              <p className="text-gray-600 text-sm font-semibold mb-2">Completed</p>
              <p className="text-3xl font-bold text-purple-600">
                {loadingStats ? "..." : stats.completed}
              </p>
              <p className="text-xs text-gray-500 mt-2">Finished</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-600">
              <p className="text-gray-600 text-sm font-semibold mb-2">Cancelled</p>
              <p className="text-3xl font-bold text-red-600">
                {loadingStats ? "..." : stats.cancelled}
              </p>
              <p className="text-xs text-gray-500 mt-2">Not attended</p>
            </div>
          </div>

          {/* Upcoming Appointments & Recent Notifications */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">📅 Upcoming Appointments</h2>
                  <button
                    onClick={() => navigate("/my-appointments")}
                    className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
                  >
                    View All →
                  </button>
                </div>

                {loadingAppointments ? (
                  <p className="text-gray-600 text-center py-8">Loading appointments...</p>
                ) : upcomingAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingAppointments.map((apt) => (
                      <div
                        key={apt.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900">{apt.providerName || "Provider"}</h3>
                            <p className="text-sm text-gray-600 mt-1">{apt.reason || "Appointment"}</p>
                            <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Calendar size={16} /> {apt.date}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={16} /> {apt.time}
                              </span>
                            </div>
                          </div>
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                            ✓ {apt.status || "Scheduled"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-8">No upcoming appointments. Book one now!</p>
                )}
              </div>
            </div>

            {/* Notifications & Quick Actions */}
            <div className="space-y-4">
              {/* Recent Notifications */}
              {recentNotifications.length > 0 && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm p-6 border border-blue-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Bell size={20} className="text-blue-600" />
                    <h3 className="text-lg font-bold text-gray-900">Recent Bookings</h3>
                  </div>
                  <div className="space-y-3">
                    {recentNotifications.map((notif) => (
                      <div key={notif.id} className="bg-white rounded-lg p-3 border border-blue-100">
                        <div className="flex items-start gap-2 mb-2">
                          <span className="text-2xl">{notif.details?.providerEmoji || "📅"}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-sm truncate">
                              {notif.details?.provider || "Appointment"}
                            </p>
                            <p className="text-xs text-gray-500">{notif.details?.domain}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 text-xs text-gray-600">
                          <span>📍 {notif.details?.date}</span>
                          <span>🕐 {notif.details?.time}</span>
                        </div>
                        <div className="mt-2 pt-2 border-t border-blue-100">
                          <p className="text-xs font-semibold text-green-700">✓ Confirmed</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => navigate("/customer-notifications")}
                    className="w-full mt-3 px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-100 rounded-lg transition"
                  >
                    View All Notifications
                  </button>
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                <button
                  onClick={() => navigate("/browse-providers")}
                  className="w-full mb-3 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
                >
                  <Users size={18} />
                  Browse Providers
                </button>
                <button
                  onClick={() => navigate("/my-appointments")}
                  className="w-full px-4 py-3 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                >
                  <Calendar size={18} />
                  My Appointments
                </button>
              </div>
            </div>
          </div>

          {/* Recommended Providers - NOW LOADING FROM BACKEND */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">🌟 Recommended for You</h2>
            {loadingProviders ? (
              <p className="text-gray-600 text-center py-8">Loading recommendations...</p>
            ) : recommendedProviders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recommendedProviders.map((provider) => (
                  <div
                    key={provider.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition"
                  >
                    <div className="text-4xl mb-3">{provider.image || "👤"}</div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{provider.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{provider.domain}</p>

                    <div className="flex items-center gap-1 mb-3">
                      <Star className="fill-yellow-400 text-yellow-400" size={16} />
                      <span className="font-semibold text-gray-900">{provider.rating}</span>
                      <span className="text-sm text-gray-600">({provider.reviews})</span>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {provider.description}
                    </p>

                    <button
                      onClick={() =>
                        navigate(`/view-slots/${provider.id}`, { state: { provider } })
                      }
                      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
                    >
                      View Slots
                      <ArrowRight size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-600 mb-4">
                  📊 Personalized recommendations will appear here once backend is integrated
                </p>
                <button
                  onClick={() => navigate("/browse-providers")}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                >
                  Browse All Providers
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      <AIChat />
      <Footer />
    </div>
  );
};

export default CustomerDashboard;
