# Error Boundary Implementation Guide

## Overview

This guide explains how to use the custom Error Boundary components implemented in the AO-Style application to provide better user experience when JavaScript errors occur.

## Components Created

### 1. GlobalErrorBoundary
- **Location**: `src/components/ErrorBoundary/GlobalErrorBoundary.jsx`
- **Purpose**: Catches all unhandled errors at the application level
- **Features**:
  - Smart error type detection (network, chunk loading, permissions, data errors)
  - Retry functionality with attempt counting
  - Different UI based on error type
  - Automatic error reporting
  - Contact support options
  - Development mode debugging

### 2. ErrorBoundary (Basic)
- **Location**: `src/components/ErrorBoundary/ErrorBoundary.jsx`
- **Purpose**: Simple, lightweight error boundary for specific components
- **Features**:
  - Clean, minimal UI
  - Basic retry functionality
  - Email support integration

### 3. RouteErrorBoundary
- **Location**: `src/components/ErrorBoundary/RouteErrorBoundary.jsx`
- **Purpose**: Handles errors at the route/page level
- **Features**:
  - Page-specific error handling
  - Navigation options (back, home, retry)
  - Automatic reset on route changes

## Current Implementation

The GlobalErrorBoundary is already implemented in `src/main.jsx` and wraps the entire application:

```jsx
<GlobalErrorBoundary>
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_LOGIN}>
    <QueryProvider>
      <RouterProvider router={router} />
      <AppWrapper />
      <ToastContainer />
    </QueryProvider>
  </GoogleOAuthProvider>
</GlobalErrorBoundary>
```

## How to Use

### 1. Application-Level Errors (Already Setup)
The GlobalErrorBoundary automatically catches all unhandled errors in your app.

### 2. Component-Level Errors
Wrap specific components that might throw errors:

```jsx
import ErrorBoundary from '../../components/ErrorBoundary';

function MyPage() {
  return (
    <ErrorBoundary>
      <SomeRiskyComponent />
      <AnotherComponent />
    </ErrorBoundary>
  );
}
```

### 3. Route-Level Errors
Add to your layout components:

```jsx
import RouteErrorBoundary from '../../components/ErrorBoundary/RouteErrorBoundary';

function AdminLayout() {
  return (
    <RouteErrorBoundary>
      <div className="admin-layout">
        <Sidebar />
        <main>
          <Outlet />
        </main>
      </div>
    </RouteErrorBoundary>
  );
}
```

### 4. Manual Error Handling
Use the custom hook for API calls and async operations:

```jsx
import useErrorHandler from '../../hooks/useErrorHandler';

function MyComponent() {
  const { handleAsyncError, handleError } = useErrorHandler();

  const handleApiCall = async () => {
    await handleAsyncError(
      async () => {
        const response = await api.getSomeData();
        return response;
      },
      {
        context: { component: 'MyComponent', action: 'fetchData' },
        toastMessage: 'Failed to load data. Please try again.',
        onError: (error, errorId) => {
          console.log('Custom error handling:', errorId);
        }
      }
    );
  };

  const handleButtonClick = () => {
    try {
      // Some risky operation
      riskyOperation();
    } catch (error) {
      handleError(error, {
        context: { component: 'MyComponent', action: 'buttonClick' },
        toastMessage: 'Operation failed'
      });
    }
  };

  return (
    <div>
      <button onClick={handleApiCall}>Load Data</button>
      <button onClick={handleButtonClick}>Risky Action</button>
    </div>
  );
}
```

## Error Types & UI

The GlobalErrorBoundary automatically detects different error types and shows appropriate UI:

### Network Errors
- **Icon**: WiFi Off
- **Color**: Orange
- **Actions**: Retry, Refresh Page, Go Home
- **Message**: Connection problem

### Chunk Loading Errors
- **Icon**: Refresh
- **Color**: Blue
- **Actions**: Refresh Page, Go Home
- **Message**: Loading error (usually after app updates)

### Permission Errors
- **Icon**: Shield
- **Color**: Red
- **Actions**: Go Home only
- **Message**: Access denied

### Data Errors
- **Icon**: Bug
- **Color**: Purple
- **Actions**: Retry, Refresh Page, Go Home
- **Message**: Data processing problem

### Unknown Errors
- **Icon**: Alert Triangle
- **Color**: Red
- **Actions**: Retry, Refresh Page, Go Home
- **Message**: Generic error message

## Configuration

### Error Reporting
To enable automatic error reporting, update the `reportError` function in `GlobalErrorBoundary.jsx`:

```jsx
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

// Send to your backend
await fetch('/api/errors', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(errorReport)
});
```

### Support Contact
Update contact information in the error boundary components:

```jsx
// Email
<a href="mailto:support@carybin.com">support@carybin.com</a>

// WhatsApp (update the phone number)
<a href="https://wa.me/1234567890" target="_blank">WhatsApp Support</a>
```

## Recommended Implementation Strategy

### Phase 1: Global Coverage (✅ Already Done)
- GlobalErrorBoundary wraps the entire app

### Phase 2: Route-Level Protection
Add RouteErrorBoundary to your main layouts:

```jsx
// src/layouts/super-dashboard/admin/index.jsx
import RouteErrorBoundary from '../../../components/ErrorBoundary/RouteErrorBoundary';

export default function AdminLayout() {
  return (
    <RouteErrorBoundary>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
            <Outlet />
          </main>
        </div>
      </div>
    </RouteErrorBoundary>
  );
}
```

### Phase 3: Component-Level Protection
Add ErrorBoundary around high-risk components:
- Forms with complex validation
- Data visualization components
- Third-party integrations
- Components that manipulate DOM directly

### Phase 4: Manual Error Handling
Implement the useErrorHandler hook in:
- API service calls
- Event handlers
- Async operations
- Form submissions

## Best Practices

### 1. Don't Overuse Error Boundaries
- Use sparingly - only where errors are likely
- Don't wrap every single component
- Focus on critical user flows

### 2. Provide Meaningful Error Messages
- Avoid technical jargon
- Explain what the user can do
- Provide alternative actions

### 3. Log Errors Properly
- Include enough context for debugging
- Use consistent error IDs
- Log user actions leading to the error

### 4. Test Error Scenarios
```jsx
// For testing - add this button in development
{process.env.NODE_ENV === 'development' && (
  <button onClick={() => { throw new Error('Test error') }}>
    Test Error Boundary
  </button>
)}
```

### 5. Graceful Degradation
- Always provide a way for users to continue
- Don't block the entire application
- Offer alternative paths

## Monitoring & Analytics

Consider integrating with error monitoring services:
- **Sentry**: Professional error tracking
- **LogRocket**: Session replay with errors
- **Bugsnag**: Error monitoring and reporting

Example Sentry integration:

```jsx
import * as Sentry from '@sentry/react';

// In reportError function
Sentry.captureException(error, {
  tags: { errorBoundary: true },
  extra: errorInfo
});
```

## Troubleshooting

### Common Issues

1. **Error Boundary Not Catching Errors**
   - Error boundaries only catch errors in component tree below them
   - They don't catch errors in event handlers, async code, or during SSR

2. **Infinite Error Loops**
   - Make sure error boundary components themselves don't throw errors
   - Use try-catch in error reporting functions

3. **Development vs Production**
   - In development, React shows the error overlay first
   - Error boundaries work properly in production builds

### Testing Error Boundaries

```jsx
// Test component
function ErrorThrower({ shouldThrow }) {
  if (shouldThrow) {
    throw new Error('Test error for error boundary');
  }
  return <div>No error</div>;
}

// Usage
<ErrorBoundary>
  <ErrorThrower shouldThrow={testMode} />
</ErrorBoundary>
```

## Support

For issues with error boundaries:
1. Check browser console for additional error details
2. Verify error boundary placement in component tree
3. Test with production build
4. Contact development team with error ID for investigation

---

**Note**: The error boundaries are designed to improve user experience while providing developers with debugging information. They should be part of a comprehensive error handling strategy that includes proper logging, monitoring, and user feedback systems.