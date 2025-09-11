import React from "react";
import { AlertTriangle, RefreshCw, Clock } from "lucide-react";

const SessionExpiryModal = ({
  isOpen,
  onExtendSession,
  onLogout,
  isRefreshing = false,
  sessionModalType = null,
  timeRemaining = 0,
}) => {
  if (!isOpen) return null;

  // Format time remaining
  const formatTime = (seconds) => {
    if (seconds <= 0) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Get modal content based on type
  const getModalContent = () => {
    switch (sessionModalType) {
      case "access_token_warning":
        return {
          title: "Session Expiring Soon",
          message:
            "Your session will expire soon. Please login again to continue.",
          icon: <Clock className="w-8 h-8 text-yellow-600" />,
          iconBg: "bg-yellow-100",
          statusText: "EXPIRING SOON",
          statusColor: "text-yellow-600",
          showTimer: true,
        };
      case "refresh_token_warning":
        return {
          title: "Session Expiring Soon",
          message:
            "Your session will expire soon. Please save your work and login again.",
          icon: <Clock className="w-8 h-8 text-orange-600" />,
          iconBg: "bg-orange-100",
          statusText: "EXPIRING SOON",
          statusColor: "text-orange-600",
          showTimer: true,
        };
      case "refresh_token_expired":
      default:
        return {
          title: "Session Expired",
          message:
            "Your session has expired for security reasons. Please login again to continue.",
          icon: <AlertTriangle className="w-8 h-8 text-red-600" />,
          iconBg: "bg-red-100",
          statusText: "SESSION EXPIRED",
          statusColor: "text-red-600",
          showTimer: false,
        };
    }
  };

  const content = getModalContent();

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999]"
      style={{ pointerEvents: "all" }}
    >
      <div
        className="bg-white rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div
            className={`mx-auto w-16 h-16 ${content.iconBg} rounded-full flex items-center justify-center mb-4`}
          >
            {content.icon}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {content.title}
          </h2>
          <p className="text-gray-600">{content.message}</p>
        </div>

        {/* Status */}
        <div className="text-center mb-8">
          {content.showTimer && timeRemaining > 0 ? (
            <>
              <div className="text-6xl font-bold text-orange-600 mb-2">
                {formatTime(timeRemaining)}
              </div>
              <p className={`text-lg font-semibold ${content.statusColor}`}>
                {content.statusText}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Time remaining until automatic logout
              </p>
            </>
          ) : (
            <>
              <div className="text-6xl font-bold text-red-600 mb-2">⏰</div>
              <p className={`text-lg font-semibold ${content.statusColor}`}>
                {content.statusText}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                You must login again to continue
              </p>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={onLogout}
            disabled={isRefreshing}
            className="w-full bg-purple-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRefreshing ? (
              <div className="flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Please wait...
              </div>
            ) : (
              "Login Again"
            )}
          </button>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <div className="w-2 h-2 bg-blue-600 rounded-full" />
            </div>
            <div>
              <p className="text-sm text-blue-800 font-medium mb-1">
                What happened?
              </p>
              <p className="text-xs text-blue-700">
                {sessionModalType === "access_token_warning" ||
                sessionModalType === "refresh_token_warning"
                  ? "Your session is about to expire automatically. You can continue working, but will need to login again soon."
                  : "Your session expired for security reasons. This helps protect your account and data."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionExpiryModal;
