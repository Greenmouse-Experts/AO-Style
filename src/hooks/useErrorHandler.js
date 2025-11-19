import { useCallback } from 'react';
import useToast from './useToast';

const useErrorHandler = () => {
  const { toastError, toastWarning } = useToast();

  // Main error handler function
  const handleError = useCallback(
    (error, options = {}) => {
      const {
        showToast = true,
        logError = true,
        customMessage = null,
        context = 'Unknown',
        onError = null,
      } = options;

      // Log error for debugging
      if (logError) {
        console.error(`🚨 Error in ${context}:`, {
          error,
          message: error?.message,
          stack: error?.stack,
          response: error?.response,
          timestamp: new Date().toISOString(),
          url: window.location.href,
        });
      }

      // Determine error message
      const errorMessage = getErrorMessage(error, customMessage);

      // Show toast notification
      if (showToast) {
        const errorType = getErrorType(error);
        if (errorType === 'warning') {
          toastWarning(errorMessage);
        } else {
          toastError(errorMessage);
        }
      }

      // Call custom error handler if provided
      if (onError && typeof onError === 'function') {
        onError(error, errorMessage);
      }

      // Report error to monitoring service in production
      if (process.env.NODE_ENV === 'production') {
        reportError(error, context, errorMessage);
      }

      return errorMessage;
    },
    [toastError, toastWarning]
  );

  // Handle API errors specifically
  const handleApiError = useCallback(
    (error, context = 'API Request') => {
      return handleError(error, {
        context,
        showToast: true,
        logError: true,
      });
    },
    [handleError]
  );

  // Handle network errors
  const handleNetworkError = useCallback(
    (error, context = 'Network Request') => {
      return handleError(error, {
        context,
        customMessage: 'Network error. Please check your internet connection.',
        showToast: true,
      });
    },
    [handleError]
  );

  // Handle validation errors
  const handleValidationError = useCallback(
    (error, context = 'Validation') => {
      return handleError(error, {
        context,
        showToast: true,
        logError: false, // Validation errors are usually expected
      });
    },
    [handleError]
  );

  // Handle async operations with automatic error handling
  const withErrorHandling = useCallback(
    (asyncFn, options = {}) => {
      return async (...args) => {
        try {
          return await asyncFn(...args);
        } catch (error) {
          handleError(error, options);
          throw error; // Re-throw to allow component-level handling
        }
      };
    },
    [handleError]
  );

  // Handle promise rejections
  const handlePromiseRejection = useCallback(
    (promise, context = 'Promise') => {
      return promise.catch((error) => {
        handleError(error, { context });
        return Promise.reject(error);
      });
    },
    [handleError]
  );

  return {
    handleError,
    handleApiError,
    handleNetworkError,
    handleValidationError,
    withErrorHandling,
    handlePromiseRejection,
  };
};

// Helper function to determine error message
const getErrorMessage = (error, customMessage = null) => {
  if (customMessage) {
    return customMessage;
  }

  // Handle different error types
  if (error?.response) {
    // API response errors
    const status = error.response.status;
    const data = error.response.data;

    if (status === 400) {
      return data?.message || 'Bad request. Please check your input.';
    }
    if (status === 401) {
      return 'Authentication failed. Please log in again.';
    }
    if (status === 403) {
      return 'Access denied. You don\'t have permission for this action.';
    }
    if (status === 404) {
      return 'Resource not found.';
    }
    if (status === 422) {
      return data?.message || 'Validation failed. Please check your input.';
    }
    if (status === 429) {
      return 'Too many requests. Please try again later.';
    }
    if (status >= 500) {
      return 'Server error. Please try again later.';
    }

    return data?.message || `Request failed with status ${status}`;
  }

  // Network errors
  if (error?.request) {
    return 'Network error. Please check your internet connection.';
  }

  // JavaScript errors
  if (error?.message) {
    // Common JavaScript errors with user-friendly messages
    if (error.message.includes('fetch')) {
      return 'Failed to load data. Please try again.';
    }
    if (error.message.includes('Network Error')) {
      return 'Network error. Please check your internet connection.';
    }
    if (error.message.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }
    if (error.message.includes('AbortError')) {
      return 'Request was cancelled.';
    }

    return error.message;
  }

  // Fallback message
  return 'An unexpected error occurred. Please try again.';
};

// Helper function to determine error type
const getErrorType = (error) => {
  if (error?.response) {
    const status = error.response.status;
    if (status === 401 || status === 403) {
      return 'auth';
    }
    if (status === 422 || status === 400) {
      return 'validation';
    }
    if (status >= 500) {
      return 'server';
    }
    if (status === 404) {
      return 'warning';
    }
  }

  if (error?.request) {
    return 'network';
  }

  return 'error';
};

// Helper function to report errors to monitoring service
const reportError = (error, context, errorMessage) => {
  try {
    // Prepare error report
    const errorReport = {
      message: errorMessage,
      originalError: error?.message,
      stack: error?.stack,
      context,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: localStorage.getItem('userId') || 'anonymous',
      sessionId: sessionStorage.getItem('sessionId') || 'unknown',
      responseStatus: error?.response?.status,
      responseData: error?.response?.data,
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Error Report:', errorReport);
    }

    // Send to monitoring service
    // Replace with your actual error reporting service
    /*
    fetch('/api/errors/report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(errorReport),
    }).catch(() => {
      // Silently fail if error reporting fails
    });
    */

    // Alternative: Send to external monitoring service like Sentry
    /*
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        tags: {
          context,
        },
        extra: errorReport,
      });
    }
    */
  } catch (reportingError) {
    console.error('Failed to report error:', reportingError);
  }
};

export default useErrorHandler;
