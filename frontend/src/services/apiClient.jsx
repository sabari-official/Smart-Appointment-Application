import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      // Token expired or invalid
      if (status === 401) {
        const currentPath = window.location.pathname;
        // Don't redirect if already on login/register/public pages
        const publicPaths = ["/", "/login", "/register", "/about", "/services", "/terms", "/privacy", "/verify-email"];
        if (!publicPaths.includes(currentPath)) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
      }

      // Profile incomplete redirect
      if (status === 403 && data?.redirectTo === "/complete-profile") {
        const currentPath = window.location.pathname;
        if (currentPath !== "/complete-profile") {
          window.location.href = "/complete-profile";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
