import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { routes } from "./routes";
import { useQueryClient } from "@tanstack/react-query";
import "react-phone-input-2/lib/style.css";
import {
  messaging,
  requestNotificationPermission,
} from "./notifications/firebase.js";
import { onMessage } from "firebase/messaging";
import { useEffect } from "react";
import useToast from "./hooks/useToast.jsx";
import useSessionManager from "./hooks/useSessionManager.jsx";
import SessionExpiryModal from "./components/SessionExpiryModal.jsx";
import SessionTestComponent from "./components/SessionTestComponent.jsx";
import sessionManager from "./services/SessionManager.js";

const AppWrapper = () => {
  const { toastSuccess } = useToast();
  const queryClient = useQueryClient();

  const {
    showExpiryModal,
    timeUntilExpiry,
    isRefreshing,
    extendSession,
    closeExpiryModal,
  } = useSessionManager();

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

  return (
    <>
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
