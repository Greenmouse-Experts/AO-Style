import React from "react";
import { Link } from "react-router-dom";

class AuthErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error for debugging
    console.error("🚨 AuthErrorBoundary: Caught an error:", error);
    console.error("📊 Error details:", errorInfo);

    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // You could also log the error to an error reporting service here
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });

    // Clear any problematic auth state
    try {
      localStorage.removeItem("pendingProduct");
      sessionStorage.removeItem("redirectAfterAuth");
    } catch (e) {
      console.warn("⚠️ Could not clear storage:", e);
    }

    // Reload the page to reset the authentication state
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient">
          <div className="max-w-md w-full bg-white rounded-lg p-8 shadow-lg">
            <div className="text-center">
              {/* Logo */}
              <Link to="/">
                <img
                  src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1742964300/AoStyle/CARYBIN_TRANSPARENT_1_ujbdei.png"
                  alt="OAStyles Logo"
                  className="h-16 mx-auto mb-6"
                />
              </Link>

              {/* Error Icon */}
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 18.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>

              {/* Error Message */}
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Authentication Error
              </h2>
              <p className="text-gray-600 mb-6">
                Something went wrong with the authentication process. This could be due to a
                network issue, session timeout, or an unexpected error.
              </p>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={this.handleRetry}
                  className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                >
                  Try Again
                </button>

                <Link
                  to="/login"
                  className="block w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center"
                >
                  Back to Login
                </Link>

                <Link
                  to="/"
                  className="block text-purple-600 hover:text-purple-800 text-sm font-medium"
                >
                  Go to Homepage
                </Link>
              </div>

              {/* Technical Details (only show in development) */}
              {process.env.NODE_ENV === "development" && this.state.error && (
                <details className="mt-6 p-4 bg-gray-50 rounded-lg text-left">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                    Technical Details (Dev Only)
                  </summary>
                  <div className="text-xs text-gray-600 space-y-2">
                    <div>
                      <strong>Error:</strong>
                      <pre className="mt-1 whitespace-pre-wrap break-all">
                        {this.state.error.toString()}
                      </pre>
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="mt-1 whitespace-pre-wrap break-all text-xs">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AuthErrorBoundary;
