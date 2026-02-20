import React, { useState, useEffect } from "react";
import { Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";

const PasswordStrengthIndicator = ({ password, onChange, disabled = false }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState({
    score: 0,
    level: "weak",
    message: "",
    checks: {
      minLength: false,
      hasUppercase: false,
      hasLowercase: false,
      hasNumbers: false,
      hasSpecial: false,
      noCommonPatterns: true,
    },
  });

  // Common weak password patterns
  const commonPatterns = [
    "password",
    "123456",
    "qwerty",
    "admin",
    "user",
    "test",
    "123123",
    "000000",
    "111111",
  ];

  // Calculate password strength
  useEffect(() => {
    const pwd = password || "";
    const checks = {
      minLength: pwd.length >= 8,
      hasUppercase: /[A-Z]/.test(pwd),
      hasLowercase: /[a-z]/.test(pwd),
      hasNumbers: /\d/.test(pwd),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
      noCommonPatterns: !commonPatterns.some(
        (pattern) =>
          pwd.toLowerCase().includes(pattern) || pwd.includes(pattern.toUpperCase())
      ),
    };

    let score = 0;
    let message = "";

    if (pwd.length === 0) {
      message = "Enter a password";
    } else {
      if (checks.minLength) score++;
      if (checks.hasUppercase) score++;
      if (checks.hasLowercase) score++;
      if (checks.hasNumbers) score++;
      if (checks.hasSpecial) score++;
      if (checks.noCommonPatterns) score++;

      // Determine level
      if (score <= 2) {
        message = "Weak password";
      } else if (score <= 4) {
        message = "Fair password";
      } else if (score < 6) {
        message = "Good password";
      } else {
        message = "Strong password";
      }
    }

    setStrength({
      score,
      level: score <= 2 ? "weak" : score <= 4 ? "fair" : score < 6 ? "good" : "strong",
      message,
      checks,
    });
  }, [password]);

  const getStrengthColor = () => {
    switch (strength.level) {
      case "weak":
        return "text-red-600";
      case "fair":
        return "text-orange-600";
      case "good":
        return "text-yellow-600";
      case "strong":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const getStrengthBgColor = () => {
    switch (strength.level) {
      case "weak":
        return "bg-red-100";
      case "fair":
        return "bg-orange-100";
      case "good":
        return "bg-yellow-100";
      case "strong":
        return "bg-green-100";
      default:
        return "bg-gray-100";
    }
  };

  return (
    <div className="space-y-4">
      {/* Password Input */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder="Create a strong password"
            className="w-full pr-10 pl-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-50"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={disabled}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:text-gray-300"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Strength Indicator */}
      {password && (
        <>
          {/* Strength Bar */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-semibold text-gray-700">Strength</p>
              <p className={`text-sm font-bold ${getStrengthColor()}`}>
                {strength.message}
              </p>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  strength.level === "weak"
                    ? "w-1/4 bg-red-500"
                    : strength.level === "fair"
                    ? "w-2/4 bg-orange-500"
                    : strength.level === "good"
                    ? "w-3/4 bg-yellow-500"
                    : "w-full bg-green-500"
                }`}
              ></div>
            </div>
          </div>

          {/* Requirements Checklist */}
          <div className={`${getStrengthBgColor()} rounded-lg p-4 space-y-2`}>
            <p className="text-xs font-semibold text-gray-700 mb-3">
              Password Requirements:
            </p>

            {/* Min Length */}
            <div className="flex items-center gap-2">
              {strength.checks.minLength ? (
                <CheckCircle size={16} className="text-green-600" />
              ) : (
                <AlertCircle size={16} className="text-gray-400" />
              )}
              <span
                className={`text-xs ${
                  strength.checks.minLength ? "text-green-700" : "text-gray-600"
                }`}
              >
                At least 8 characters
              </span>
            </div>

            {/* Uppercase */}
            <div className="flex items-center gap-2">
              {strength.checks.hasUppercase ? (
                <CheckCircle size={16} className="text-green-600" />
              ) : (
                <AlertCircle size={16} className="text-gray-400" />
              )}
              <span
                className={`text-xs ${
                  strength.checks.hasUppercase ? "text-green-700" : "text-gray-600"
                }`}
              >
                One uppercase letter (A-Z)
              </span>
            </div>

            {/* Lowercase */}
            <div className="flex items-center gap-2">
              {strength.checks.hasLowercase ? (
                <CheckCircle size={16} className="text-green-600" />
              ) : (
                <AlertCircle size={16} className="text-gray-400" />
              )}
              <span
                className={`text-xs ${
                  strength.checks.hasLowercase ? "text-green-700" : "text-gray-600"
                }`}
              >
                One lowercase letter (a-z)
              </span>
            </div>

            {/* Numbers */}
            <div className="flex items-center gap-2">
              {strength.checks.hasNumbers ? (
                <CheckCircle size={16} className="text-green-600" />
              ) : (
                <AlertCircle size={16} className="text-gray-400" />
              )}
              <span
                className={`text-xs ${
                  strength.checks.hasNumbers ? "text-green-700" : "text-gray-600"
                }`}
              >
                One number (0-9)
              </span>
            </div>

            {/* Special Characters */}
            <div className="flex items-center gap-2">
              {strength.checks.hasSpecial ? (
                <CheckCircle size={16} className="text-green-600" />
              ) : (
                <AlertCircle size={16} className="text-gray-400" />
              )}
              <span
                className={`text-xs ${
                  strength.checks.hasSpecial ? "text-green-700" : "text-gray-600"
                }`}
              >
                One special character (!@#$%^&*)
              </span>
            </div>

            {/* No Common Patterns */}
            <div className="flex items-center gap-2">
              {strength.checks.noCommonPatterns ? (
                <CheckCircle size={16} className="text-green-600" />
              ) : (
                <AlertCircle size={16} className="text-red-600" />
              )}
              <span
                className={`text-xs ${
                  strength.checks.noCommonPatterns
                    ? "text-green-700"
                    : "text-red-600 font-semibold"
                }`}
              >
                Avoid common passwords
              </span>
            </div>
          </div>
        </>
      )}

      {/* Security Tips */}
      {password && strength.level !== "strong" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-700">
            💡 <strong>Tip:</strong> Use a mix of uppercase, lowercase, numbers, and special
            characters for a stronger password.
          </p>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;
