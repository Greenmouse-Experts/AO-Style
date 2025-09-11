import { useEffect } from "react";
import sessionManager from "../services/SessionManager";

const useUniversalSessionTimeout = (userType = null, userData = null) => {
  // Update session manager with user data when available
  useEffect(() => {
    if (userData && userType) {
      const authData = sessionManager.getAuthData();
      if (authData) {
        sessionManager.setAuthData({
          ...authData,
          user: userData,
          userType: userType,
        });
        console.log(`🔒 useUniversalSessionTimeout: Updated session for ${userType}`, {
          userId: userData?.id,
          email: userData?.email,
        });
      }
    }
  }, [userData, userType]);

  // Set up activity monitoring
  useEffect(() => {
    const activityEvents = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
      "focus",
      "blur"
    ];

    const handleActivity = () => {
      sessionManager.updateActivity();
    };

    // Add event listeners for activity tracking
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Track page visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        sessionManager.updateActivity();
        // Check session status when page becomes visible
        const authData = sessionManager.getAuthData();
        if (authData) {
          sessionManager.handleSessionExpiry();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Set up periodic session checks
  useEffect(() => {
    const checkSession = () => {
      const authData = sessionManager.getAuthData();
      if (!authData) return;

      // Force session expiry check
      sessionManager.handleSessionExpiry();
    };

    // Check immediately on mount
    checkSession();

    // Set up interval for periodic checks
    const intervalId = setInterval(checkSession, 30000); // Every 30 seconds

    return () => clearInterval(intervalId);
  }, []);

  // Monitor authentication status
  useEffect(() => {
    const isAuthenticated = sessionManager.isAuthenticated();

    if (!isAuthenticated) {
      console.log("🔍 useUniversalSessionTimeout: User no longer authenticated");

      // Check if we're on a protected route
      const currentPath = window.location.pathname;
      const protectedRoutes = ["/admin", "/fabric", "/tailor", "/logistics", "/sales"];
      const isOnProtectedRoute = protectedRoutes.some(route =>
        currentPath.includes(route)
      );

      if (isOnProtectedRoute && !currentPath.includes("/login")) {
        console.log("🚪 useUniversalSessionTimeout: On protected route without auth, redirecting");
        sessionManager.performLogout();
      }
    }
  }, []);

  // Handle browser tab/window events
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log("🔍 useUniversalSessionTimeout: Page unloading");
    };

    const handleUnload = () => {
      console.log("🧹 useUniversalSessionTimeout: Page unloaded");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("unload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("unload", handleUnload);
    };
  }, []);

  return {
    // Return useful session information
    isAuthenticated: sessionManager.isAuthenticated(),
    timeUntilAccessTokenExpiry: sessionManager.getTimeUntilAccessTokenExpiry(),
    timeUntilRefreshExpiry: sessionManager.getTimeUntilRefreshExpiry(),
    forceLogout: () => sessionManager.performLogout(),
    updateActivity: () => sessionManager.updateActivity(),
  };
};

export default useUniversalSessionTimeout;
