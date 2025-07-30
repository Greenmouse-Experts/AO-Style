import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

const SessionExpiryModal = ({
  isOpen,
  onExtendSession,
  onLogout,
  isRefreshing = false,
}) => {
  if (!isOpen) return null;

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
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Session Expired
          </h2>
          <p className="text-gray-600">
            Your session has expired. Please choose an option to continue.
          </p>
        </div>

        {/* Status */}
        <div className="text-center mb-8">
          <div className="text-6xl font-bold text-red-600 mb-2">⏰</div>
          <p className="text-lg font-semibold text-red-600">SESSION EXPIRED</p>
          <p className="text-sm text-gray-500 mt-2">
            You must login again to continue
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={onLogout}
            className="w-full bg-purple-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors cursor-pointer"
          >
            Login Again
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
                Your session expired for security reasons. This modal appears
                only when you're actively using the app. Click "Login Again" to
                continue.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionExpiryModal;
