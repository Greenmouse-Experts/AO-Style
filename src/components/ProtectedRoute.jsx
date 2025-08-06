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

        if (!authData) {
          setIsAuthenticated(false);
          setIsChecking(false);
          return;
        }

        // Check if refresh token is expired
        if (sessionManager.isRefreshTokenExpired()) {
          console.log("🚪 ProtectedRoute: Refresh token expired, logging out");
          sessionManager.performLogout();
          setIsAuthenticated(false);
          setIsChecking(false);
          return;
        }

        // If access token is expired but refresh token is valid, try to refresh
        if (sessionManager.isTokenExpired()) {
          console.log("🔄 ProtectedRoute: Access token expired, refreshing...");

          try {
            const refreshSuccess = await sessionManager.refreshAccessToken();

            if (!refreshSuccess) {
              console.log(
                "❌ ProtectedRoute: Refresh failed, redirecting to login",
              );
              sessionManager.handleSessionExpiry();
              setIsAuthenticated(false);
              setIsChecking(false);
              return;
            }
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
  }, [location.pathname]);

  // Show loading while checking authentication
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Redirect to appropriate login page if not authenticated
  if (!isAuthenticated) {
    const loginPath = isAdminRoute ? "/admin/login" : "/login";
    console.log("🔐 ProtectedRoute: Redirecting to login:", loginPath);
    return <Navigate to={loginPath} replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;
