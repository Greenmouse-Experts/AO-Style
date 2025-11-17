import React from 'react';
import { AlertCircle, RefreshCw, Home, Mail, MessageCircle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console for debugging
    console.error('Error caught by ErrorBoundary:', error, errorInfo);

    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // You can also log the error to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportError = () => {
    const errorDetails = `
Error: ${this.state.error?.message || 'Unknown error'}
Stack: ${this.state.error?.stack || 'No stack trace'}
Component Stack: ${this.state.errorInfo?.componentStack || 'No component stack'}
    `.trim();

    const subject = encodeURIComponent('Application Error Report');
    const body = encodeURIComponent(`Dear Support Team,

I encountered an error while using the application. Here are the details:

${errorDetails}

Please help resolve this issue.

Thank you!`);

    window.open(`mailto:support@carybin.com?subject=${subject}&body=${body}`);
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            {/* Main Error Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              {/* Icon */}
              <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Oops! Something went wrong
              </h1>

              {/* Description */}
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                We're sorry, but something unexpected happened. Don't worry - your data is safe
                and our team has been notified. Please try one of the options below.
              </p>

              {/* Action Buttons */}
              <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center mb-8">
                <button
                  onClick={this.handleReload}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Try Again
                </button>

                <button
                  onClick={this.handleGoHome}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all duration-200"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Go Home
                </button>
              </div>

              {/* Support Options */}
              <div className="border-t border-gray-200 pt-6">
                <p className="text-sm text-gray-500 mb-4">
                  Still having trouble? Get help from our support team:
                </p>

                <div className="flex justify-center space-x-4">
                  <button
                    onClick={this.handleReportError}
                    className="inline-flex items-center px-4 py-2 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors duration-200"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email Support
                  </button>

                  <button
                    onClick={() => window.open('https://wa.me/1234567890', '_blank')}
                    className="inline-flex items-center px-4 py-2 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors duration-200"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    WhatsApp
                  </button>
                </div>
              </div>
            </div>

            {/* Error Details (Collapsible) */}
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 bg-white rounded-lg shadow-lg p-4">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 select-none">
                  🔧 Technical Details (Click to expand)
                </summary>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-xs font-mono text-gray-700 space-y-2">
                    <div>
                      <strong>Error:</strong> {this.state.error?.message || 'Unknown error'}
                    </div>
                    {this.state.error?.stack && (
                      <div>
                        <strong>Stack Trace:</strong>
                        <pre className="whitespace-pre-wrap text-xs mt-1 p-2 bg-gray-100 rounded overflow-auto max-h-40">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                    {this.state.errorInfo?.componentStack && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="whitespace-pre-wrap text-xs mt-1 p-2 bg-gray-100 rounded overflow-auto max-h-40">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </details>
            )}

            {/* Branding */}
            <div className="text-center mt-8">
              <p className="text-sm text-gray-400">
                Powered by Carybin Limited
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
