// ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import sessionManager from "../services/SessionManager.js";

const ProtectedRoute = ({ children, isAdminRoute = false }) => {
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authData = sessionManager.getAuthData();
        const currentPath = location.pathname;

        console.log("🔍 ProtectedRoute: Checking authentication", {
          hasAuthData: !!authData,
          currentPath,
          isAdminRoute,
        });

        if (!authData) {
          console.log("❌ ProtectedRoute: No auth data found");
          setIsAuthenticated(false);
          setIsChecking(false);
          return;
        }

        // For Google SSO or tokens without refresh capability
        if (!authData.refreshToken) {
          if (sessionManager.isTokenExpired()) {
            console.log(
              "🚪 ProtectedRoute: Access token expired (no refresh), logging out",
            );
            sessionManager.performLogout();
            setIsAuthenticated(false);
            setIsChecking(false);
            return;
          }
          setIsAuthenticated(true);
          setIsChecking(false);
          return;
        }

        // Check if both tokens are expired
        if (
          sessionManager.isTokenExpired() &&
          sessionManager.isRefreshTokenExpired()
        ) {
          console.log("🚪 ProtectedRoute: Both tokens expired, forcing logout");
          sessionManager.performLogout();
          setIsAuthenticated(false);
          setIsChecking(false);
          return;
        }

        // Check if refresh token is expired
        if (sessionManager.isRefreshTokenExpired()) {
          console.log(
            "🚪 ProtectedRoute: Refresh token expired, forcing logout",
          );
          sessionManager.performLogout();
          setIsAuthenticated(false);
          setIsChecking(false);
          return;
        }

        // If access token is expired but refresh token is valid, try to refresh
        if (sessionManager.isTokenExpired()) {
          console.log(
            "🔄 ProtectedRoute: Access token expired, attempting refresh...",
          );

          try {
            const refreshSuccess = await sessionManager.refreshAccessToken();

            if (!refreshSuccess) {
              console.log("❌ ProtectedRoute: Refresh failed, forcing logout");
              sessionManager.performLogout();
              setIsAuthenticated(false);
              setIsChecking(false);
              return;
            }

            console.log("✅ ProtectedRoute: Token refresh successful");
          } catch (refreshError) {
            console.error(
              "❌ ProtectedRoute: Token refresh error:",
              refreshError,
            );
            sessionManager.performLogout();
            setIsAuthenticated(false);
            setIsChecking(false);
            return;
          }
        }

        // Update activity on successful auth check
        sessionManager.updateActivity();
        setIsAuthenticated(true);
      } catch (error) {
        console.error("❌ ProtectedRoute: Auth check failed", error);
        sessionManager.performLogout();
        setIsAuthenticated(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();

    // Set up periodic auth checks
    const authCheckInterval = setInterval(() => {
      const authData = sessionManager.getAuthData();
      if (!authData || sessionManager.isRefreshTokenExpired()) {
        console.log("🔍 ProtectedRoute: Periodic check failed, logging out");
        sessionManager.performLogout();
        setIsAuthenticated(false);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(authCheckInterval);
  }, [location.pathname, isAdminRoute]);

  // Handle session expiry events
  useEffect(() => {
    const handleSessionEvent = (event) => {
      if (event.type === "logout") {
        console.log("🚪 ProtectedRoute: Received logout event");
        setIsAuthenticated(false);
      }
    };

    const unsubscribe = sessionManager.onSessionExpiry(handleSessionEvent);
    return unsubscribe;
  }, []);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Determine appropriate login path
    let loginPath = "/login";

    if (isAdminRoute || location.pathname.includes("/admin")) {
      loginPath = "/admin/login";
    }

    console.log("🔄 ProtectedRoute: Redirecting to login", {
      from: location.pathname,
      to: loginPath,
    });

    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
