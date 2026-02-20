import apiClient from "./apiClient";

// ============================================
// AUTH SERVICE
// ============================================
export const authService = {
  register: async (data) => {
    const response = await apiClient.post("/auth/register", data);
    return response.data;
  },

  verifyOTP: async (email, otp) => {
    const response = await apiClient.post("/auth/verify-otp", { email, code: otp });
    return response.data;
  },

  login: async (credential, password) => {
    const isEmail = credential.includes("@");
    const data = isEmail
      ? { email: credential, password }
      : { username: credential, password };
    const response = await apiClient.post("/auth/login", data);
    return response.data;
  },

  sendOTP: async (email) => {
    const response = await apiClient.post("/auth/send-otp", { email });
    return response.data;
  },

  resendOTP: async (email) => {
    const response = await apiClient.post("/auth/resend-otp", { email });
    return response.data;
  },

  validateEmail: async (email) => {
    const response = await apiClient.post("/auth/validate-email", { email });
    return response.data;
  },

  googleAuth: async (idToken, role, termsAccepted) => {
    const response = await apiClient.post("/auth/google", {
      idToken,
      role,
      termsAccepted,
    });
    return response.data;
  },

  getGoogleAuthStatus: async () => {
    const response = await apiClient.get("/auth/google/status");
    return response.data;
  },
};

// ============================================
// PROFILE SERVICE
// ============================================
export const profileService = {
  getProfile: async () => {
    const response = await apiClient.get("/profile");
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await apiClient.put("/profile", data);
    return response.data;
  },

  // Legacy methods for backward compatibility
  updateCustomerProfile: async (data) => {
    const response = await apiClient.put("/profile", data);
    return response.data;
  },

  getCustomerProfile: async () => {
    const response = await apiClient.get("/profile");
    return response.data;
  },

  updateProviderProfile: async (data) => {
    const response = await apiClient.put("/profile", data);
    return response.data;
  },

  getProviderProfile: async () => {
    const response = await apiClient.get("/profile");
    return response.data;
  },
};

// ============================================
// CUSTOMER SERVICE
// ============================================
export const customerService = {
  getProviders: async (filters = {}) => {
    const response = await apiClient.get("/customer/providers", { params: filters });
    return response.data;
  },

  getProviderSlots: async (providerId) => {
    const response = await apiClient.get(`/customer/slots/${providerId}`);
    return response.data;
  },

  bookAppointment: async (data) => {
    const response = await apiClient.post("/customer/book", data);
    return response.data;
  },

  getAppointments: async (status) => {
    const params = {};
    if (status && status !== "all") params.status = status;
    const response = await apiClient.get("/customer/appointments", { params });
    return response.data;
  },

  rescheduleAppointment: async (appointmentId, data) => {
    const response = await apiClient.put(
      `/customer/appointments/${appointmentId}/reschedule`,
      data
    );
    return response.data;
  },

  cancelAppointment: async (appointmentId) => {
    const response = await apiClient.put(
      `/customer/appointments/${appointmentId}/cancel`
    );
    return response.data;
  },

  confirmAppointment: async (appointmentId) => {
    const response = await apiClient.put(
      `/customer/appointments/${appointmentId}/confirm`
    );
    return response.data;
  },

  submitReview: async (appointmentId, data) => {
    const response = await apiClient.post("/customer/review", {
      appointmentId,
      ...data,
    });
    return response.data;
  },

  getStats: async () => {
    const response = await apiClient.get("/customer/stats");
    return response.data;
  },

  getRecommendedProviders: async (limit = 10) => {
    const response = await apiClient.get("/customer/recommended-providers", {
      params: { limit },
    });
    return response.data;
  },
};

// ============================================
// PROVIDER SERVICE
// ============================================
export const providerService = {
  createSlot: async (data) => {
    const response = await apiClient.post("/provider/slots", data);
    return response.data;
  },

  // Alias
  createSlots: async (data) => {
    const response = await apiClient.post("/provider/slots", data);
    return response.data;
  },

  getSlots: async () => {
    const response = await apiClient.get("/provider/slots");
    return response.data;
  },

  updateSlot: async (slotId, data) => {
    const response = await apiClient.put(`/provider/slots/${slotId}`, data);
    return response.data;
  },

  deleteSlot: async (slotId) => {
    const response = await apiClient.delete(`/provider/slots/${slotId}`);
    return response.data;
  },

  getAppointments: async (filters = {}) => {
    const response = await apiClient.get("/provider/appointments", {
      params: filters,
    });
    return response.data;
  },

  completeAppointment: async (appointmentId) => {
    const response = await apiClient.put(
      `/provider/appointments/${appointmentId}/complete`
    );
    return response.data;
  },

  getReviews: async () => {
    const response = await apiClient.get("/provider/reviews");
    return response.data;
  },

  getAppointedPatients: async () => {
    const response = await apiClient.get("/provider/appointed-patients");
    return response.data;
  },

  getServices: async () => {
    const response = await apiClient.get("/provider/services");
    return response.data;
  },

  createService: async (data) => {
    const response = await apiClient.post("/provider/services", data);
    return response.data;
  },

  updateService: async (serviceId, data) => {
    const response = await apiClient.put(`/provider/services/${serviceId}`, data);
    return response.data;
  },

  deleteService: async (serviceId) => {
    const response = await apiClient.delete(`/provider/services/${serviceId}`);
    return response.data;
  },
};

// ============================================
// ADMIN SERVICE
// ============================================
export const adminService = {
  getDashboardStats: async () => {
    const response = await apiClient.get("/admin/dashboard/stats");
    return response.data;
  },

  getDashboardActivity: async () => {
    const response = await apiClient.get("/admin/dashboard/activity");
    return response.data;
  },

  getAllUsers: async (filters = {}) => {
    const response = await apiClient.get("/admin/users", { params: filters });
    return response.data;
  },

  getAllProviders: async (filters = {}) => {
    const response = await apiClient.get("/admin/providers", { params: filters });
    return response.data;
  },

  getAllAppointments: async (filters = {}) => {
    const response = await apiClient.get("/admin/appointments", { params: filters });
    return response.data;
  },

  getCancelledAppointments: async () => {
    const response = await apiClient.get("/admin/appointments/cancelled");
    return response.data;
  },

  suspendUser: async (userId) => {
    const response = await apiClient.post("/admin/suspend", { userId });
    return response.data;
  },

  unsuspendUser: async (userId) => {
    const response = await apiClient.post("/admin/unsuspend", { userId });
    return response.data;
  },

  updateUserStatus: async (userId, status) => {
    const response = await apiClient.put(`/admin/users/${userId}/status`, {
      status,
    });
    return response.data;
  },

  toggleProviderSuspension: async (providerId) => {
    const response = await apiClient.put(
      `/admin/providers/${providerId}/toggle-suspension`
    );
    return response.data;
  },

  resetSystem: async (password) => {
    const response = await apiClient.post("/admin/reset-system", { password });
    return response.data;
  },

  verifyResetPassword: async (password) => {
    const response = await apiClient.post("/admin/verify-reset-password", {
      password,
    });
    return response.data;
  },

  getNotifications: async (limit = 10, skip = 0) => {
    const response = await apiClient.get("/admin/notifications", {
      params: { limit, skip },
    });
    return response.data;
  },
};

// ============================================
// AI SERVICE
// ============================================
export const aiService = {
  chat: async (message) => {
    const response = await apiClient.post("/ai/chat", { message });
    return response.data;
  },

  recommendProviders: async (query) => {
    const response = await apiClient.get("/ai/recommend-provider", {
      params: { query },
    });
    return response.data;
  },

  generateEmail: async (data) => {
    const response = await apiClient.post("/ai/generate-email", data);
    return response.data;
  },

  generateKeywords: async () => {
    const response = await apiClient.post("/ai/generate-keywords");
    return response.data;
  },

  analyzeProvider: async (providerId) => {
    const response = await apiClient.get("/ai/analyze-provider", {
      params: { providerId },
    });
    return response.data;
  },

  adminChat: async (query) => {
    const response = await apiClient.post("/ai/admin-chat", { query });
    return response.data;
  },

  healthCheck: async () => {
    const response = await apiClient.get("/ai/health");
    return response.data;
  },
};

// ============================================
// NOTIFICATION SERVICE
// ============================================
export const notificationService = {
  getNotifications: async (unreadOnly = false) => {
    const response = await apiClient.get("/notifications", {
      params: { unreadOnly },
    });
    return response.data;
  },

  markAsRead: async (notificationId) => {
    const response = await apiClient.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await apiClient.put("/notifications/read-all");
    return response.data;
  },

  deleteNotification: async (notificationId) => {
    const response = await apiClient.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  clearAll: async () => {
    const response = await apiClient.delete("/notifications/clear-all");
    return response.data;
  },
};

// ============================================
// PUBLIC SERVICE
// ============================================
export const publicService = {
  getStatistics: async () => {
    const response = await apiClient.get("/public/statistics");
    return response.data;
  },
};
