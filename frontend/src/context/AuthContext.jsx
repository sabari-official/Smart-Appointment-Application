import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { profileService } from "../services/apiService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [profileComplete, setProfileComplete] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      try {
        const savedUser = localStorage.getItem("user");
        if (savedUser && savedUser !== "undefined" && savedUser !== "null") {
          const parsed = JSON.parse(savedUser);
          setUser(parsed);
          setProfileComplete(!!parsed.profileCompleted);
        }
      } catch (error) {
        console.error("Error loading user:", error);
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  // Check profile completeness when user changes
  const checkProfileComplete = useCallback(async () => {
    if (!token || !user) return;
    if (user.role === "admin") {
      setProfileComplete(true);
      return;
    }

    try {
      const result = await profileService.getProfile();
      if (result.success && result.data) {
        const isComplete = !!result.data.isComplete;
        setProfileComplete(isComplete);

        // Update localStorage
        const updatedUser = { ...user, profileCompleted: isComplete };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error("Profile check error:", err);
    }
  }, [token, user]);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem("token", authToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setProfileComplete(!!userData.profileCompleted);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setProfileComplete(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const updateProfile = (updatedData) => {
    const updated = { ...user, ...updatedData };
    setUser(updated);
    localStorage.setItem("user", JSON.stringify(updated));
    if (updatedData.profileCompleted !== undefined) {
      setProfileComplete(updatedData.profileCompleted);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        updateProfile,
        profileComplete,
        checkProfileComplete,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
