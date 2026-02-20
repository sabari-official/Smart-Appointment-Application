import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, AlertCircle, CheckCircle, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import PasswordStrengthIndicator from "../../components/auth/PasswordStrengthIndicator";
import toast from "react-hot-toast";
import Footer from "../../components/common/Footer";

const PROVIDER_DOMAINS = [
  { value: "doctor", label: "👨‍⚕️ Doctor" },
  { value: "psychiatrist", label: "🧠 Psychiatrist" },
  { value: "businessman", label: "💼 Businessman" },
  { value: "automobiles", label: "🚗 Automobiles Works" },
];

const ACCOUNT_TYPE = {
  CUSTOMER: "customer",
  PROVIDER: "provider",
};

const RegisterV2 = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep] = useState("account-type"); // account-type -> personal-info -> email-verification
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: ACCOUNT_TYPE.CUSTOMER,
    domain: "",
    termsAccepted: false,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Email validation regex
  const validateEmail = (emailString) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailString);
  };

  // Password validation
  const validatePassword = (pwd) => {
    return (
      pwd.length >= 8 &&
      /[A-Z]/.test(pwd) &&
      /[a-z]/.test(pwd) &&
      /\d/.test(pwd) &&
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)
    );
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validatePersonalInfo = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!validatePassword(formData.password)) {
      newErrors.password = "Password must meet all requirements";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (formData.role === ACCOUNT_TYPE.PROVIDER && !formData.domain) {
      newErrors.domain = "Please select your professional domain";
    }

    if (!formData.termsAccepted) {
      newErrors.terms = "You must accept the terms & conditions";
    }

    return newErrors;
  };

  const handleAccountTypeSelect = (type) => {
    setFormData({ ...formData, role: type });
    setStep("personal-info");
  };

  const handleNext = (e) => {
    e.preventDefault();
    const newErrors = validatePersonalInfo();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Proceed to email verification
    navigate("/verify-email", {
      state: {
        email: formData.email,
        name: formData.name,
        role: formData.role,
        domain: formData.domain,
        registrationData: formData,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            DocBook
          </Link>
          <div className="space-x-4">
            <Link
              to="/login"
              className="text-gray-700 hover:text-blue-600 font-medium transition"
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {/* Step 1: Account Type Selection */}
        {step === "account-type" && (
          <div className="w-full max-w-lg">
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h1>
                <p className="text-gray-600">Choose your account type to get started</p>
              </div>

              <div className="space-y-4">
                {/* Customer Option */}
                <button
                  onClick={() => handleAccountTypeSelect(ACCOUNT_TYPE.CUSTOMER)}
                  className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">👤</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">Customer</h3>
                      <p className="text-sm text-gray-600 group-hover:text-blue-600">
                        Book appointments with healthcare providers and professionals
                      </p>
                    </div>
                    <ArrowRight
                      size={20}
                      className="text-gray-400 group-hover:text-blue-600 flex-shrink-0 mt-1"
                    />
                  </div>
                </button>

                {/* Provider Option */}
                <button
                  onClick={() => handleAccountTypeSelect(ACCOUNT_TYPE.PROVIDER)}
                  className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">💼</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">Provider</h3>
                      <p className="text-sm text-gray-600 group-hover:text-purple-600">
                        Offer your services and manage appointments with clients
                      </p>
                    </div>
                    <ArrowRight
                      size={20}
                      className="text-gray-400 group-hover:text-purple-600 flex-shrink-0 mt-1"
                    />
                  </div>
                </button>
              </div>

              <p className="text-center text-sm text-gray-600 mt-8">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Personal Information */}
        {step === "personal-info" && (
          <div className="w-full max-w-lg">
            <button
              onClick={() => setStep("account-type")}
              className="mb-4 text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2"
            >
              ← Back
            </button>

            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {formData.role === ACCOUNT_TYPE.CUSTOMER ? "Register as Customer" : "Register as Provider"}
                </h1>
                <p className="text-gray-600">Complete your registration details</p>
              </div>

              <form onSubmit={handleNext} className="space-y-5">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition ${
                      errors.name
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200 focus:border-blue-500"
                    }`}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle size={14} /> {errors.name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="you@example.com"
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition ${
                      errors.email
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200 focus:border-blue-500"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle size={14} /> {errors.email}
                    </p>
                  )}
                  {formData.email && !errors.email && validateEmail(formData.email) && (
                    <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                      <CheckCircle size={14} /> Email looks good!
                    </p>
                  )}
                </div>

                {/* Password Strength Indicator */}
                <PasswordStrengthIndicator
                  password={formData.password}
                  onChange={(pwd) => handleInputChange({ target: { name: "password", value: pwd } })}
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.password}
                  </p>
                )}

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition ${
                      errors.confirmPassword
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200 focus:border-blue-500"
                    }`}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle size={14} /> {errors.confirmPassword}
                    </p>
                  )}
                  {formData.password &&
                    formData.confirmPassword &&
                    formData.password === formData.confirmPassword &&
                    !errors.confirmPassword && (
                      <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                        <CheckCircle size={14} /> Passwords match!
                      </p>
                    )}
                </div>

                {/* Provider Domain Selection */}
                {formData.role === ACCOUNT_TYPE.PROVIDER && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Professional Domain
                    </label>
                    <select
                      name="domain"
                      value={formData.domain}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition ${
                        errors.domain
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200 focus:border-blue-500"
                      }`}
                    >
                      <option value="">Select your domain...</option>
                      {PROVIDER_DOMAINS.map((domain) => (
                        <option key={domain.value} value={domain.value}>
                          {domain.label}
                        </option>
                      ))}
                    </select>
                    {errors.domain && (
                      <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle size={14} /> {errors.domain}
                      </p>
                    )}
                  </div>
                )}

                {/* Terms & Conditions */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="termsAccepted"
                    checked={formData.termsAccepted}
                    onChange={handleInputChange}
                    className={`mt-1 ${errors.terms ? "accent-red-600" : "accent-blue-600"}`}
                  />
                  <label className="text-sm text-gray-700">
                    I agree to DocBook's{" "}
                    <Link to="/terms" className="text-blue-600 hover:text-blue-700 font-semibold">
                      Terms & Conditions
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="text-blue-600 hover:text-blue-700 font-semibold">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                {errors.terms && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.terms}
                  </p>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                >
                  {isLoading ? "Processing..." : "Continue to Email Verification"}
                  {!isLoading && <ArrowRight size={18} />}
                </button>
              </form>

              <p className="text-center text-sm text-gray-600 mt-6">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default RegisterV2;
