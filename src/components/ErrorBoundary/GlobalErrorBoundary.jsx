import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug, Shield, Wifi, WifiOff } from 'lucide-react';

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    const errorId = Date.now().toString(36) + Math.random().toString(36).substr(2);

    console.error('🚨 Global Error Boundary caught an error:', {
      error,
      errorInfo,
      errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });

    this.setState({
      error: error,
      errorInfo: errorInfo,
      errorId: errorId
    });

    // Send error to monitoring service
    this.reportError(error, errorInfo, errorId);
  }

  reportError = async (error, errorInfo, errorId) => {
    try {
      // Replace with your actual error reporting service
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        errorId: errorId,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        userId: localStorage.getItem('userId') || 'anonymous'
      };

      // Example: Send to your backend or monitoring service
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorReport)
      // });

      console.log('Error reported:', errorReport);
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  getErrorType = () => {
    const errorMessage = this.state.error?.message?.toLowerCase() || '';
    const errorStack = this.state.error?.stack?.toLowerCase() || '';

    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return 'network';
    }
    if (errorMessage.includes('chunk') || errorMessage.includes('loading')) {
      return 'chunk';
    }
    if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
      return 'permission';
    }
    if (errorStack.includes('undefined') || errorStack.includes('null')) {
      return 'data';
    }
    return 'unknown';
  };

  getErrorConfig = () => {
    const errorType = this.getErrorType();

    const configs = {
      network: {
        icon: WifiOff,
        title: 'Connection Problem',
        description: 'It looks like you\'re having network issues. Please check your internet connection and try again.',
        color: 'orange',
        showRetry: true,
        showReload: true
      },
      chunk: {
        icon: RefreshCw,
        title: 'Loading Error',
        description: 'Some resources failed to load. This usually happens after an app update. Please refresh the page.',
        color: 'blue',
        showRetry: false,
        showReload: true
      },
      permission: {
        icon: Shield,
        title: 'Access Denied',
        description: 'You don\'t have permission to access this resource. Please log in again or contact support.',
        color: 'red',
        showRetry: false,
        showReload: false
      },
      data: {
        icon: Bug,
        title: 'Data Error',
        description: 'There was a problem processing the data. Our team has been notified and is working on a fix.',
        color: 'purple',
        showRetry: true,
        showReload: true
      },
      unknown: {
        icon: AlertTriangle,
        title: 'Something Went Wrong',
        description: 'An unexpected error occurred. Don\'t worry - your data is safe and our team has been notified.',
        color: 'red',
        showRetry: true,
        showReload: true
      }
    };

    return configs[errorType];
  };

  render() {
    if (this.state.hasError) {
      const config = this.getErrorConfig();
      const Icon = config.icon;

      const colorClasses = {
        red: {
          bg: 'bg-red-100',
          icon: 'text-red-500',
          button: 'from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
        },
        orange: {
          bg: 'bg-orange-100',
          icon: 'text-orange-500',
          button: 'from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800'
        },
        blue: {
          bg: 'bg-blue-100',
          icon: 'text-blue-500',
          button: 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
        },
        purple: {
          bg: 'bg-purple-100',
          icon: 'text-purple-500',
          button: 'from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800'
        }
      };

      const colors = colorClasses[config.color] || colorClasses.red;

      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            {/* Main Error Card */}
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-8 py-6">
                <div className="flex items-center">
                  <div className={`w-16 h-16 ${colors.bg} rounded-full flex items-center justify-center mr-4`}>
                    <Icon className={`w-8 h-8 ${colors.icon}`} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white mb-1">
                      {config.title}
                    </h1>
                    <p className="text-gray-300 text-sm">
                      Error ID: {this.state.errorId}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="px-8 py-6">
                <p className="text-gray-600 text-lg leading-relaxed mb-8">
                  {config.description}
                </p>

                {/* Retry Count */}
                {this.state.retryCount > 0 && (
                  <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 text-sm">
                      🔄 Retry attempts: {this.state.retryCount}
                      {this.state.retryCount >= 3 && " (Consider refreshing the page)"}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  {config.showRetry && (
                    <button
                      onClick={this.handleRetry}
                      disabled={this.state.retryCount >= 5}
                      className={`flex-1 inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r ${colors.button} text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <RefreshCw className="w-5 h-5 mr-2" />
                      Try Again
                    </button>
                  )}

                  {config.showReload && (
                    <button
                      onClick={this.handleReload}
                      className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <RefreshCw className="w-5 h-5 mr-2" />
                      Refresh Page
                    </button>
                  )}

                  <button
                    onClick={this.handleGoHome}
                    className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all duration-200"
                  >
                    <Home className="w-5 h-5 mr-2" />
                    Go Home
                  </button>
                </div>

                {/* Support Section */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-4">
                      Need help? Contact our support team:
                    </p>

                    <div className="flex justify-center space-x-6">
                      <a
                        href="mailto:support@carybin.com"
                        className="inline-flex items-center text-sm text-purple-600 hover:text-purple-700 transition-colors"
                      >
                        📧 support@carybin.com
                      </a>

                      <a
                        href="https://wa.me/1234567890"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-green-600 hover:text-green-700 transition-colors"
                      >
                        💬 WhatsApp Support
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Development Details */}
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 bg-white rounded-xl shadow-lg overflow-hidden">
                <summary className="cursor-pointer p-4 bg-gray-50 hover:bg-gray-100 transition-colors select-none border-b">
                  <span className="font-medium text-gray-700">🔧 Developer Details</span>
                </summary>
                <div className="p-4">
                  <div className="space-y-4 text-xs font-mono">
                    <div>
                      <strong className="text-red-600">Error:</strong>
                      <div className="mt-1 p-2 bg-red-50 rounded text-red-800">
                        {this.state.error?.message || 'Unknown error'}
                      </div>
                    </div>

                    {this.state.error?.stack && (
                      <div>
                        <strong className="text-blue-600">Stack Trace:</strong>
                        <pre className="mt-1 p-2 bg-blue-50 rounded text-blue-800 whitespace-pre-wrap overflow-auto max-h-40">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}

                    {this.state.errorInfo?.componentStack && (
                      <div>
                        <strong className="text-purple-600">Component Stack:</strong>
                        <pre className="mt-1 p-2 bg-purple-50 rounded text-purple-800 whitespace-pre-wrap overflow-auto max-h-40">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </details>
            )}

            {/* Footer */}
            <div className="text-center mt-8">
              <p className="text-sm text-gray-400">
                Powered by <span className="font-semibold">Carybin Limited</span>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
