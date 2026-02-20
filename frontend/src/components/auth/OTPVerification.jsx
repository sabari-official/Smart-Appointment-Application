import React, { useState, useEffect, useRef } from "react";
import { Lock, CheckCircle, AlertCircle, RotateCcw, Loader, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

const OTPVerification = ({
  email,
  onOTPSubmit,
  onResendOTP,
  isLoading = false,
  resendCooldown = 60,
}) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [errors, setErrors] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const inputRefs = useRef([]);
  const [attemptCount, setAttemptCount] = useState(0);

  // Resend cooldown timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Handle OTP input
  const handleOTPChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only last character
    setOtp(newOtp);

    // Clear errors when typing
    if (errors) setErrors("");

    // Auto-focus next input
    if (newOtp[index] && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Validate OTP format
  const validateOTP = () => {
    const otpString = otp.join("");

    if (otpString.length !== 6) {
      setErrors("Please enter all 6 digits");
      return false;
    }

    if (!/^\d{6}$/.test(otpString)) {
      setErrors("OTP must contain only numbers");
      return false;
    }

    return true;
  };

  // Handle OTP verification
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setErrors("");

    if (!validateOTP()) {
      return;
    }

    // Prevent brute force attempts
    if (attemptCount >= 5) {
      setErrors("Too many failed attempts. Please request a new OTP.");
      return;
    }

    setIsVerifying(true);

    try {
      const otpString = otp.join("");

      // Call parent handler to verify OTP with backend
      // Backend will:
      // 1. Check if OTP matches (with timing comparison for security)
      // 2. Check if OTP is expired (5 min timeout)
      // 3. Mark email as verified in temp session
      // 4. Return success with session token
      // 5. Clear OTP from session after verification
      await onOTPSubmit(email, otpString);
      toast.success("✅ Email verified successfully!");
    } catch (error) {
      setAttemptCount(attemptCount + 1);
      setErrors(error.message || "Invalid OTP. Please try again.");
      toast.error(error.message || "Invalid OTP");
      // Clear OTP on error
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    try {
      await onResendOTP(email);
      toast.success("OTP resent successfully");
      setResendTimer(resendCooldown);
      setOtp(["", "", "", "", "", ""]);
      setAttemptCount(0);
      setErrors("");
      inputRefs.current[0]?.focus();
    } catch (error) {
      toast.error(error.message || "Failed to resend OTP");
      setErrors(error.message || "Failed to resend OTP");
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 rounded-full p-4">
              <Lock size={32} className="text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter OTP</h2>
          <p className="text-gray-600 text-sm">
            A 6-digit code has been sent to{" "}
            <span className="font-semibold text-gray-900 break-all">{email}</span>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleVerifyOTP} className="space-y-6">
          {/* OTP Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-4">
              Enter Code
            </label>
            <div className="flex gap-2 justify-center mb-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  value={digit}
                  onChange={(e) => handleOTPChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  maxLength="1"
                  inputMode="numeric"
                  pattern="\d*"
                  disabled={isVerifying || isLoading}
                  className={`w-12 h-14 text-center text-lg font-bold border-2 rounded-lg focus:outline-none transition ${
                    errors
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 focus:border-green-500 bg-white"
                  } disabled:bg-gray-50 disabled:text-gray-400`}
                />
              ))}
            </div>

            {/* Error Message */}
            {errors && (
              <div className="flex items-start gap-2 mt-2">
                <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{errors}</p>
              </div>
            )}

            {/* Attempt Counter */}
            {attemptCount > 0 && attemptCount < 5 && (
              <p className="text-xs text-orange-600 mt-2 text-center">
                {5 - attemptCount} attempts remaining
              </p>
            )}
          </div>

          {/* Security Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-xs text-green-700 flex items-center gap-2">
              <span>🔐</span>
              <span>Your OTP is encrypted and will expire in 5 minutes</span>
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={otp.some((d) => !d) || isVerifying || isLoading}
            className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
          >
            {isVerifying || isLoading ? (
              <>
                <Loader size={18} className="animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                Verify Email
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Resend OTP */}
        <div className="mt-6 text-center border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-600 mb-3">Didn't receive the code?</p>
          <button
            onClick={handleResendOTP}
            disabled={resendTimer > 0 || isLoading}
            className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 disabled:text-gray-400 font-semibold transition"
          >
            <RotateCcw size={16} />
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
          </button>
        </div>

        {/* Edit Email */}
        <p className="text-center text-xs text-gray-500 mt-6">
          Wrong email?{" "}
          <button
            type="button"
            className="text-blue-600 hover:text-blue-700 font-semibold"
            // This would navigate back to email input
          >
            Change email
          </button>
        </p>
      </div>
    </div>
  );
};

export default OTPVerification;
