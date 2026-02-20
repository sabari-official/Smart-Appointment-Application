import React, { useState } from "react";
import { Mail, CheckCircle, AlertCircle, ArrowRight, Loader } from "lucide-react";
import toast from "react-hot-toast";

const EmailVerification = ({ email, onEmailSubmit, isLoading = false }) => {
  const [inputEmail, setInputEmail] = useState(email || "");
  const [errors, setErrors] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  // Email validation regex (RFC 5322 simplified)
  const validateEmail = (emailString) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailString);
  };

  // Check if email domain is valid (bonus security check)
  const validateEmailDomain = (emailString) => {
    const validDomains = [
      "gmail.com",
      "yahoo.com",
      "outlook.com",
      "hotmail.com",
      "protonmail.com",
      "icloud.com",
      "aol.com",
      "mail.com",
      "zoho.com",
      "yandex.com",
    ];

    const domain = emailString.split("@")[1]?.toLowerCase();
    return validDomains.includes(domain) ? domain : null;
  };

  const handleEmailChange = (e) => {
    const value = e.target.value.trim();
    setInputEmail(value);

    // Clear errors on input
    if (errors) {
      setErrors("");
    }

    // Real-time validation
    if (value && !validateEmail(value)) {
      setErrors("Invalid email format");
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setErrors("");

    // Validation checks
    if (!inputEmail.trim()) {
      setErrors("Email is required");
      return;
    }

    if (!validateEmail(inputEmail)) {
      setErrors("Please enter a valid email address");
      return;
    }

    const domain = validateEmailDomain(inputEmail);
    if (!domain) {
      setErrors("Please use a valid email provider (Gmail, Yahoo, Outlook, etc.)");
      return;
    }

    // Check for Common typos
    const commonTypos = {
      "gmial.com": "gmail.com",
      "gmai.com": "gmail.com",
      "yahooo.com": "yahoo.com",
      "outloo.com": "outlook.com",
      "yaho.com": "yahoo.com",
    };

    if (commonTypos[domain]) {
      setErrors(`Did you mean ${inputEmail.replace(domain, commonTypos[domain])}?`);
      return;
    }

    setIsValidating(true);

    try {
      // Call parent handler to verify email and send OTP
      // Backend will handle:
      // 1. Check if email already exists
      // 2. Generate 6-digit OTP
      // 3. Store OTP in temp session (expires in 5 minutes)
      // 4. Send email via Gmail SMTP
      // 5. Return success status
      await onEmailSubmit(inputEmail);
      toast.success(`OTP sent to ${inputEmail}`);
    } catch (error) {
      setErrors(error.message || "Failed to send OTP. Please try again.");
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 rounded-full p-4">
              <Mail size={32} className="text-blue-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
          <p className="text-gray-600 text-sm">
            Enter your email address to receive a one-time password (OTP)
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSendOTP} className="space-y-4">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="email"
                value={inputEmail}
                onChange={handleEmailChange}
                placeholder="you@example.com"
                disabled={isValidating || isLoading}
                className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition ${
                  errors
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 focus:border-blue-500 bg-white"
                } disabled:bg-gray-50 disabled:text-gray-400`}
              />
            </div>

            {/* Validation Messages */}
            {errors && (
              <div className="flex items-start gap-2 mt-2">
                <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{errors}</p>
              </div>
            )}

            {inputEmail && !errors && validateEmail(inputEmail) && (
              <div className="flex items-start gap-2 mt-2">
                <CheckCircle size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-600">Email looks good!</p>
              </div>
            )}
          </div>

          {/* Security Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-700 flex items-center gap-2">
              <span>🔒</span>
              <span>Your email is encrypted and never shared with third parties</span>
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!inputEmail || errors || isValidating || isLoading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
          >
            {isValidating || isLoading ? (
              <>
                <Loader size={18} className="animate-spin" />
                Sending OTP...
              </>
            ) : (
              <>
                Send OTP
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Info Text */}
        <p className="text-center text-xs text-gray-500 mt-6">
          We'll send a 6-digit code to your email. This code expires in 5 minutes.
        </p>
      </div>
    </div>
  );
};

export default EmailVerification;
