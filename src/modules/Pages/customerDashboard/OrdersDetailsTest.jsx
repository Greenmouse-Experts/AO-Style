/**
 * Diagnostic Test Component for Customer Order Details
 *
 * This component helps debug customer order details issues by:
 * - Testing API connectivity
 * - Validating order data structure
 * - Comparing with working implementations
 * - Providing detailed logging and error handling
 */
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { RefreshCw, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import useGetCustomerSingleOrder from "../../../hooks/order/useGetCustomerSingleOrder";
import Loader from "../../../components/ui/Loader";

const OrdersDetailsTest = () => {
  const { id: orderId } = useParams();
  const [testResults, setTestResults] = useState({});
  const [manualOrderId, setManualOrderId] = useState(orderId || "");

  const { isPending, data, isError, error, refetch } =
    useGetCustomerSingleOrder(manualOrderId);

  // Comprehensive test suite
  const runDiagnostics = () => {
    console.log("🔍 RUNNING CUSTOMER ORDER DIAGNOSTICS");

    const tests = {
      urlParamTest: {
        name: "URL Parameter Test",
        pass: !!orderId,
        details: `Order ID from URL: ${orderId || "MISSING"}`,
      },
      apiConnectionTest: {
        name: "API Connection Test",
        pass: !isError,
        details: isError ? `Error: ${error?.message}` : "Connection successful",
      },
      dataStructureTest: {
        name: "Data Structure Test",
        pass: !!data?.data,
        details: data?.data
          ? "Order data received"
          : "No order data in response",
      },
      paymentDataTest: {
        name: "Payment Data Test",
        pass: !!data?.data?.payment,
        details: data?.data?.payment
          ? "Payment data exists"
          : "No payment data found",
      },
      purchaseItemsTest: {
        name: "Purchase Items Test",
        pass: !!data?.data?.payment?.purchase?.items?.length,
        details: `Items count: ${data?.data?.payment?.purchase?.items?.length || 0}`,
      },
      orderStatusTest: {
        name: "Order Status Test",
        pass: !!data?.data?.status,
        details: `Status: ${data?.data?.status || "No status"}`,
      },
      totalAmountTest: {
        name: "Total Amount Test",
        pass: !!(data?.data?.total_amount || data?.data?.payment?.amount),
        details: `Amount: ${data?.data?.total_amount || data?.data?.payment?.amount || "Not found"}`,
      },
    };

    setTestResults(tests);

    // Log comprehensive debug info
    console.log("📊 DIAGNOSTIC RESULTS:", tests);
    console.log("📦 FULL DATA DUMP:", {
      orderId,
      isPending,
      isError,
      error,
      rawData: data,
      processedData: data?.data,
      paymentData: data?.data?.payment,
      purchaseData: data?.data?.payment?.purchase,
      items: data?.data?.payment?.purchase?.items,
    });

    return tests;
  };

  // Run diagnostics when data changes
  useEffect(() => {
    if (!isPending && (data || isError)) {
      runDiagnostics();
    }
  }, [isPending, data, isError, orderId]);

  const TestResultItem = ({ test, name }) => (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center gap-3">
        {test.pass ? (
          <CheckCircle className="text-green-500" size={20} />
        ) : (
          <XCircle className="text-red-500" size={20} />
        )}
        <div>
          <p className="font-medium">{test.name}</p>
          <p className="text-sm text-gray-600">{test.details}</p>
        </div>
      </div>
      <span
        className={`px-2 py-1 rounded text-xs font-medium ${
          test.pass ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}
      >
        {test.pass ? "PASS" : "FAIL"}
      </span>
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white px-6 py-4 mb-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-2 text-blue-600">
          🔍 Customer Order Details Diagnostic Tool
        </h1>
        <p className="text-gray-600">
          <Link to="/customer" className="text-blue-500 hover:underline">
            Dashboard
          </Link>
          {" > "}
          <Link to="/customer/orders" className="text-blue-500 hover:underline">
            Orders
          </Link>
          {" > "}
          Diagnostic Test
        </p>
      </div>

      {/* Manual Order ID Input */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">🎯 Order ID Testing</h2>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">
              Order ID (from URL or manual input):
            </label>
            <input
              type="text"
              value={manualOrderId}
              onChange={(e) => setManualOrderId(e.target.value)}
              placeholder="Enter order ID to test..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => refetch()}
            disabled={isPending || !manualOrderId}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 flex items-center gap-2"
          >
            <RefreshCw size={16} className={isPending ? "animate-spin" : ""} />
            Test Order
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Current Order ID:{" "}
          <code className="bg-gray-100 px-2 py-1 rounded">
            {manualOrderId || "None"}
          </code>
        </p>
      </div>

      {/* Loading State */}
      {isPending && (
        <div className="bg-blue-50 p-6 rounded-lg shadow mb-6">
          <div className="flex items-center justify-center">
            <Loader />
            <span className="ml-3 text-blue-600">Running diagnostics...</span>
          </div>
        </div>
      )}

      {/* Test Results */}
      {Object.keys(testResults).length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">📋 Diagnostic Results</h2>
          <div className="space-y-3">
            {Object.entries(testResults).map(([key, test]) => (
              <TestResultItem key={key} test={test} name={key} />
            ))}
          </div>

          {/* Overall Status */}
          <div className="mt-6 p-4 border-t">
            <div className="flex items-center gap-3">
              {Object.values(testResults).every((test) => test.pass) ? (
                <>
                  <CheckCircle className="text-green-500" size={24} />
                  <div>
                    <p className="font-semibold text-green-800">
                      All Tests Passed!
                    </p>
                    <p className="text-sm text-gray-600">
                      Customer order details should be working correctly.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="text-yellow-500" size={24} />
                  <div>
                    <p className="font-semibold text-yellow-800">
                      Issues Detected
                    </p>
                    <p className="text-sm text-gray-600">
                      {
                        Object.values(testResults).filter((test) => !test.pass)
                          .length
                      }{" "}
                      test(s) failed. Check the details above.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Raw Data Display */}
      {data && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">🗂️ Raw API Response</h2>
          <div className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96">
            <pre className="text-sm whitespace-pre-wrap">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Error Display */}
      {isError && (
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4 text-red-800">
            ❌ Error Details
          </h2>
          <div className="space-y-2">
            <p>
              <strong>Message:</strong> {error?.message}
            </p>
            {error?.response?.status && (
              <p>
                <strong>Status:</strong> {error.response.status}
              </p>
            )}
            {error?.response?.data && (
              <div>
                <strong>Response Data:</strong>
                <pre className="bg-red-100 p-2 rounded mt-2 text-sm">
                  {JSON.stringify(error.response.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">🚀 Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/customer/orders"
            className="p-4 border border-blue-200 rounded-lg hover:bg-blue-50 text-center transition-colors"
          >
            <p className="font-medium text-blue-600">View All Orders</p>
            <p className="text-sm text-gray-600">Go back to orders list</p>
          </Link>

          {manualOrderId && (
            <Link
              to={`/customer/orders/orders-details/${manualOrderId}`}
              className="p-4 border border-green-200 rounded-lg hover:bg-green-50 text-center transition-colors"
            >
              <p className="font-medium text-green-600">View Order Details</p>
              <p className="text-sm text-gray-600">Open actual details page</p>
            </Link>
          )}

          <button
            onClick={() => window.location.reload()}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center transition-colors"
          >
            <p className="font-medium text-gray-600">Refresh Page</p>
            <p className="text-sm text-gray-600">Reload this diagnostic</p>
          </button>
        </div>
      </div>

      {/* Debug Console Log Button */}
      <div className="mt-4 text-center">
        <button
          onClick={() => {
            console.log("🔍 MANUAL DEBUG LOG:");
            console.log("Current State:", {
              orderId,
              manualOrderId,
              isPending,
              isError,
              error,
              data,
              testResults,
            });
          }}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
        >
          💻 Log Debug Info to Console
        </button>
      </div>
    </div>
  );
};

export default OrdersDetailsTest;
