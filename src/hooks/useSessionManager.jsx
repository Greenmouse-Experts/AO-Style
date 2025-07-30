import { useState, useEffect, useCallback } from "react";
import sessionManager from "../services/SessionManager.js";

const useSessionManager = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [timeUntilExpiry, setTimeUntilExpiry] = useState(0);
  const [showExpiryModal, setShowExpiryModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Update authentication status
  const updateAuthStatus = useCallback(() => {
    const authenticated = sessionManager.isAuthenticated();
    const timeLeft = sessionManager.getTimeUntilRefreshExpiry();

    setIsAuthenticated(authenticated);
    setTimeUntilExpiry(timeLeft);
  }, []);

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
      if (event.type === "warning") {
        // This now means refresh token has expired and user is active
        setShowExpiryModal(true);
        setTimeUntilExpiry(0); // No time remaining since token is expired
      } else if (event.type === "logout") {
        setIsAuthenticated(false);
        setTimeUntilExpiry(0);
        setShowExpiryModal(false);
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
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [updateAuthStatus]);

  return {
    isAuthenticated,
    timeUntilExpiry,
    showExpiryModal,
    isRefreshing,
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
