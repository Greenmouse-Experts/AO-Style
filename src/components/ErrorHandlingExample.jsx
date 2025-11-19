import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ErrorBoundary from './ErrorBoundary';
import useErrorHandler from '../hooks/useErrorHandler';
import { AlertTriangle, RefreshCw, CheckCircle, X } from 'lucide-react';

// Mock API service - replace with your actual API
const mockApiService = {
  fetchData: async () => {
    // Simulate different types of errors randomly
    const random = Math.random();
    if (random < 0.3) {
      throw new Error('Network Error: Failed to fetch');
    }
    if (random < 0.5) {
      const error = new Error('API Error');
      error.response = {
        status: 500,
        data: { message: 'Internal server error' }
      };
      throw error;
    }
    if (random < 0.7) {
      const error = new Error('Validation Error');
      error.response = {
        status: 422,
        data: { message: 'Validation failed: Invalid data format' }
      };
      throw error;
    }

    return {
      data: [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' }
      ]
    };
  },

  createItem: async (data) => {
    // Simulate API call
    const random = Math.random();
    if (random < 0.4) {
      const error = new Error('Create failed');
      error.response = {
        status: 400,
        data: { message: 'Item name already exists' }
      };
      throw error;
    }

    return { id: Date.now(), ...data };
  },

  updateItem: async (id, data) => {
    // Simulate unauthorized error
    if (Math.random() < 0.3) {
      const error = new Error('Unauthorized');
      error.response = {
        status: 401,
        data: { message: 'Authentication required' }
      };
      throw error;
    }

    return { id, ...data };
  }
};

// Component that might throw errors
const ErrorProneComponent = ({ shouldError }) => {
  if (shouldError) {
    throw new Error('Component rendering error - this is a test error from ErrorProneComponent');
  }

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
      <div className="flex items-center gap-2">
        <CheckCircle className="w-5 h-5 text-green-600" />
        <span className="text-green-800">Component rendered successfully!</span>
      </div>
    </div>
  );
};

// Main example component
const ErrorHandlingExample = () => {
  const [shouldComponentError, setShouldComponentError] = useState(false);
  const [newItemName, setNewItemName] = useState('');

  const queryClient = useQueryClient();
  const {
    handleError,
    handleApiError,
    handleNetworkError,
    withErrorHandling,
    handlePromiseRejection
  } = useErrorHandler();

  // Query with error handling
  const {
    data: items,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['items'],
    queryFn: () => handlePromiseRejection(
      mockApiService.fetchData(),
      'Fetch Items'
    ),
    retry: 2,
    retryDelay: 1000,
    onError: (error) => {
      handleApiError(error, 'Failed to load items');
    }
  });

  // Create mutation with error handling
  const createMutation = useMutation({
    mutationFn: withErrorHandling(
      (data) => mockApiService.createItem(data),
      { context: 'Create Item' }
    ),
    onSuccess: () => {
      queryClient.invalidateQueries(['items']);
      setNewItemName('');
    },
    onError: (error) => {
      handleApiError(error, 'Failed to create item');
    }
  });

  // Update mutation with error handling
  const updateMutation = useMutation({
    mutationFn: withErrorHandling(
      ({ id, data }) => mockApiService.updateItem(id, data),
      { context: 'Update Item' }
    ),
    onSuccess: () => {
      queryClient.invalidateQueries(['items']);
    },
    onError: (error) => {
      handleApiError(error, 'Failed to update item');
    }
  });

  // Manual async operation with error handling
  const handleManualAsyncOperation = async () => {
    try {
      // This could be any async operation
      const result = await mockApiService.fetchData();
      console.log('Manual operation successful:', result);
    } catch (error) {
      // Handle error manually
      handleNetworkError(error, 'Manual Async Operation');
    }
  };

  // Handle different types of JavaScript errors
  const triggerJavaScriptError = () => {
    try {
      // This will cause a JavaScript error
      const obj = null;
      obj.someProperty.anotherProperty = 'value';
    } catch (error) {
      handleError(error, {
        context: 'JavaScript Error Demo',
        customMessage: 'A JavaScript error occurred in the demonstration'
      });
    }
  };

  // Handle network simulation
  const simulateNetworkError = async () => {
    try {
      // Simulate a fetch that fails
      const response = await fetch('https://nonexistent-api.example.com/data');
      const data = await response.json();
    } catch (error) {
      handleNetworkError(error, 'Network Simulation');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Error Handling Examples
        </h1>
        <p className="text-gray-600 mb-6">
          This component demonstrates various error handling scenarios including
          API errors, network errors, JavaScript errors, and component errors.
        </p>

        {/* Error Boundary Example */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            1. Error Boundary (Component Errors)
          </h2>
          <div className="space-y-4">
            <button
              onClick={() => setShouldComponentError(!shouldComponentError)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                shouldComponentError
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {shouldComponentError ? 'Fix Component' : 'Break Component'}
            </button>

            <ErrorBoundary>
              <ErrorProneComponent shouldError={shouldComponentError} />
            </ErrorBoundary>
          </div>
        </div>

        {/* API Errors Example */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            2. API Errors (React Query + Error Handler)
          </h2>
          <div className="space-y-4">
            <div className="flex gap-2">
              <button
                onClick={() => refetch()}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Loading...' : 'Fetch Data'}
              </button>
            </div>

            {isError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span className="text-red-800 font-medium">Query Error:</span>
                </div>
                <p className="text-red-700 mt-1">{error?.message}</p>
              </div>
            )}

            {items && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">Loaded Items:</h3>
                <ul className="space-y-1">
                  {items.data?.map(item => (
                    <li key={item.id} className="text-gray-600">
                      • {item.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Mutation Errors Example */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            3. Mutation Errors (Create/Update Operations)
          </h2>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Enter item name"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={() => createMutation.mutate({ name: newItemName })}
                disabled={createMutation.isLoading || !newItemName}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {createMutation.isLoading ? 'Creating...' : 'Create Item'}
              </button>
            </div>

            <button
              onClick={() => updateMutation.mutate({ id: 1, data: { name: 'Updated Item' } })}
              disabled={updateMutation.isLoading}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {updateMutation.isLoading ? 'Updating...' : 'Update Item (May Fail)'}
            </button>
          </div>
        </div>

        {/* Manual Error Handling Examples */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            4. Manual Error Handling
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleManualAsyncOperation}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              Async Operation
            </button>

            <button
              onClick={triggerJavaScriptError}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              JavaScript Error
            </button>

            <button
              onClick={simulateNetworkError}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
            >
              Network Error
            </button>
          </div>
        </div>

        {/* Error Types Information */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-2">Error Handling Features:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• <strong>Component Errors:</strong> Caught by Error Boundaries with graceful UI fallbacks</li>
            <li>• <strong>API Errors:</strong> Handled with user-friendly messages and retry options</li>
            <li>• <strong>Network Errors:</strong> Detected and handled with connection status feedback</li>
            <li>• <strong>Validation Errors:</strong> Displayed with specific field-level feedback</li>
            <li>• <strong>Authentication Errors:</strong> Redirects to login or shows auth prompts</li>
            <li>• <strong>Automatic Logging:</strong> All errors logged for debugging and monitoring</li>
            <li>• <strong>Toast Notifications:</strong> User-friendly error messages via toast system</li>
            <li>• <strong>Error Reporting:</strong> Production errors sent to monitoring services</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ErrorHandlingExample;
