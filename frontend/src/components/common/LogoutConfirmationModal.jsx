import React from "react";
import { AlertCircle, LogOut, X } from "lucide-react";

const LogoutConfirmationModal = ({ isOpen, onConfirm, onCancel, isLoading = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 animate-scale-up">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="bg-red-100 rounded-full p-4">
            <AlertCircle size={32} className="text-red-600" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Logout?</h2>

        {/* Message */}
        <p className="text-center text-gray-600 text-sm mb-6">
          Are you sure you want to logout from your account? You'll need to login again to access your dashboard.
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:bg-gray-100 disabled:opacity-50 rounded-lg font-semibold transition flex items-center justify-center gap-2"
          >
            <X size={18} />
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-red-600 text-white hover:bg-red-700 disabled:bg-red-600 disabled:opacity-50 rounded-lg font-semibold transition flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            {isLoading ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmationModal;
