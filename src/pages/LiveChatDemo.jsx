import React, { useState, useEffect } from "react";
import {
  MessageCircle,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Settings,
  LogOut,
  LogIn,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";
import Cookies from "js-cookie";
import { useCarybinUserStore } from "../store/carybinUserStore";
import tawkToService from "../services/tawkto";

/**
 * LiveChatDemo Component
 * Demo page for testing and showcasing live chat functionality
 */
const LiveChatDemo = () => {
  const { carybinUser, setCaryBinUser, logOut } = useCarybinUserStore();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [tawkToStatus, setTawkToStatus] = useState("loading");
  const [chatMetrics, setChatMetrics] = useState({
    totalVisitors: 0,
    activeChats: 0,
    avgResponseTime: "2 min",
    satisfaction: "98%",
  });
  const [demoMode, setDemoMode] = useState("guest");
  const [showDetails, setShowDetails] = useState(false);

  // Check authentication status
  useEffect(() => {
    const checkAuthStatus = () => {
      const adminToken = Cookies.get("adminToken");
      const userToken = Cookies.get("token");
      const hasUser = !!carybinUser;

      const authenticated = !!(adminToken || userToken || hasUser);
      setIsLoggedIn(authenticated);
      setDemoMode(authenticated ? "logged_in" : "guest");
    };

    checkAuthStatus();
    const interval = setInterval(checkAuthStatus, 2000);
    return () => clearInterval(interval);
  }, [carybinUser]);

  // Monitor Tawk.to status
  useEffect(() => {
    const checkTawkToStatus = () => {
      if (tawkToService.isInitialized) {
        const status = tawkToService.getStatus();
        setTawkToStatus(status);
      } else {
        setTawkToStatus("not_initialized");
      }
    };

    checkTawkToStatus();
    const interval = setInterval(checkTawkToStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // Simulate metrics update
  useEffect(() => {
    const updateMetrics = () => {
      setChatMetrics((prev) => ({
        ...prev,
        totalVisitors: prev.totalVisitors + Math.floor(Math.random() * 3),
        activeChats: Math.floor(Math.random() * 8) + 1,
      }));
    };

    const interval = setInterval(updateMetrics, 10000);
    return () => clearInterval(interval);
  }, []);

  // Demo user login/logout
  const handleDemoLogin = () => {
    const demoUser = {
      id: "demo_user_123",
      name: "Demo User",
      email: "demo@ao-style.com",
      role: "customer",
    };

    setCaryBinUser(demoUser);
    Cookies.set("token", "demo_token_123", { expires: 1 });
    setDemoMode("logged_in");
  };

  const handleDemoLogout = () => {
    logOut();
    Cookies.remove("token");
    Cookies.remove("adminToken");
    setDemoMode("guest");
  };

  // Refresh Tawk.to status
  const refreshTawkToStatus = () => {
    window.location.reload();
  };

  // Get status color
  const getStatusColor = () => {
    switch (tawkToStatus) {
      case "online":
        return "text-green-600 bg-green-100";
      case "away":
        return "text-yellow-600 bg-yellow-100";
      case "offline":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  // Get status text
  const getStatusText = () => {
    switch (tawkToStatus) {
      case "online":
        return "Agents Online";
      case "away":
        return "Agents Away";
      case "offline":
        return "Agents Offline";
      case "loading":
        return "Loading...";
      case "not_initialized":
        return "Not Initialized";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Live Chat Demo & Testing
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Experience our intelligent chat routing system. Guests see Tawk.to
            live chat, while logged-in users access our internal messaging
            system.
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Authentication Status */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Auth Status</h3>
              {isLoggedIn ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-2">
              {isLoggedIn ? "Logged In" : "Guest User"}
            </p>
            <p className="text-sm text-gray-600">
              {isLoggedIn ? "Internal chat active" : "Tawk.to live chat active"}
            </p>
          </div>

          {/* Live Chat Status */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Live Chat</h3>
              <div
                className={`w-3 h-3 rounded-full ${getStatusColor().includes("green") ? "bg-green-500" : getStatusColor().includes("yellow") ? "bg-yellow-500" : "bg-red-500"}`}
              ></div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-2">
              {getStatusText()}
            </p>
            <p className="text-sm text-gray-600">Tawk.to integration status</p>
          </div>

          {/* Active Visitors */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Visitors</h3>
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-2">
              {chatMetrics.totalVisitors}
            </p>
            <p className="text-sm text-gray-600">Total site visitors today</p>
          </div>

          {/* Response Time */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Response</h3>
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-2">
              {chatMetrics.avgResponseTime}
            </p>
            <p className="text-sm text-gray-600">Average response time</p>
          </div>
        </div>

        {/* Demo Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Authentication Demo */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Authentication Demo
            </h2>
            <p className="text-gray-600 mb-6">
              Test how the chat system changes based on authentication status.
            </p>

            <div className="space-y-4">
              {/* Current Mode */}
              <div
                className={`p-4 rounded-lg border-2 ${demoMode === "guest" ? "border-blue-500 bg-blue-50" : "border-green-500 bg-green-50"}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded-full ${demoMode === "guest" ? "bg-blue-500" : "bg-green-500"}`}
                  ></div>
                  <span className="font-medium">
                    {demoMode === "guest" ? "Guest Mode" : "Logged In Mode"}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {demoMode === "guest"
                    ? "You should see the Tawk.to live chat widget"
                    : "You should see the internal chat system"}
                </p>
              </div>

              {/* Demo Controls */}
              <div className="flex gap-3">
                {!isLoggedIn ? (
                  <button
                    onClick={handleDemoLogin}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    Demo Login
                  </button>
                ) : (
                  <button
                    onClick={handleDemoLogout}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Demo Logout
                  </button>
                )}

                <button
                  onClick={refreshTawkToStatus}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Chat System Info */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Chat System Details
            </h2>

            <div className="space-y-4">
              {/* System Status */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <span className="font-medium">Current Chat System</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${isLoggedIn ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}
                >
                  {isLoggedIn ? "Internal Chat" : "Tawk.to Live Chat"}
                </span>
              </div>

              {/* Tawk.to Status */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <span className="font-medium">Tawk.to Status</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}
                >
                  {getStatusText()}
                </span>
              </div>

              {/* Configuration */}
              <div className="p-3 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Configuration</span>
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {showDetails ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {showDetails && (
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>
                      Property ID:{" "}
                      {import.meta.env.VITE_APP_TAWKTO_PROPERTY_ID
                        ? "✅ Configured"
                        : "❌ Not Set"}
                    </div>
                    <div>
                      Widget ID:{" "}
                      {import.meta.env.VITE_APP_TAWKTO_WIDGET_ID || "default"}
                    </div>
                    <div>
                      Enabled:{" "}
                      {import.meta.env.VITE_APP_ENABLE_LIVE_CHAT === "true"
                        ? "✅ Yes"
                        : "❌ No"}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Features Showcase */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Live Chat Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Smart Routing */}
            <div className="text-center p-6 rounded-lg border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Smart Routing
              </h3>
              <p className="text-sm text-gray-600">
                Automatically routes guests to Tawk.to and logged-in users to
                internal chat
              </p>
            </div>

            {/* Real-time Status */}
            <div className="text-center p-6 rounded-lg border-2 border-dashed border-gray-200 hover:border-green-300 transition-colors">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Real-time Status
              </h3>
              <p className="text-sm text-gray-600">
                Live status updates showing agent availability and response
                times
              </p>
            </div>

            {/* Professional UI */}
            <div className="text-center p-6 rounded-lg border-2 border-dashed border-gray-200 hover:border-purple-300 transition-colors">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Settings className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Professional UI
              </h3>
              <p className="text-sm text-gray-600">
                Custom-designed interface with tooltips, animations, and
                responsive design
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-white">
          <h2 className="text-2xl font-semibold mb-4">How to Test</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-3">For Guest Users (Tawk.to):</h3>
              <ol className="space-y-2 text-sm list-decimal list-inside">
                <li>
                  Make sure you're logged out (click "Demo Logout" if needed)
                </li>
                <li>
                  Look for the live chat button in the bottom-right corner
                </li>
                <li>Click the button to open Tawk.to chat widget</li>
                <li>Notice the professional styling and status indicators</li>
                <li>Test the chat functionality with your support team</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold mb-3">
                For Logged-in Users (Internal):
              </h3>
              <ol className="space-y-2 text-sm list-decimal list-inside">
                <li>Click "Demo Login" to simulate user authentication</li>
                <li>Notice how the live chat button disappears</li>
                <li>The internal chat system should now be available</li>
                <li>Test switching between modes by logging in/out</li>
                <li>Verify the seamless transition between systems</li>
              </ol>
            </div>
          </div>

          <div className="mt-6 p-4 bg-white/10 rounded-lg">
            <p className="text-sm">
              <strong>Note:</strong> Make sure your Tawk.to Property ID is
              configured in the environment variables for the live chat to work
              properly. Check the setup guide for detailed instructions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveChatDemo;
