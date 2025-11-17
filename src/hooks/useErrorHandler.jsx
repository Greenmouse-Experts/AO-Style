import { useCallback } from 'react';
import { toast } from 'react-hot-toast';

const useErrorHandler = () => {
  const reportError = useCallback(async (error, context = {}) => {
    const errorId = Date.now().toString(36) + Math.random().toString(36).substr(2);

    const errorReport = {
      message: error.message || 'Unknown error',
      stack: error.stack,
      errorId,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: localStorage.getItem('userId') || 'anonymous',
      context
    };

    // Log to console for debugging
    console.error('🚨 Manual Error Report:', errorReport);

    try {
      // Send to your error reporting service
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorReport)
      // });

      console.log('Error reported successfully:', errorId);
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }

    return errorId;
  }, []);

  const handleAsyncError = useCallback(async (asyncFunction, options = {}) => {
    const {
      onError,
      showToast = true,
      toastMessage = 'Something went wrong. Please try again.',
      context = {}
    } = options;

    try {
      return await asyncFunction();
    } catch (error) {
      console.error('Async error caught:', error);

      const errorId = await reportError(error, context);

      if (showToast) {
        toast.error(toastMessage);
      }

      if (onError) {
        onError(error, errorId);
      }

      throw error; // Re-throw if the caller wants to handle it
    }
  }, [reportError]);

  const handleError = useCallback((error, options = {}) => {
    const {
      showToast = true,
      toastMessage = 'An error occurred',
      context = {}
    } = options;

    console.error('Error handled:', error);

    const errorId = reportError(error, context);

    if (showToast) {
      toast.error(toastMessage);
    }

    return errorId;
  }, [reportError]);

  const createErrorHandler = useCallback((context = {}) => {
    return (error) => handleError(error, { context });
  }, [handleError]);

  return {
    reportError,
    handleAsyncError,
    handleError,
    createErrorHandler
  };
};

export default useErrorHandler;
