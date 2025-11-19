import React from "react";
import { useRouteError, Link } from "react-router-dom";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

interface RouteError {
  statusText?: string;
  message?: string;
  status?: number;
}

const ErrorPage: React.FC = () => {
  const error = useRouteError() as RouteError;

  const getErrorMessage = () => {
    if (error?.status === 404) {
      return "The page you're looking for doesn't exist.";
    }
    if (error?.status === 403) {
      return "You don't have permission to access this page.";
    }
    if (error?.status === 500) {
      return "Internal server error. Please try again later.";
    }
    return error?.statusText || error?.message || "An unexpected error occurred.";
  };

  const getErrorTitle = () => {
    if (error?.status === 404) {
      return "Page Not Found";
    }
    if (error?.status === 403) {
      return "Access Denied";
    }
    if (error?.status === 500) {
      return "Server Error";
    }
    return "Oops! Something went wrong";
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-2xl p-8 text-center">
        {/* Error Icon */}
        <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-6">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>

        {/* Error Code */}
        {error?.status && (
          <div className="mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
              Error {error.status}
            </span>
          </div>
        )}

        {/* Error Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {getErrorTitle()}
        </h1>

        {/* Error Description */}
        <p className="text-gray-600 mb-8 leading-relaxed">
          {getErrorMessage()}
        </p>

        {/* Development Error Details */}
        {process.env.NODE_ENV === "development" && error && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-left">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">
              Development Details:
            </h3>
            <pre className="text-xs text-gray-600 overflow-auto">
              {JSON.stringify(error, null, 2)}
            </pre>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleRefresh}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>

          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          >
            <Home className="w-4 h-4" />
            Go to Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="w-full text-gray-600 hover:text-gray-800 font-medium py-2 transition-colors duration-200"
          >
            ← Go Back
          </button>
        </div>

        {/* Contact Support */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            If this problem persists, please{" "}
            <a
              href="mailto:support@aostyle.com"
              className="text-purple-600 hover:text-purple-700 underline"
            >
              contact support
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
