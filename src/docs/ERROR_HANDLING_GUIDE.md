# Comprehensive Error Handling Guide

This guide explains how to implement and use the comprehensive error handling system in the AO-Style application.

## Overview

Our error handling system provides multiple layers of protection:

1. **Route-level Error Boundaries** - Catches routing and navigation errors
2. **Component-level Error Boundaries** - Catches component rendering errors
3. **Global Error Boundary** - Catches unhandled errors with advanced UI
4. **Async Error Handler Hook** - Handles API and async operation errors
5. **Toast Notifications** - User-friendly error messages
6. **Error Reporting** - Logs and reports errors for monitoring

## File Structure

```
src/
├── components/
│   ├── ErrorBoundary.tsx              # Basic error boundary component
│   ├── ErrorPage.tsx                  # Route-level error page
│   └── ErrorBoundary/
│       └── GlobalErrorBoundary.jsx    # Advanced error boundary
├── hooks/
│   └── useErrorHandler.js             # Async error handling hook
├── routes/
│   └── index.jsx                      # Routes with error boundaries
└── docs/
    └── ERROR_HANDLING_GUIDE.md        # This guide
```

## Setup Instructions

### 1. Router Configuration

Your routes are already configured with error boundaries:

```javascript
// routes/index.jsx
export const routes = [
  {
    path: "/",
    errorElement: <ErrorPage />, // Catches route-level errors
    children: [
      // All routes wrapped with ErrorBoundary components
      ...wrapWithErrorBoundary(landingRooutes, "Landing"),
      ...wrapWithErrorBoundary(authRoutes, "Auth"),
      // ... other routes
    ],
  },
];
```

### 2. Main App Configuration

Your main.jsx already includes the global error boundary:

```javascript
// main.jsx
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>  {/* Global error boundary */}
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_LOGIN}>
        <QueryProvider>
          <RouterProvider router={router} />
          <AppWrapper />
          <ToastContainer />
        </QueryProvider>
      </GoogleOAuthProvider>
    </ErrorBoundary>
  </StrictMode>
);
```

## Usage Examples

### 1. Basic Component Error Boundary

Wrap components that might throw errors:

```javascript
import ErrorBoundary from '../components/ErrorBoundary';

const MyComponent = () => {
  return (
    <ErrorBoundary>
      <RiskyComponent />
    </ErrorBoundary>
  );
};
```

### 2. API Error Handling with React Query

```javascript
import { useQuery, useMutation } from '@tanstack/react-query';
import useErrorHandler from '../hooks/useErrorHandler';

const MyComponent = () => {
  const { handleApiError, withErrorHandling } = useErrorHandler();

  // Query with error handling
  const { data, isError, error } = useQuery({
    queryKey: ['data'],
    queryFn: () => fetchData(),
    onError: (error) => {
      handleApiError(error, 'Failed to load data');
    }
  });

  // Mutation with error handling
  const mutation = useMutation({
    mutationFn: withErrorHandling(
      (data) => createItem(data),
      { context: 'Create Item' }
    ),
    onError: (error) => {
      handleApiError(error, 'Failed to create item');
    }
  });

  return (
    <div>
      {/* Your component JSX */}
    </div>
  );
};
```

### 3. Manual Async Error Handling

```javascript
import useErrorHandler from '../hooks/useErrorHandler';

const MyComponent = () => {
  const { handleError, handleNetworkError, withErrorHandling } = useErrorHandler();

  // Option 1: Try-catch with manual error handling
  const handleManualOperation = async () => {
    try {
      const result = await someAsyncOperation();
      // Handle success
    } catch (error) {
      handleNetworkError(error, 'Manual Operation');
    }
  };

  // Option 2: Wrapped async function
  const handleWrappedOperation = withErrorHandling(
    async () => {
      return await someAsyncOperation();
    },
    { 
      context: 'Wrapped Operation',
      customMessage: 'Custom error message for users'
    }
  );

  // Option 3: Promise rejection handling
  const handlePromiseOperation = () => {
    someAsyncOperation()
      .then(result => {
        // Handle success
      })
      .catch(error => {
        handleError(error, {
          context: 'Promise Operation',
          showToast: true,
          onError: (error, message) => {
            // Custom error handling logic
            console.log('Custom handling:', message);
          }
        });
      });
  };

  return (
    <div>
      <button onClick={handleManualOperation}>Manual Error Handling</button>
      <button onClick={handleWrappedOperation}>Wrapped Error Handling</button>
      <button onClick={handlePromiseOperation}>Promise Error Handling</button>
    </div>
  );
};
```

### 4. Form Validation Error Handling

```javascript
import useErrorHandler from '../hooks/useErrorHandler';

const MyForm = () => {
  const { handleValidationError } = useErrorHandler();

  const handleSubmit = async (formData) => {
    try {
      await submitForm(formData);
      // Handle success
    } catch (error) {
      if (error.response?.status === 422) {
        handleValidationError(error, 'Form Validation');
      } else {
        handleApiError(error, 'Form Submission');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
};
```

## Error Types and Handling

### 1. Component Errors
- **Caught by:** ErrorBoundary components
- **Displayed:** Fallback UI with error message and retry options
- **Logged:** Console and error reporting service

### 2. Route Errors
- **Caught by:** ErrorPage component
- **Displayed:** Full-page error with navigation options
- **Examples:** 404, 403, 500 errors

### 3. API Errors
- **Caught by:** useErrorHandler hook
- **Displayed:** Toast notifications
- **Status Codes:**
  - 400: Bad request - validation message
  - 401: Unauthorized - redirect to login
  - 403: Forbidden - access denied message
  - 404: Not found - resource not found
  - 422: Validation failed - field-level errors
  - 429: Rate limited - retry later message
  - 500+: Server error - generic server error

### 4. Network Errors
- **Caught by:** useErrorHandler hook
- **Displayed:** Connection error message
- **Examples:** No internet, timeout, DNS errors

### 5. JavaScript Errors
- **Caught by:** ErrorBoundary or manual try-catch
- **Displayed:** Generic error message
- **Examples:** TypeError, ReferenceError, etc.

## Error Handler Hook Options

The `useErrorHandler` hook provides several methods:

```javascript
const {
  handleError,           // General error handler
  handleApiError,        // Specifically for API errors
  handleNetworkError,    // For network-related errors
  handleValidationError, // For form validation errors
  withErrorHandling,     // Wraps async functions
  handlePromiseRejection // Handles promise rejections
} = useErrorHandler();
```

### handleError Options

```javascript
handleError(error, {
  showToast: true,        // Show toast notification
  logError: true,         // Log to console
  customMessage: null,    // Override error message
  context: 'Unknown',     // Context for logging
  onError: null,          // Custom error callback
});
```

## Error Reporting and Monitoring

### Development Mode
- All errors logged to console with detailed information
- Error boundaries show error details
- Stack traces displayed in development error UI

### Production Mode
- User-friendly error messages
- Detailed error information hidden
- Errors reported to monitoring service (configure in `useErrorHandler.js`)

### Configuring Error Reporting

Update the `reportError` function in `useErrorHandler.js`:

```javascript
// For Sentry
if (window.Sentry) {
  window.Sentry.captureException(error, {
    tags: { context },
    extra: errorReport,
  });
}

// For custom backend
fetch('/api/errors/report', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(errorReport),
});
```

## Best Practices

### 1. Component Level
```javascript
// ✅ Good: Wrap risky components
<ErrorBoundary>
  <ComplexComponent />
</ErrorBoundary>

// ❌ Bad: No error boundary
<ComplexComponent />
```

### 2. API Calls
```javascript
// ✅ Good: Use error handler
const { handleApiError } = useErrorHandler();

const { data } = useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
  onError: (error) => handleApiError(error, 'Load Data')
});

// ❌ Bad: No error handling
const { data } = useQuery({
  queryKey: ['data'],
  queryFn: fetchData
});
```

### 3. Async Operations
```javascript
// ✅ Good: Wrapped with error handling
const handleOperation = withErrorHandling(
  async () => await someOperation(),
  { context: 'User Operation' }
);

// ❌ Bad: No error handling
const handleOperation = async () => {
  await someOperation(); // Could throw unhandled error
};
```

### 4. Error Messages
```javascript
// ✅ Good: User-friendly messages
handleError(error, {
  customMessage: 'Failed to save your changes. Please try again.',
  context: 'Save Operation'
});

// ❌ Bad: Technical error message
handleError(error, {
  customMessage: error.stack // Too technical for users
});
```

## Error Boundary Fallbacks

### Custom Fallback UI
```javascript
import ErrorBoundary from '../components/ErrorBoundary';

const CustomFallback = ({ error, resetError }) => (
  <div className="p-4 bg-red-50 border border-red-200 rounded">
    <h2>Something went wrong in this section</h2>
    <button onClick={resetError} className="btn btn-primary">
      Try Again
    </button>
  </div>
);

const MyComponent = () => (
  <ErrorBoundary fallback={CustomFallback}>
    <RiskyComponent />
  </ErrorBoundary>
);
```

## Testing Error Handling

### 1. Component Errors
```javascript
// Create a component that throws on demand
const ErrorButton = ({ shouldError }) => {
  if (shouldError) {
    throw new Error('Test component error');
  }
  return <button>Click me</button>;
};
```

### 2. API Errors
```javascript
// Mock API responses
const mockApiError = () => {
  const error = new Error('API Error');
  error.response = { status: 500, data: { message: 'Server error' } };
  throw error;
};
```

### 3. Network Errors
```javascript
// Simulate network failure
const simulateNetworkError = async () => {
  throw new Error('Network Error');
};
```

## Performance Considerations

1. **Error Boundaries:** Minimal performance impact, only activate on errors
2. **Error Handler Hook:** Lightweight, only processes errors when they occur
3. **Toast Notifications:** Batched to prevent spam
4. **Error Reporting:** Async and non-blocking

## Troubleshooting

### Common Issues

1. **Error Boundary Not Catching Error**
   - Error boundaries only catch errors in child components
   - Event handlers and async operations need manual try-catch

2. **Toast Not Showing**
   - Check if `useToast` is properly configured
   - Verify ToastContainer is rendered in your app

3. **Error Reporting Not Working**
   - Check network connectivity
   - Verify error reporting endpoint
   - Check CORS configuration

### Debug Mode

Enable detailed logging by setting localStorage:

```javascript
localStorage.setItem('debug-errors', 'true');
```

This will provide additional console logging for debugging error handling.

## Migration Guide

If you're adding this error handling system to existing components:

1. **Identify Critical Components:** Wrap with ErrorBoundary
2. **Update API Calls:** Add error handlers to queries and mutations
3. **Review Async Operations:** Add try-catch or use withErrorHandling
4. **Test Error Scenarios:** Verify error handling works as expected
5. **Configure Monitoring:** Set up error reporting for production

## Conclusion

This comprehensive error handling system provides:

- **User Experience:** Graceful error recovery with helpful messages
- **Developer Experience:** Detailed error information and easy debugging
- **Production Monitoring:** Automatic error reporting and tracking
- **Reliability:** Multiple layers of error protection

Follow this guide to ensure robust error handling throughout your application.