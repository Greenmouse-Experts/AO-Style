import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertCircle, Home, ArrowLeft, RefreshCw, Bug } from 'lucide-react';

class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    const errorId = Date.now().toString(36) + Math.random().toString(36).substr(2);

    console.error('🔴 Route Error Boundary caught an error:', {
      error,
      errorInfo,
      errorId,
      route: window.location.pathname,
      timestamp: new Date().toISOString()
    });

    this.setState({
      error: error,
      errorInfo: errorInfo,
      errorId: errorId
    });
  }

  componentDidUpdate(prevProps) {
    // Reset error state when location changes
    if (prevProps.location !== this.props.location && this.state.hasError) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null
      });
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  handleGoBack = () => {
    window.history.back();
  };

  handleGoHome = () => {
    const userRole = localStorage.getItem('userRole') || 'dashboard';
    window.location.href = `/${userRole}`;
  };

  handleReload = () => {
    window.location.reload();
  };

  getPageTitle = () => {
    const path = window.location.pathname;
    const segments = path.split('/').filter(Boolean);

    if (segments.length === 0) return 'Home Page';

    const pageMap = {
      'admin': 'Admin Dashboard',
      'fabric': 'Fabric Dashboard',
      'tailor': 'Tailor Dashboard',
      'logistics': 'Logistics Dashboard',
      'sales-rep': 'Sales Rep Dashboard',
      'customer': 'Customer Dashboard',
      'settings': 'Settings',
      'orders': 'Orders',
      'products': 'Products',
      'profile': 'Profile'
    };

    const lastSegment = segments[segments.length - 1];
    return pageMap[lastSegment] || lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
  };

  render() {
    if (this.state.hasError) {
      const pageTitle = this.getPageTitle();

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full">
            {/* Error Card */}
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              {/* Icon */}
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>

              {/* Title */}
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Page Error
              </h1>

              {/* Subtitle */}
              <p className="text-gray-500 mb-6">
                Something went wrong while loading {pageTitle}
              </p>

              {/* Error Message */}
              <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-red-700 text-sm font-medium">
                  {this.state.error?.message || 'An unexpected error occurred'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={this.handleRetry}
                  className="w-full inline-flex items-center justify-center px-4 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={this.handleGoBack}
                    className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go Back
                  </button>

                  <button
                    onClick={this.handleGoHome}
                    className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Home
                  </button>
                </div>

                <button
                  onClick={this.handleReload}
                  className="w-full text-sm text-gray-500 hover:text-gray-700 py-2"
                >
                  Refresh Page
                </button>
              </div>

              {/* Error ID */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-400">
                  Error ID: {this.state.errorId}
                </p>
              </div>
            </div>

            {/* Development Details */}
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4 bg-white rounded-lg shadow p-4">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 flex items-center">
                  <Bug className="w-4 h-4 mr-2" />
                  Developer Details
                </summary>
                <div className="mt-3 text-xs font-mono space-y-2">
                  <div>
                    <strong>Error:</strong> {this.state.error?.message}
                  </div>
                  <div>
                    <strong>Route:</strong> {window.location.pathname}
                  </div>
                  {this.state.error?.stack && (
                    <div>
                      <strong>Stack:</strong>
                      <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component to inject location
const RouteErrorBoundaryWithLocation = ({ children }) => {
  const location = useLocation();

  return (
    <RouteErrorBoundary location={location}>
      {children}
    </RouteErrorBoundary>
  );
};

export default RouteErrorBoundaryWithLocation;
