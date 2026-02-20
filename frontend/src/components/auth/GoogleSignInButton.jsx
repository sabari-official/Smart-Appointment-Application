import React from "react";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const GoogleSignInButton = ({ userRole = "customer", onSuccess = null }) => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (codeResponse) => {
    try {
      // The codeResponse contains the credential (ID token) directly
      // When using response_type: 'id_token', the credential is the ID token
      const idToken = codeResponse.credential;

      if (!idToken) {
        throw new Error('No ID token received from Google');
      }

      // Send ID token to backend for verification and login/registration
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/google`, {
        idToken,
        role: userRole,
        termsAccepted: true,
      });

      if (response.data.success) {
        const { user, token } = response.data.data;

        // Save to localStorage
        login(user, token);

        toast.success(`✅ Welcome ${user.name}! ${user.profileCompleted ? 'Logged in successfully.' : 'Complete your profile to continue.'}`);

        // Call custom callback if provided
        if (onSuccess) {
          onSuccess(user);
        } else {
          // Redirect based on profile completion
          if (user.profileCompleted) {
            navigate(user.role === 'provider' ? '/provider-dashboard' : '/customer-dashboard');
          } else {
            navigate("/complete-profile");
          }
        }
      } else {
        toast.error(`❌ ${response.data.message || 'Google authentication failed'}`);
      }
    } catch (error) {
      console.error("Error with Google authentication:", error);
      
      // Provide specific error messages
      if (error.response?.status === 401) {
        toast.error(
          "❌ Google authentication failed.\n" +
          "Possible causes:\n" +
          "1. Invalid Google ID token\n" +
          "2. Expired token - please try again"
        );
      } else if (error.response?.status === 400) {
        toast.error(`❌ ${error.response.data.message || 'Invalid request'}`);
      } else {
        toast.error("Failed to sign in with Google. Please try again.");
      }
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: (error) => {
      console.error("Google Login Error:", error);
      
      // Check for specific error types
      if (error?.error === "invalid_client") {
        toast.error(
          "❌ Error 401: invalid_client\n" +
          "Your Google Client ID is not configured correctly.\n" +
          "Please check your Google Cloud Console settings."
        );
      } else if (error?.error === "popup_closed_by_user") {
        toast.error("Sign-in cancelled by user");
      } else {
        toast.error(`Google Sign-In failed: ${error?.error || "Unknown error"}`);
      }
    },
    flow: "implicit",
    select_account: true,
  });

  return (
    <button
      onClick={() => googleLogin()}
      className="w-full flex items-center justify-center gap-3 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold text-gray-700"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 c0-3.331,2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.461,2.268,15.365,1.25,12.545,1.25 c-6.343,0-11.5,5.157-11.5,11.5c0,6.343,5.157,11.5,11.5,11.5c6.343,0,11.5-5.157,11.5-11.5C23.545,13.75,21.738,11.733,12.545,10.239z"
        />
      </svg>
      Sign in with Google
    </button>
  );
};

export default GoogleSignInButton;
