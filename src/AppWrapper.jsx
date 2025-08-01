import { useQueryClient, useQuery } from "@tanstack/react-query";
import "react-phone-input-2/lib/style.css";
import {
  messaging,
  requestNotificationPermission,
} from "./notifications/firebase.js";
import { onMessage } from "firebase/messaging";
import { use, useEffect, useState } from "react";
import useToast from "./hooks/useToast.jsx";
import useSessionManager from "./hooks/useSessionManager.jsx";
import SessionExpiryModal from "./components/SessionExpiryModal.jsx";
import SessionTestComponent from "./components/SessionTestComponent.jsx";
import sessionManager from "./services/SessionManager.js";
// Import your API service - adjust the path as needed
import AuthService from "./services/api/auth/index.jsx";
import { Cookie } from "lucide-react";
import Cookies from "js-cookie";

// Verification Banner Component
const VerificationBanner = ({ onLogout, onGoToKYC }) => {
  return (
    <>
      {/* Overlay to make page non-interactive */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm bg-opacity-50 z-[998]" />

      {/* Verification Banner */}
      <div className="verification-banner fixed top-0 left-0 right-0 bg-gradient-to-r from-purple-500 to-purple-500 text-white px-4 py-3 shadow-lg z-[999]">
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
  // const userTypeUrl = getCookie("currUserUrl");
  // setUserType(userTypeUrl);
  // Get auth data to determine if user is logged in
  const authData = sessionManager.getAuthData();
  const isLoggedIn = !!authData;

  // Query to fetch KYC status from API
  const {
    data: kycData,
    isLoading: kycLoading,
    error: kycError,
  } = useQuery({
    queryKey: ["kyc-status"],
    queryFn: () => AuthService.getKycStatus(), // You'll need to add this method to your AuthService
    enabled: isLoggedIn, // Only fetch if user is logged in and not admin
    refetchInterval: 30000, // Refetch every 30 seconds (adjust as needed)
    retry: 3,
    staleTime: 10000, // Consider data stale after 10 seconds
  });

  // Helper function to check if user is admin using currUserUrl cookie
  const isAdminUser = () => {
    const userTypeUrl = getCookie("currUserUrl");
    return userTypeUrl === "admin" || userTypeUrl === "super-admin";
  };

  // Function to check admin approval status using API data
  const checkApprovalStatus = () => {
    try {
      if (!authData) {
        setNeedsVerification(false);
        setUserType(null);
        return;
      }

      // Get user type from auth data
      const currentUserType =
        authData.user?.role ||
        authData.userType ||
        authData.user?.userType ||
        authData.role;
      setUserType(currentUserType);

      // Skip verification check for admin users
      if (isAdminUser()) {
        setNeedsVerification(false);
        return;
      }

      // Use KYC data from API instead of cookie
      if (kycData && !kycLoading && !kycError) {
        Cookies.set("isVerified", kycData?.data?.data?.is_approved);
        // Adjust this based on the actual structure of your KYC API response
        const isApproved = kycData?.data?.data?.is_approved === true;

        const isNonAdmin =
          userType &&
          userType !== "owner-super-administrator" &&
          userType !== "owner-administrator";

        console.log("🔍 Checking approval status via API:");
        console.log("Current user type:", currentUserType);
        console.log("KYC API response:", kycData);
        console.log("Is approved:", isApproved);
        console.log("Is non-admin:", isNonAdmin);
        console.log("Needs verification:", isNonAdmin && !isApproved);

        // Set verification status based on API response
        // Show banner only if user is non-admin AND (not approved OR kycData.data.data is null)
        if (
          isNonAdmin &&
          !isAdminUser() &&
          (!isApproved || kycData?.data?.data === null)
        ) {
          setNeedsVerification(true);
        } else {
          setNeedsVerification(false);
        }
      } else if (kycError) {
        console.error("Error fetching KYC status:", kycError);
        // Fallback to not showing banner if API fails
        setNeedsVerification(false);
      }

      // Get userType from cookie for URL routing (keep this for navigation)
      const userTypeUrl = getCookie("currUserUrl");
      if (userTypeUrl) {
        setUserType(userTypeUrl);
        console.log(userType);
      }
    } catch (error) {
      console.error("Error checking approval status:", error);
      setNeedsVerification(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    sessionManager.performLogout();
    setNeedsVerification(false);
    window.location.href = "/login";
  };

  // Handle navigation to KYC page
  const handleGoToKYC = () => {
    window.location.href = `/${userType}/settings`;
  };

  // Check if we should show the verification banner
  const shouldShowBanner =
    needsVerification &&
    !isAdminUser() &&
    !window.location.pathname.includes("/settings") &&
    (userType === "tailor" || userType === "fabric");

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

  // Check approval status when KYC data changes
  useEffect(() => {
    checkApprovalStatus();
  }, [kycData, kycLoading, kycError, authData]);

  // Listen for auth changes and URL changes
  useEffect(() => {
    const handleStorageChange = () => {
      // Invalidate KYC query to refetch data
      queryClient.invalidateQueries({ queryKey: ["kyc-status"] });
    };

    const handleLocationChange = () => {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["kyc-status"] });
      }, 100);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("popstate", handleLocationChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("popstate", handleLocationChange);
    };
  }, [queryClient]);

  // Body styling management
  useEffect(() => {
    if (shouldShowBanner) {
      const originalOverflow = document.body.style.overflow;
      const originalPaddingTop = document.body.style.paddingTop;

      document.body.style.overflow = "hidden";
      document.body.style.paddingTop = "80px";

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingTop = originalPaddingTop;
      };
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingTop = "";
    }
  }, [shouldShowBanner]);

  return (
    <>
      {/* Verification Banner */}
      {shouldShowBanner && (
        <VerificationBanner onLogout={handleLogout} onGoToKYC={handleGoToKYC} />
      )}

      {/* Main app content overlay */}
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
