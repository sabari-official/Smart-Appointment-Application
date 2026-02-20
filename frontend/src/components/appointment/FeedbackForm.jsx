import React, { useState } from "react";
import { Star, Send, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

const FeedbackForm = ({
  appointmentId,
  appointmentData,
  onSubmit,
  isLoading = false,
}) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  /**
   * FEEDBACK SYSTEM:
   * 1. After appointment marked complete
   * 2. Customer sees feedback form
   * 3. Customer rates (1-5 stars) and writes review
   * 4. Backend:
   *    - Stores feedback with appointmentId
   *    - Links feedback to provider
   *    - Updates provider average rating
   *    - Creates notification for provider
   * 5. Provider sees:
   *    - Star rating
   *    - Review text
   *    - Customer name
   *    - Appointment date
   * 6. Feedback shown on provider profile and dashboard
   */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (!feedback.trim()) {
      toast.error("Please write your feedback");
      return;
    }

    try {
      // Prepare feedback data
      const feedbackData = {
        appointmentId,
        providerId: appointmentData.providerId,
        providerName: appointmentData.providerName,
        customerName: appointmentData.customerName,
        rating,
        message: feedback.trim(),
        appointmentDate: appointmentData.date,
        appointmentTime: appointmentData.time,
        submittedAt: new Date().toISOString(),
      };

      // Call backend API to submit feedback
      await onSubmit(feedbackData);

      // Backend API will handle storage and provider notification
      // // const response = await customerService.submitFeedback(feedbackData);
      // // Backend will create provider notification automatically

      toast.success("✅ Thank you for your feedback!");
      setSubmitted(true);

      // Auto-hide form after 3 seconds
      setTimeout(() => {
        setSubmitted(false);
        setRating(0);
        setFeedback("");
      }, 3000);
    } catch (error) {
      toast.error(error.message || "Failed to submit feedback");
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="text-4xl mb-3">✅</div>
        <h3 className="text-lg font-bold text-green-700 mb-2">
          Thank You for Your Feedback!
        </h3>
        <p className="text-sm text-green-600">
          Your review helps {appointmentData.providerName} improve their services.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          How was your appointment?
        </h3>
        <p className="text-sm text-gray-600">
          Your feedback helps {appointmentData.providerName} and other customers
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Star Rating */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Rate Your Experience
          </label>
          <div className="flex gap-2 justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition transform hover:scale-110"
              >
                <Star
                  size={40}
                  className={`${
                    star <= (hoverRating || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-center text-sm text-gray-600 mt-3">
              {rating === 1
                ? "Poor"
                : rating === 2
                ? "Fair"
                : rating === 3
                ? "Good"
                : rating === 4
                ? "Very Good"
                : "Excellent"}
            </p>
          )}
        </div>

        {/* Feedback Text */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Share Your Feedback
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Tell us about your experience... (What went well? What could be improved?)"
            maxLength={500}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
            rows={4}
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-gray-600">
              {feedback.length}/500 characters
            </p>
            {feedback && (
              <div className="text-xs text-green-600 flex items-center gap-1">
                ✓ {Math.round((feedback.length / 500) * 100)}% complete
              </div>
            )}
          </div>
        </div>

        {/* Appointment Info */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Provider:</span>{" "}
            {appointmentData.providerName}
            <span className="ml-2">{appointmentData.providerEmoji}</span>
          </p>
          <p className="text-sm text-gray-700 mt-1">
            <span className="font-semibold">Date & Time:</span>{" "}
            {appointmentData.date} at {appointmentData.time}
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || rating === 0 || !feedback.trim()}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
        >
          <Send size={18} />
          {isLoading ? "Submitting..." : "Submit Feedback"}
        </button>

        {/* Info Message */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
          <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">
            Your honest feedback is valuable and confidential. It will be visible
            on the provider's profile.
          </p>
        </div>
      </form>
    </div>
  );
};

export default FeedbackForm;
