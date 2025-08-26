import Cookies from "js-cookie";
import AuthService from "./api/auth";

class SessionManager {
  constructor() {
    this.authData = null;
    this.sessionExpiryCallbacks = [];
    this.refreshPromise = null;
    this.warningShown = false;
    this.lastActivity = Date.now();
    this.isUserActive = true;
    this.monitoringInterval = null;
  }

  // Set authentication data from login response
  setAuthData(data) {
    this.authData = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      refreshTokenExpiry: data.refreshTokenExpiry,
      tokenExpiry: this.decodeTokenExpiry(data.accessToken),
      user: data.user,
      userType: data.userType,
    };

    // Store tokens in cookies
    const isAdminRoute = window.location.pathname.includes("/admin");
    const tokenKey = isAdminRoute ? "adminToken" : "token";

    Cookies.set(tokenKey, data.accessToken);
    if (data.refreshToken) {
      Cookies.set(`${tokenKey}_refresh`, data.refreshToken);
    }
    if (data.refreshTokenExpiry) {
      Cookies.set(`${tokenKey}_refresh_expiry`, data.refreshTokenExpiry);
    }

    this.warningShown = false;
    this.updateActivity();
    console.log("🔒 SessionManager: Auth data stored", {
      hasAccessToken: !!data.accessToken,
      hasRefreshToken: !!data.refreshToken,
      userType: data.userType,
      userId: data.user?.id,
    });
  }

  // Get stored authentication data
  getAuthData() {
    if (this.authData) {
      return this.authData;
    }

    // Try to restore from cookies
    const isAdminRoute = window.location.pathname.includes("/admin");
    const tokenKey = isAdminRoute ? "adminToken" : "token";

    const accessToken = Cookies.get(tokenKey);
    const refreshToken = Cookies.get(`${tokenKey}_refresh`);
    const refreshTokenExpiry = Cookies.get(`${tokenKey}_refresh_expiry`);

    if (accessToken) {
      this.authData = {
        accessToken,
        refreshToken,
        refreshTokenExpiry,
        tokenExpiry: this.decodeTokenExpiry(accessToken),
        user: null, // Will be populated by dashboard layout
        userType: null, // Will be populated by dashboard layout
      };
      console.log(
        "🔍 SessionManager: Retrieved auth data from cookies",
        this.authData,
      );
      return this.authData;
    }

    return null;
  }

  // Decode JWT token to get expiry time
  decodeTokenExpiry(token) {
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp ? payload.exp * 1000 : null; // Convert to milliseconds
    } catch (error) {
      console.error("❌ SessionManager: Error decoding token", error);
      return null;
    }
  }

  // Check if access token is expired
  isTokenExpired(token = null) {
    const authData = this.getAuthData();
    if (!authData) return true;

    const tokenToCheck = token || authData.accessToken;
    const expiry = this.decodeTokenExpiry(tokenToCheck);

    if (!expiry) return true;

    const now = Date.now();
    const isExpired = now >= expiry;

    return isExpired;
  }

  // Check if refresh token is expired
  isRefreshTokenExpired() {
    const authData = this.getAuthData();
    if (!authData) return true;

    // If no refresh token exists (like Google SSO), consider it as not expired
    // to allow the access token to be the primary auth mechanism
    if (!authData.refreshToken || !authData.refreshTokenExpiry) {
      console.log(
        "🔍 SessionManager: No refresh token, using access token only",
      );
      return false;
    }

    const now = Date.now();
    const expiry = new Date(authData.refreshTokenExpiry).getTime();

    return now >= expiry;
  }

  // Get time until access token expires (in seconds)
  getTimeUntilAccessTokenExpiry() {
    const authData = this.getAuthData();
    if (!authData || !authData.tokenExpiry) return 0;

    const now = Date.now();
    const timeLeft = Math.max(
      0,
      Math.floor((authData.tokenExpiry - now) / 1000),
    );

    return timeLeft;
  }

  // Get time until refresh token expires (in seconds)
  getTimeUntilRefreshExpiry() {
    const authData = this.getAuthData();
    if (!authData || !authData.refreshTokenExpiry) return 0;

    const now = Date.now();
    const expiry = new Date(authData.refreshTokenExpiry).getTime();
    const timeLeft = Math.max(0, Math.floor((expiry - now) / 1000));

    return timeLeft;
  }

  // Update user activity timestamp
  updateActivity() {
    this.lastActivity = Date.now();
    this.isUserActive = true;
  }

  // Check if user has been inactive for more than 5 minutes
  isUserInactive() {
    const inactiveTime = Date.now() - this.lastActivity;
    return inactiveTime > 5 * 60 * 1000; // 5 minutes
  }

  // Refresh access token using refresh token
  async refreshAccessToken() {
    const authData = this.getAuthData();
    if (!authData || !authData.refreshToken) {
      console.log(
        "❌ SessionManager: No refresh token available (Google SSO?)",
      );
      return false;
    }

    if (this.isRefreshTokenExpired()) {
      console.log("❌ SessionManager: Refresh token expired");
      return false;
    }

    // Prevent multiple simultaneous refresh attempts
    if (this.refreshPromise) {
      console.log("🔄 SessionManager: Refresh already in progress, waiting...");
      return await this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh();

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.refreshPromise = null;
    }
  }

  async performTokenRefresh() {
    try {
      console.log("🔄 SessionManager: Attempting to refresh token");

      const authData = this.getAuthData();
      const response = await AuthService.refreshToken({
        refresh_token: authData.refreshToken,
      });

      if (response.data) {
        console.log(
          "✅ SessionManager: Token refresh successful",
          response.data,
        );

        // Update stored auth data with new tokens
        this.setAuthData({
          accessToken: response.data.data.accessToken,
          refreshToken: response.data.refreshToken || authData.refreshToken,
          refreshTokenExpiry:
            response.data.refreshTokenExpiry || authData.refreshTokenExpiry,
          user: authData.user,
          userType: authData.userType,
        });

        return true;
      } else {
        console.log(
          "❌ SessionManager: Invalid refresh response",
          response.data,
        );
        return false;
      }
    } catch (error) {
      console.error("❌ SessionManager: Token refresh failed", error);
      return false;
    }
  }

  // Handle session expiry - improved logic for automatic logout
  async handleSessionExpiry() {
    const authData = this.getAuthData();
    if (!authData) return;

    const accessTokenTimeLeft = this.getTimeUntilAccessTokenExpiry();
    const refreshTokenTimeLeft = this.getTimeUntilRefreshExpiry();

    // For Google SSO (no refresh token) - check access token only
    if (!authData.refreshToken) {
      if (accessTokenTimeLeft <= 0) {
        console.log(
          "🚪 SessionManager: Google SSO access token expired, logging out",
        );
        this.performLogout();
        return;
      }

      // Show warning 5 minutes before expiry for Google SSO
      if (accessTokenTimeLeft <= 300 && !this.warningShown) {
        // 5 minutes
        console.log(
          "⚠️ SessionManager: Google SSO token expiring soon, showing warning",
        );
        this.warningShown = true;
        this.notifySessionExpiry("access_token_warning", accessTokenTimeLeft);
      }
      return;
    }

    // For normal auth with refresh tokens

    // Try to refresh access token if it's expired but refresh token is valid
    if (accessTokenTimeLeft <= 0 && refreshTokenTimeLeft > 0) {
      console.log(
        "🔄 SessionManager: Access token expired, attempting refresh",
      );
      const refreshSuccess = await this.refreshAccessToken();

      if (!refreshSuccess) {
        console.log("❌ SessionManager: Failed to refresh token, logging out");
        this.performLogout();
        return;
      }
    }

    // Auto-refresh access token when it's about to expire (5 minutes before)
    if (
      accessTokenTimeLeft > 0 &&
      accessTokenTimeLeft <= 300 &&
      refreshTokenTimeLeft > 0
    ) {
      console.log(
        "🔄 SessionManager: Access token expiring soon, pre-emptive refresh",
      );
      await this.refreshAccessToken();
    }

    // Handle refresh token expiry
    if (refreshTokenTimeLeft <= 0) {
      if (this.isUserInactive()) {
        // User is inactive, auto logout
        console.log(
          "🚪 SessionManager: Refresh token expired + user inactive, auto logout",
        );
        this.performLogout();
      } else {
        // User is active, show modal to give them a chance to login again
        console.log(
          "⚠️ SessionManager: Refresh token expired + user active, showing modal",
        );
        this.warningShown = true;
        this.notifySessionExpiry("refresh_token_expired", refreshTokenTimeLeft);
      }
      return;
    }

    // Show warning when refresh token is about to expire (10 minutes before)
    if (refreshTokenTimeLeft <= 600 && !this.warningShown) {
      // 10 minutes
      console.log(
        "⚠️ SessionManager: Refresh token expiring soon, showing warning",
      );
      this.warningShown = true;
      this.notifySessionExpiry("refresh_token_warning", refreshTokenTimeLeft);
    }
  }

  // Perform actual logout
  performLogout() {
    console.log("🚪 SessionManager: Performing logout");

    // Clear stored data
    this.clearAuthData();
    this.warningShown = false;

    // Notify callbacks
    this.sessionExpiryCallbacks.forEach((callback) => {
      try {
        callback({ type: "logout" });
      } catch (error) {
        console.error("❌ SessionManager: Error in expiry callback", error);
      }
    });

    // Clear user stores
    if (window.zustandStores) {
      window.zustandStores.forEach((store) => {
        try {
          const state = store.getState();
          if (typeof state.logOut === "function") {
            state.logOut();
          } else if (typeof state.clearCart === "function") {
            state.clearCart();
          }
        } catch (error) {
          console.error("❌ SessionManager: Error clearing store", error);
        }
      });
    }

    // Redirect to login
    const isAdminRoute = window.location.pathname.includes("/admin");
    const loginPath = isAdminRoute ? "/admin/login" : "/login";

    if (window.location.pathname !== loginPath) {
      window.location.href = loginPath;
    }
  }

  // Notify about session expiry (for modal)
  notifySessionExpiry(type = "warning", timeRemaining = 0) {
    this.sessionExpiryCallbacks.forEach((callback) => {
      try {
        callback({
          type,
          timeRemaining,
        });
      } catch (error) {
        console.error("❌ SessionManager: Error in expiry callback", error);
      }
    });
  }

  // Clear authentication data
  clearAuthData() {
    this.authData = null;

    // Clear cookies
    const tokenKeys = ["token", "adminToken"];
    tokenKeys.forEach((key) => {
      Cookies.remove(key);
      Cookies.remove(`${key}_refresh`);
      Cookies.remove(`${key}_refresh_expiry`);
    });

    // Clear other auth-related cookies
    Cookies.remove("currUserUrl");

    console.log("🧹 SessionManager: Auth data cleared");
  }

  // Add session expiry callback
  onSessionExpiry(callback) {
    this.sessionExpiryCallbacks.push(callback);

    return () => {
      const index = this.sessionExpiryCallbacks.indexOf(callback);
      if (index > -1) {
        this.sessionExpiryCallbacks.splice(index, 1);
      }
    };
  }

  // Check if user is authenticated
  isAuthenticated() {
    const authData = this.getAuthData();
    if (!authData) return false;

    // For Google SSO (no refresh token), only check access token
    if (!authData.refreshToken) {
      console.log(
        "🔍 SessionManager: Google SSO auth check - access token only",
      );
      return !this.isTokenExpired();
    }

    // For normal auth with refresh tokens
    // If access token is expired but refresh token is valid, we're still authenticated
    if (this.isTokenExpired() && this.isRefreshTokenExpired()) {
      return false;
    }

    return true;
  }

  // Force logout (can be called manually)
  forceLogout() {
    console.log("🚪 SessionManager: Force logout requested");
    this.performLogout();
  }

  // Start monitoring session
  startMonitoring() {
    // Track user activity
    const activityEvents = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    activityEvents.forEach((event) => {
      document.addEventListener(
        event,
        () => {
          this.updateActivity();
        },
        true,
      );
    });

    // Check every 30 seconds instead of 1 hour for more responsive auto-logout
    this.monitoringInterval = setInterval(async () => {
      const authData = this.getAuthData();
      if (!authData) return;

      // Handle session expiry check
      await this.handleSessionExpiry();
    }, 30000); // Check every 30 seconds

    console.log("👁️ SessionManager: Monitoring started (30s intervals)");
  }

  // Stop monitoring (useful for cleanup)
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log("🛑 SessionManager: Monitoring stopped");
    }
  }
}

// Create singleton instance
const sessionManager = new SessionManager();

// Start monitoring when the module loads
if (typeof window !== "undefined") {
  sessionManager.startMonitoring();
}

export default sessionManager;
