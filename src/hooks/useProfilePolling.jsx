import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import AuthService from "../services/api/auth";
import sessionManager from "../services/SessionManager";

/**
 * Hook that polls user profile every 1 minute
 * Automatically logs out user if 401 error is detected (account deleted)
 */
const useProfilePolling = () => {
  const isAdminRoute = window.location.pathname.includes("/admin");
  const tokenKey = isAdminRoute ? "adminToken" : "token";
  const token = Cookies.get(tokenKey);
  const hasLoggedOutRef = useRef(false);

  // Poll user profile every 1 minute (60000ms)
  const { error } = useQuery({
    queryKey: ["profile-polling"],
    queryFn: async () => {
      if (!token) {
        return null;
      }
      const response = await AuthService.GetUser();
      return response?.data?.data;
    },
    enabled: !!token && !hasLoggedOutRef.current, // Only poll if token exists and we haven't logged out
    refetchInterval: 60000, // Poll every 1 minute (60000ms)
    refetchIntervalInBackground: true, // Continue polling even when tab is in background
    retry: (failureCount, error) => {
      // Don't retry if it's a 401 error (unauthorized - account deleted)
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 1; // Only retry once for other errors
    },
  });

  // Handle 401 errors and logout
  useEffect(() => {
    if (error?.response?.status === 401 && !hasLoggedOutRef.current) {
      console.log("🚨 Profile Polling: 401 Unauthorized - Account deleted. Logging out...");
      
      // Prevent multiple logout attempts
      hasLoggedOutRef.current = true;

      // Perform logout
      try {
        sessionManager.performLogout();
        console.log("✅ Profile Polling: User logged out successfully");
      } catch (logoutError) {
        console.error("❌ Profile Polling: Error during logout", logoutError);
      }
    }
  }, [error]);

  // Reset logout flag if token changes (user logs in again)
  useEffect(() => {
    if (!token) {
      hasLoggedOutRef.current = false;
    }
  }, [token]);
};

export default useProfilePolling;

