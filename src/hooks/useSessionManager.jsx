import { useState, useEffect, useCallback } from "react";
import sessionManager from "../services/SessionManager.js";

const useSessionManager = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [timeUntilExpiry, setTimeUntilExpiry] = useState(0);
  const [showExpiryModal, setShowExpiryModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sessionModalType, setSessionModalType] = useState(null);

  // Update authentication status
  const updateAuthStatus = useCallback(() => {
    const authenticated = sessionManager.isAuthenticated();
    const accessTokenTime = sessionManager.getTimeUntilAccessTokenExpiry();
    const refreshTokenTime = sessionManager.getTimeUntilRefreshExpiry();

    // Use the shorter of the two times
    const timeLeft = Math.min(accessTokenTime, refreshTokenTime);

    setIsAuthenticated(authenticated);
    setTimeUntilExpiry(timeLeft);

    // If not authenticated and modal is open, close it
    if (!authenticated && showExpiryModal) {
      setShowExpiryModal(false);
      setSessionModalType(null);
    }
  }, [showExpiryModal]);

  // Set authentication data
  const setAuthData = useCallback(
    (data) => {
      sessionManager.setAuthData(data);
      updateAuthStatus();
    },
    [updateAuthStatus],
  );

  // Get authentication data
  const getAuthData = useCallback(() => {
    return sessionManager.getAuthData();
  }, []);

  // Refresh access token
  const refreshAccessToken = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const result = await sessionManager.refreshAccessToken();
      updateAuthStatus();
      return result;
    } finally {
      setIsRefreshing(false);
    }
  }, [updateAuthStatus]);

  // Handle logout
  const logout = useCallback(() => {
    sessionManager.performLogout();
    setIsAuthenticated(false);
    setTimeUntilExpiry(0);
    setShowExpiryModal(false);
  }, []);

  // Clear authentication data
  const clearAuthData = useCallback(() => {
    sessionManager.clearAuthData();
    updateAuthStatus();
  }, [updateAuthStatus]);

  // Handle session refresh when token has expired
  const extendSession = useCallback(async () => {
    // When refresh token is expired, we can't actually refresh
    // This will redirect to login
    sessionManager.performLogout();
    setShowExpiryModal(false);
    setIsAuthenticated(false);
    setTimeUntilExpiry(0);
  }, []);

  // Handle forced logout (when user chooses "Login Again")
  const handleForcedLogout = useCallback(() => {
    setShowExpiryModal(false);
    logout();
  }, [logout]);

  // Handle session expiry events
  useEffect(() => {
    const handleSessionEvent = (event) => {
      console.log("🔔 useSessionManager: Received session event", event);

      if (event.type === "access_token_warning") {
        // Access token expiring soon (no refresh available)
        setSessionModalType("access_token_warning");
        setShowExpiryModal(true);
        setTimeUntilExpiry(event.timeRemaining || 0);
      } else if (event.type === "refresh_token_warning") {
        // Refresh token expiring soon
        setSessionModalType("refresh_token_warning");
        setShowExpiryModal(true);
        setTimeUntilExpiry(event.timeRemaining || 0);
      } else if (event.type === "refresh_token_expired") {
        // Refresh token has expired
        setSessionModalType("refresh_token_expired");
        setShowExpiryModal(true);
        setTimeUntilExpiry(0);
      } else if (event.type === "logout") {
        // Forced logout
        console.log("🚪 useSessionManager: Logout event received");
        setIsAuthenticated(false);
        setTimeUntilExpiry(0);
        setShowExpiryModal(false);
        setSessionModalType(null);
      }
    };

    const unsubscribe = sessionManager.onSessionExpiry(handleSessionEvent);
    return unsubscribe;
  }, []);

  // Set up periodic status updates
  useEffect(() => {
    updateAuthStatus();

    const interval = setInterval(() => {
      updateAuthStatus();
    }, 15000); // Update every 15 seconds for better responsiveness

    return () => clearInterval(interval);
  }, [updateAuthStatus]);

  // Auto-close modal after successful authentication
  useEffect(() => {
    if (isAuthenticated && showExpiryModal) {
      setShowExpiryModal(false);
      setSessionModalType(null);
    }
  }, [isAuthenticated, showExpiryModal]);

  return {
    isAuthenticated,
    timeUntilExpiry,
    showExpiryModal,
    isRefreshing,
    sessionModalType,
    setAuthData,
    getAuthData,
    refreshAccessToken,
    logout,
    clearAuthData,
    extendSession,
    closeExpiryModal: handleForcedLogout,
  };
};

export default useSessionManager;
