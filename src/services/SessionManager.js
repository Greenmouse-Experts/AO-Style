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
  }

  // Set authentication data from login response
  setAuthData(data) {
    this.authData = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      refreshTokenExpiry: data.refreshTokenExpiry,
      tokenExpiry: this.decodeTokenExpiry(data.accessToken),
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
    console.log("🔒 SessionManager: Auth data stored");
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
      };
      console.log("🔍 SessionManager: Retrieved auth data", this.authData);
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
    if (!authData || !authData.refreshTokenExpiry) return true;

    const now = Date.now();
    const expiry = new Date(authData.refreshTokenExpiry).getTime();

    return now >= expiry;
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
      console.log("❌ SessionManager: No refresh token available");
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

  // Handle session expiry - show modal only when refresh token expires and user is active
  handleSessionExpiry() {
    const timeLeft = this.getTimeUntilRefreshExpiry();

    if (timeLeft <= 0) {
      // Refresh token expired
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
        this.notifySessionExpiry();
      }
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
  notifySessionExpiry() {
    this.sessionExpiryCallbacks.forEach((callback) => {
      try {
        callback({
          type: "warning",
          timeRemaining: this.getTimeUntilRefreshExpiry(),
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

    // If access token is expired but refresh token is valid, we're still authenticated
    if (this.isTokenExpired() && this.isRefreshTokenExpired()) {
      return false;
    }

    return true;
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

    // Check every 30 seconds
    setInterval(() => {
      const authData = this.getAuthData();
      if (!authData) return;

      const timeLeft = this.getTimeUntilRefreshExpiry();

      // Only handle expiry when refresh token is actually expired
      if (timeLeft <= 0 && !this.warningShown) {
        console.log(
          "💀 SessionManager: Refresh token expired, handling expiry",
        );
        this.handleSessionExpiry();
      }
    }, 30000); // Check every 30 seconds
  }
}

// Create singleton instance
const sessionManager = new SessionManager();

// Start monitoring when the module loads
if (typeof window !== "undefined") {
  sessionManager.startMonitoring();
}

export default sessionManager;
