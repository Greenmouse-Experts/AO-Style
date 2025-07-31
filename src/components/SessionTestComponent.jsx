import React, { useState, useEffect } from "react";
import useSessionManager from "../hooks/useSessionManager";
import sessionManager from "../services/SessionManager";
import Cookies from "js-cookie";

const SessionTestComponent = () => {
  const [tokenInfo, setTokenInfo] = useState(null);
  const [testResult, setTestResult] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  const {
    isAuthenticated,
    timeUntilExpiry,
    showExpiryModal,
    refreshAccessToken,
    logout,
  } = useSessionManager();

  // Update token info every second
  useEffect(() => {
    const interval = setInterval(() => {
      const authData = sessionManager.getAuthData();
      if (authData) {
        const tokenExpiry = sessionManager.decodeTokenExpiry(
          authData.accessToken,
        );
        const refreshExpiry = new Date(authData.refreshTokenExpiry).getTime();
        const now = Date.now();

        // Also check cookie tokens for comparison
        const cookieToken = Cookies.get("token");
        const adminCookieToken = Cookies.get("adminToken");

        setTokenInfo({
          accessTokenExpiry: tokenExpiry
            ? new Date(tokenExpiry).toISOString()
            : "Invalid",
          refreshTokenExpiry: authData.refreshTokenExpiry,
          timeUntilAccessExpiry: tokenExpiry
            ? Math.max(0, Math.floor((tokenExpiry - now) / 1000))
            : 0,
          timeUntilRefreshExpiry: Math.max(
            0,
            Math.floor((refreshExpiry - now) / 1000),
          ),
          isAccessTokenExpired: sessionManager.isTokenExpired(),
          isRefreshTokenExpired: sessionManager.isRefreshTokenExpired(),
          authenticated: isAuthenticated,
          // Debug info
          sessionManagerToken: authData.accessToken?.substring(0, 20) + "...",
          cookieToken: cookieToken?.substring(0, 20) + "..." || "None",
          adminCookieToken:
            adminCookieToken?.substring(0, 20) + "..." || "None",
          tokensMatch:
            authData.accessToken === cookieToken ||
            authData.accessToken === adminCookieToken,
        });
      } else {
        setTokenInfo(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const createInstantExpiryToken = () => {
    const authData = sessionManager.getAuthData();
    if (!authData) {
      setTestResult("❌ No auth data found");
      return;
    }

    try {
      // Create a token that expires in 5 seconds
      const header = { alg: "HS256", typ: "JWT" };
      const payload = {
        ...JSON.parse(atob(authData.accessToken.split(".")[1])),
        exp: Math.floor(Date.now() / 1000) + 5, // Expire in 5 seconds
      };

      const encodedHeader = btoa(JSON.stringify(header));
      const encodedPayload = btoa(JSON.stringify(payload));
      const fakeToken = `${encodedHeader}.${encodedPayload}.fake-signature`;

      // Update the token in session manager
      sessionManager.setAuthData({
        accessToken: fakeToken,
        refreshToken: authData.refreshToken,
        refreshTokenExpiry: authData.refreshTokenExpiry,
      });

      setTestResult("✅ Created instant expiry token (5 seconds)");
    } catch (error) {
      setTestResult("❌ Error creating test token: " + error.message);
    }
  };

  const createInstantRefreshExpiry = () => {
    const authData = sessionManager.getAuthData();
    if (!authData) {
      setTestResult("❌ No auth data found");
      return;
    }

    // Set refresh token to expire in 10 seconds
    const newExpiry = new Date(Date.now() + 10000).toISOString();

    sessionManager.setAuthData({
      accessToken: authData.accessToken,
      refreshToken: authData.refreshToken,
      refreshTokenExpiry: newExpiry,
    });

    setTestResult(
      "✅ Set refresh token to expire in 10 seconds - Modal will appear when it expires (not before)!",
    );
  };

  const createExpiredTokenModalTest = () => {
    const authData = sessionManager.getAuthData();
    if (!authData) {
      setTestResult("❌ No auth data found");
      return;
    }

    // Set refresh token to have expired 1 second ago
    const newExpiry = new Date(Date.now() - 1000).toISOString();

    sessionManager.setAuthData({
      accessToken: authData.accessToken,
      refreshToken: authData.refreshToken,
      refreshTokenExpiry: newExpiry,
    });

    // Reset warning flag to allow immediate trigger
    sessionManager.warningShown = false;

    // Ensure user is marked as active
    sessionManager.updateActivity();

    setTestResult(
      "✅ Refresh token expired - Modal will appear immediately (since you're active)!",
    );
  };

  const testApiRequest = async () => {
    try {
      setTestResult("🔄 Testing API request...");

      // Import the API service dynamically to avoid circular imports
      const { GetUser } = await import("../services/api/auth");

      const response = await GetUser();
      setTestResult(
        "✅ API request successful: " + response.data?.message || "Success",
      );
    } catch (error) {
      setTestResult(
        "❌ API request failed: " +
          (error?.data?.message || error?.message || "Unknown error"),
      );
    }
  };

  if (!isAuthenticated && !tokenInfo) {
    // return (
    //   // <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg">
    //   //   <p>Please log in to test session management</p>
    //   // </div>
    // );
  }

  return (
    <>
      {/* Toggle Button */}
      {/* <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 z-50"
        title="Toggle Session Test Panel"
      >
        🔧
      </button> */}

      {/* Test Panel */}
      {/* {isVisible && (
        <div className="fixed bottom-16 right-4 bg-white border-2 border-gray-300 rounded-lg shadow-xl p-4 w-96 max-h-96 overflow-y-auto z-40"> */}
      {/* <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">
              Session Test Panel
            </h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div> */}

      {/* Current Status */}
      {/* <div className="mb-4 p-3 bg-gray-50 rounded">
            <h4 className="font-semibold text-gray-700 mb-2">Current Status</h4>
            <div className="text-sm space-y-1">
              <p>
                🔐 Authenticated:{" "}
                <span
                  className={
                    isAuthenticated ? "text-green-600" : "text-red-600"
                  }
                >
                  {isAuthenticated ? "Yes" : "No"}
                </span>
              </p>
              <p>
                ⚠️ Modal Showing:{" "}
                <span
                  className={
                    showExpiryModal ? "text-orange-600" : "text-gray-600"
                  }
                >
                  {showExpiryModal ? "Yes" : "No"}
                </span>
              </p>
              <p>
                ⏱️ Time Until Refresh Expiry:{" "}
                <span className="font-mono">
                  {timeUntilExpiry > 0 ? `${timeUntilExpiry}s` : "EXPIRED"}
                </span>
              </p>
            </div>
          </div> */}

      {/* Token Info */}
      {/* {tokenInfo && (
            <div className="mb-4 p-3 bg-blue-50 rounded">
              <h4 className="font-semibold text-blue-700 mb-2">
                Token Details
              </h4>
              <div className="text-xs space-y-1">
                <p>
                  🔑 Access Token Expired:{" "}
                  <span
                    className={
                      tokenInfo.isAccessTokenExpired
                        ? "text-red-600"
                        : "text-green-600"
                    }
                  >
                    {tokenInfo.isAccessTokenExpired ? "Yes" : "No"}
                  </span>
                </p>
                <p>
                  🔄 Refresh Token Expired:{" "}
                  <span
                    className={
                      tokenInfo.isRefreshTokenExpired
                        ? "text-red-600"
                        : "text-green-600"
                    }
                  >
                    {tokenInfo.isRefreshTokenExpired ? "Yes" : "No"}
                  </span>
                </p>
                <p>
                  ⏰ Access expires in:{" "}
                  <span className="font-mono">
                    {tokenInfo.timeUntilAccessExpiry}s
                  </span>
                </p>
                <p>
                  ⏰ Refresh expires in:{" "}
                  <span className="font-mono">
                    {tokenInfo.timeUntilRefreshExpiry}s
                  </span>
                </p>
                <p className="truncate">
                  📅 Access Expiry: {tokenInfo.accessTokenExpiry}
                </p>
                <p className="truncate">
                  📅 Refresh Expiry: {tokenInfo.refreshTokenExpiry}
                </p>
              </div>
            </div>
          )} */}

      {/* Debug Info */}
      {/* {tokenInfo && (
            <div className="mb-4 p-3 bg-yellow-50 rounded">
              <h4 className="font-semibold text-yellow-700 mb-2">
                Debug Token Info
              </h4>
              <div className="text-xs space-y-1">
                <p>
                  🔍 SessionManager Token:{" "}
                  <span className="font-mono text-blue-600">
                    {tokenInfo.sessionManagerToken}
                  </span>
                </p>
                <p>
                  🍪 Cookie Token:{" "}
                  <span className="font-mono text-green-600">
                    {tokenInfo.cookieToken}
                  </span>
                </p>
                <p>
                  🔑 Admin Cookie Token:{" "}
                  <span className="font-mono text-purple-600">
                    {tokenInfo.adminCookieToken}
                  </span>
                </p>
                <p>
                  ✅ Tokens Match:{" "}
                  <span
                    className={
                      tokenInfo.tokensMatch ? "text-green-600" : "text-red-600"
                    }
                  >
                    {tokenInfo.tokensMatch ? "Yes" : "No"}
                  </span>
                </p>
              </div>
            </div>
          )} */}

      {/* Test Actions */}
      {/* <div className="mb-4 space-y-2">
            <h4 className="font-semibold text-gray-700">Test Actions</h4>
            <button
              onClick={createInstantExpiryToken}
              className="w-full bg-orange-500 text-white py-2 px-3 rounded text-sm hover:bg-orange-600"
            >
              🚀 Create Instant Access Token Expiry (5s)
            </button>
            <button
              onClick={createInstantRefreshExpiry}
              className="w-full bg-red-500 text-white py-2 px-3 rounded text-sm hover:bg-red-600"
            >
              💀 Set Refresh Token to Expire (10s)
            </button>
            <button
              onClick={createExpiredTokenModalTest}
              className="w-full bg-red-600 text-white py-2 px-3 rounded text-sm hover:bg-red-700"
            >
              🚫 Test Expired Token Modal (Now)
            </button>
            <button
              onClick={refreshAccessToken}
              className="w-full bg-green-500 text-white py-2 px-3 rounded text-sm hover:bg-green-600"
            >
              🔄 Manually Refresh Token
            </button>
            <button
              onClick={logout}
              className="w-full bg-gray-500 text-white py-2 px-3 rounded text-sm hover:bg-gray-600"
            >
              🚪 Manual Logout
            </button>
            <button
              onClick={testApiRequest}
              className="w-full bg-blue-500 text-white py-2 px-3 rounded text-sm hover:bg-blue-600"
            >
              🧪 Test API Request
            </button>
          </div> */}

      {/* Test Result */}
      {/* {testResult && (
            <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
              <p>{testResult}</p>
            </div>
          )} */}

      {/* Instructions */}
      {/* <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-600">
            <h5 className="font-semibold mb-1">Test Instructions:</h5>
            <ol className="list-decimal list-inside space-y-1">
              <li>
                Click "Create Instant Access Token Expiry" to test access token
                expiration
              </li>
              <li>
                Click "Set Refresh Token to Expire" - modal appears ONLY when it
                expires
              </li>
              <li>
                Click "Test Expired Token Modal" to expire token immediately
              </li>
              <li>
                Try to close the modal - you cannot! Must choose refresh or
                login
              </li>
              <li>
                If you're inactive for 5+ minutes, it auto-logs out instead of
                showing modal
              </li>
              <li>Refresh the page to test token validation on startup</li>
            </ol>
          </div> */}
      {/* </div>
      )} */}
    </>
  );
};

export default SessionTestComponent;
