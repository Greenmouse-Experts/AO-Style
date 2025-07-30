import { useQueryClient } from "@tanstack/react-query";
import "react-phone-input-2/lib/style.css";
import {
  messaging,
  requestNotificationPermission,
} from "./notifications/firebase.js";
import { onMessage } from "firebase/messaging";
import { useEffect, useState } from "react";
import useToast from "./hooks/useToast.jsx";
import useSessionManager from "./hooks/useSessionManager.jsx";
import SessionExpiryModal from "./components/SessionExpiryModal.jsx";
import SessionTestComponent from "./components/SessionTestComponent.jsx";
import sessionManager from "./services/SessionManager.js";

// Verification Banner Component
const VerificationBanner = ({ onLogout, onGoToKYC }) => {
  return (
    <>
      {/* Overlay to make page non-interactive */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm bg-opacity-50 z-[998]" />

      {/* Verification Banner */}
      <div className="verification-banner fixed top-0 left-0 right-0 bg-gradient-to-r from-orange-400 to-yellow-500 text-white px-4 py-3 shadow-lg z-[999]">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            {/* Warning Icon */}
            <svg
              className="w-6 h-6 text-white flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>

            <div>
              <h3 className="font-semibold text-lg">
                Account Verification Required
              </h3>
              <p className="text-sm opacity-90">
                Your account needs admin approval to continue using the
                platform. Please complete verification to proceed.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onLogout}
              className="cursor-pointer px-4 py-2 bg-white  text-orange-600 bg-opacity-20 hover:bg-opacity-30 rounded-lg font-medium transition-all duration-200 text-sm"
            >
              Log Out
            </button>
            <button
              onClick={onGoToKYC}
              className="cursor-pointer px-6 py-2 bg-white text-purple-500 hover:bg-gray-100 rounded-lg font-semibold transition-all duration-200 text-sm shadow-md"
            >
              Complete Verification
            </button>
          </div>
        </div>
      </div>

      {/* Spacer to push content down - only when banner is visible */}
      <div className="h-20" />
    </>
  );
};

const AppWrapper = () => {
  const { toastSuccess } = useToast();
  const queryClient = useQueryClient();
  const [needsVerification, setNeedsVerification] = useState(false);
  const [userType, setUserType] = useState(null);

  const {
    showExpiryModal,
    timeUntilExpiry,
    isRefreshing,
    extendSession,
    closeExpiryModal,
  } = useSessionManager();

  // Function to get cookie value
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  };

  // Function to check admin approval status
  const checkApprovalStatus = () => {
    try {
      const authData = sessionManager.getAuthData();
      if (!authData) {
        setNeedsVerification(false);
        return;
      }

      // Get user type from auth data - try multiple possible locations
      const currentUserType =
        authData.user?.role ||
        authData.userType ||
        authData.user?.userType ||
        authData.role;
      setUserType(currentUserType);

      // Skip verification check for admin users
      if (
        currentUserType === "owner-super-administrator" ||
        currentUserType === "owner-administrator"
      ) {
        setNeedsVerification(false);
        return;
      }

      // Get approvedByAdmin from cookie
      const approvedByAdmin = getCookie("approvedByAdmin");
      const userTypeUrl = getCookie("currUserUrl");
      setNeedsVerification(approvedByAdmin);
      setUserType(userTypeUrl);
      // Debug logs
      console.log("🔍 Checking approval status:");
      console.log("Current user type:", currentUserType);
      console.log("ApprovedByAdmin cookie:", approvedByAdmin);
      console.log("Auth data:", authData);
      console.log("All cookies:", document.cookie);

      // Check if user needs verification (not admin and not approved)
      const isApproved = approvedByAdmin === "true";
      const isNonAdmin =
        currentUserType &&
        currentUserType !== "owner-super-administrator" &&
        currentUserType !== "owner-administrator";

      console.log("Is approved:", isApproved);
      console.log("Is non-admin:", isNonAdmin);
      console.log("Needs verification:", isNonAdmin && !isApproved);

      // if (isNonAdmin && !isApproved) {
      //   setNeedsVerification(true);
      // } else {
      //   setNeedsVerification(false);
      // }
    } catch (error) {
      console.error("Error checking approval status:", error);
      setNeedsVerification(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    sessionManager.performLogout();
    setNeedsVerification(false);
    window.location.href = "/login"; // Force redirect to login
  };

  // Handle navigation to KYC page
  const handleGoToKYC = () => {
    window.location.href = `/${userType}/settings`;
  };

  // Check if we should show the verification banner
  const shouldShowBanner =
    needsVerification && !window.location.pathname.includes("/settings");

  useEffect(() => {
    if (
      typeof Notification === "undefined" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }
    requestNotificationPermission();
    onMessage(messaging, (payload) => {
      toastSuccess(payload?.notification?.body);
      new Notification(payload.notification?.title || "New Notification", {
        body: payload.notification?.body || "",
        icon:
          payload.notification?.image ||
          "https://res.cloudinary.com/greenmouse-tech/image/upload/v1742964300/AoStyle/CARYBIN_TRANSPARENT_1_ujbdei.png",
      });
      queryClient.invalidateQueries({
        queryKey: ["get-notification"],
      });
    });
  }, []);

  // Check token validity on app startup
  useEffect(() => {
    const checkInitialAuth = () => {
      const authData = sessionManager.getAuthData();
      if (authData && sessionManager.isRefreshTokenExpired()) {
        console.log("🚪 App: Refresh token expired on startup, logging out");
        sessionManager.performLogout();
      }
    };
    checkInitialAuth();
  }, []);

  // Check approval status on mount and when auth changes
  useEffect(() => {
    checkApprovalStatus();

    // Set up interval to check approval status periodically
    const interval = setInterval(checkApprovalStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  // Listen for cookie changes and URL changes
  useEffect(() => {
    const handleStorageChange = () => {
      checkApprovalStatus();
    };

    // Also check when the URL changes (user navigates)
    const handleLocationChange = () => {
      setTimeout(checkApprovalStatus, 100); // Small delay to ensure auth data is loaded
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("popstate", handleLocationChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("popstate", handleLocationChange);
    };
  }, []);

  // Improved body styling management - only apply when banner should actually show
  useEffect(() => {
    if (shouldShowBanner) {
      const originalOverflow = document.body.style.overflow;
      const originalPaddingTop = document.body.style.paddingTop;

      document.body.style.overflow = "hidden";
      document.body.style.paddingTop = "80px";

      // Cleanup function to restore original styles
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingTop = originalPaddingTop;
      };
    } else {
      // Ensure styles are cleared when banner shouldn't show
      document.body.style.overflow = "";
      document.body.style.paddingTop = "";
    }
  }, [shouldShowBanner]);

  return (
    <>
      {/* Verification Banner - shows when user needs verification and not on settings page */}
      {shouldShowBanner && (
        <VerificationBanner onLogout={handleLogout} onGoToKYC={handleGoToKYC} />
      )}

      {/* Main app content overlay - disable interactions when verification needed */}
      {shouldShowBanner && (
        <style jsx global>{`
          body > div:first-child > * {
            pointer-events: none !important;
          }
          .verification-banner,
          .verification-banner * {
            pointer-events: auto !important;
          }
        `}</style>
      )}

      {/* Session Management Modals */}
      <SessionExpiryModal
        isOpen={showExpiryModal}
        onExtendSession={extendSession}
        onLogout={closeExpiryModal}
        timeRemaining={timeUntilExpiry}
        isRefreshing={isRefreshing}
      />
      <SessionTestComponent />
    </>
  );
};

export default AppWrapper;
