import React, { useEffect, useCallback } from "react";
import useSessionManager from "../hooks/useSessionManager";
import SessionExpiryModal from "./SessionExpiryModal";
import sessionManager from "../services/SessionManager";

const UniversalSessionTimeout = ({ userType = null, userData = null }) => {
  const {
    showExpiryModal,
    timeUntilExpiry,
    isRefreshing,
    sessionModalType,
    extendSession,
    closeExpiryModal,
    isAuthenticated,
  } = useSessionManager();

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
        console.log(`🔒 UniversalSessionTimeout: Updated session for ${userType}`, {
          userId: userData?.id,
          email: userData?.email,
        });
      }
    }
  }, [userData, userType]);

  // Handle automatic logout on session expiry
  const handleLogout = useCallback(() => {
    console.log("🚪 UniversalSessionTimeout: Handling logout");
    sessionManager.performLogout();
  }, []);

  // Handle session extension (for future use if needed)
  const handleExtendSession = useCallback(async () => {
    console.log("🔄 UniversalSessionTimeout: Attempting session extension");
    try {
      const refreshResult = await sessionManager.refreshAccessToken();
      if (!refreshResult) {
        console.log("❌ UniversalSessionTimeout: Extension failed, logging out");
        handleLogout();
      }
    } catch (error) {
      console.error("❌ UniversalSessionTimeout: Extension error", error);
      handleLogout();
    }
  }, [handleLogout]);

  // Monitor for authentication changes
  useEffect(() => {
    if (!isAuthenticated) {
      console.log("🔍 UniversalSessionTimeout: User no longer authenticated");

      // Check if we're on a protected route
      const currentPath = window.location.pathname;
      const protectedRoutes = ["/admin", "/fabric", "/tailor", "/logistics", "/sales"];
      const isOnProtectedRoute = protectedRoutes.some(route =>
        currentPath.includes(route)
      );

      if (isOnProtectedRoute && !currentPath.includes("/login")) {
        console.log("🚪 UniversalSessionTimeout: On protected route without auth, redirecting");
        handleLogout();
      }
    }
  }, [isAuthenticated, handleLogout]);

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

  // Handle browser tab/window close
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      // Don't actually prevent unload, just log
      console.log("🔍 UniversalSessionTimeout: Page unloading");
    };

    const handleUnload = () => {
      // Clean up session data if needed
      console.log("🧹 UniversalSessionTimeout: Page unloaded");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("unload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("unload", handleUnload);
    };
  }, []);

  // Debug logging in development
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      const logInterval = setInterval(() => {
        const authData = sessionManager.getAuthData();
        if (authData) {
          console.log("🔍 UniversalSessionTimeout: Session status", {
            userType,
            isAuthenticated,
            accessTokenTimeLeft: sessionManager.getTimeUntilAccessTokenExpiry(),
            refreshTokenTimeLeft: sessionManager.getTimeUntilRefreshExpiry(),
            showExpiryModal,
            sessionModalType,
          });
        }
      }, 60000); // Every minute

      return () => clearInterval(logInterval);
    }
  }, [userType, isAuthenticated, showExpiryModal, sessionModalType]);

  return (
    <>
      {/* Session Expiry Modal */}
      <SessionExpiryModal
        isOpen={showExpiryModal}
        onExtendSession={handleExtendSession}
        onLogout={closeExpiryModal}
        timeRemaining={timeUntilExpiry}
        isRefreshing={isRefreshing}
        sessionModalType={sessionModalType}
      />

      {/* Development Debug Info */}
      {process.env.NODE_ENV === "development" && showExpiryModal && (
        <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-300 rounded-lg p-3 text-xs z-[10000]">
          <div className="font-bold text-yellow-800 mb-1">Session Debug</div>
          <div className="text-yellow-700">
            Type: {sessionModalType}<br/>
            Time: {timeUntilExpiry}s<br/>
            User: {userType}<br/>
            Auth: {isAuthenticated ? "Yes" : "No"}
          </div>
        </div>
      )}
    </>
  );
};

export default UniversalSessionTimeout;
