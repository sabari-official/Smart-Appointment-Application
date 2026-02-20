import React, { useState, useEffect } from "react";
import { Star, MessageCircle, TrendingUp } from "lucide-react";
import { providerService } from "../../services/apiService";

const ProviderFeedbackWidget = ({ providerId, maxItems = 5 }) => {
  /**
   * PROVIDER FEEDBACK DISPLAY:
   * Shows customer reviews and ratings on provider dashboard
   * - Star rating
   * - Customer name
   * - Review text
   * - Date
   * - Average rating calculation
   */

  const [feedback, setFeedback] = useState([]);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });

  useEffect(() => {
    const loadFeedback = async () => {
      try {
        // Fetch from backend API
        const response = await providerService.getReviews?.() || { data: [] };
        const allFeedbacks = response.data || [];
        
        // Filter and sort feedback
        const filteredFeedback = allFeedbacks
          .filter((f) => f.providerId === providerId)
          .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
          .slice(0, maxItems);
        
        setFeedback(filteredFeedback);

        // Calculate stats from fetched data
        const providerFeedbacks = allFeedbacks.filter(
          (f) => f.providerId === providerId
        );

        if (providerFeedbacks.length === 0) {
          setStats({
            averageRating: 0,
            totalReviews: 0,
            ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          });
          return;
        }

        const totalRating = providerFeedbacks.reduce(
          (sum, f) => sum + f.rating,
          0
        );
        const averageRating = (totalRating / providerFeedbacks.length).toFixed(1);

        const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        providerFeedbacks.forEach((f) => {
          ratingDistribution[f.rating]++;
        });

        setStats({
          averageRating: parseFloat(averageRating),
          totalReviews: providerFeedbacks.length,
          ratingDistribution,
        });
      } catch (error) {
        console.error("Failed to load feedback:", error);
      }
    };
    loadFeedback();
  }, [providerId, maxItems]);

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }
          />
        ))}
      </div>
    );
  };

  if (stats.totalReviews === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <MessageCircle size={20} className="text-blue-600" />
          Customer Feedback
        </h3>
        <div className="text-center py-8">
          <MessageCircle size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No feedback yet</p>
          <p className="text-sm text-gray-500 mt-2">
            Customer reviews will appear here after completed appointments
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* Header with Stats */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <MessageCircle size={20} className="text-blue-600" />
          Customer Feedback
        </h3>

        {/* Rating Stats */}
        <div className="grid grid-cols-3 gap-4">
          {/* Average Rating */}
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-green-600" />
              <p className="text-xs font-semibold text-gray-600">Average</p>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">
                {stats.averageRating}
              </span>
              <span className="text-xs text-gray-600">/5</span>
            </div>
            <div className="mt-2">{renderStars(Math.round(stats.averageRating))}</div>
          </div>

          {/* Total Reviews */}
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-xs font-semibold text-gray-600 mb-2">
              Total Reviews
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalReviews}
            </p>
            <p className="text-xs text-gray-500 mt-2">completed appointments</p>
          </div>

          {/* Rating Distribution */}
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-xs font-semibold text-gray-600 mb-2">
              Distribution
            </p>
            <div className="space-y-1">
              {[5, 4, 3].map((star) => (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-4 text-gray-600">{star}★</span>
                  <div className="w-12 h-2 bg-gray-200 rounded">
                    <div
                      className="h-full bg-yellow-400 rounded"
                      style={{
                        width: `${
                          (stats.ratingDistribution[star] / stats.totalReviews) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-gray-600">
                    {stats.ratingDistribution[star]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Feedback List */}
      <div className="divide-y divide-gray-200">
        {feedback.map((item) => {
          const feedbackDate = new Date(item.submittedAt);
          const dateStr = feedbackDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });

          return (
            <div key={item.submittedAt} className="p-6 hover:bg-gray-50 transition">
              {/* Customer Name & Rating */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900">
                    {item.customerName}
                  </p>
                  <p className="text-xs text-gray-500">{dateStr}</p>
                </div>
                <div>{renderStars(item.rating)}</div>
              </div>

              {/* Review Text */}
              <p className="text-sm text-gray-700 leading-relaxed">
                {item.message}
              </p>

              {/* Appointment Info */}
              <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-200">
                📅 {item.appointmentDate} at {item.appointmentTime}
              </p>
            </div>
          );
        })}
      </div>

      {/* View All Link */}
      {stats.totalReviews > maxItems && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-center">
          <button className="text-sm text-blue-600 hover:text-blue-700 font-semibold">
            View all {stats.totalReviews} reviews →
          </button>
        </div>
      )}
    </div>
  );
};

export default ProviderFeedbackWidget;
