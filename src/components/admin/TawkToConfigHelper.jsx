import React, { useState, useEffect } from "react";
import {
  Settings,
  Check,
  X,
  Copy,
  Eye,
  EyeOff,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Save,
  TestTube,
} from "lucide-react";
import tawkToService from "../../services/tawkto";

/**
 * TawkToConfigHelper Component
 * Admin utility for configuring and testing Tawk.to live chat integration
 */
const TawkToConfigHelper = () => {
  const [config, setConfig] = useState({
    propertyId: import.meta.env.VITE_APP_TAWKTO_PROPERTY_ID || "",
    widgetId: import.meta.env.VITE_APP_TAWKTO_WIDGET_ID || "default",
    enabled: import.meta.env.VITE_APP_ENABLE_LIVE_CHAT === "true",
  });

  const [testResults, setTestResults] = useState({
    propertyIdValid: null,
    scriptLoading: null,
    initialization: null,
    widgetVisible: null,
  });

  const [isTestingConfig, setIsTestingConfig] = useState(false);
  const [showPropertyId, setShowPropertyId] = useState(false);
  const [savedConfig, setSavedConfig] = useState(null);
  const [configStatus, setConfigStatus] = useState("checking");

  // Check current configuration status
  useEffect(() => {
    checkConfigurationStatus();
  }, []);

  const checkConfigurationStatus = () => {
    const hasPropertyId =
      !!config.propertyId && config.propertyId !== "YOUR_PROPERTY_ID_HERE";
    const isEnabled = config.enabled;

    if (!hasPropertyId) {
      setConfigStatus("missing_property_id");
    } else if (!isEnabled) {
      setConfigStatus("disabled");
    } else {
      setConfigStatus("configured");
    }
  };

  // Handle configuration changes
  const handleConfigChange = (field, value) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Save configuration to environment
  const saveConfiguration = () => {
    try {
      // In a real implementation, this would save to your backend
      // For now, we'll save to localStorage as a demo
      const configToSave = {
        ...config,
        lastUpdated: new Date().toISOString(),
      };

      localStorage.setItem("tawkto_config", JSON.stringify(configToSave));
      setSavedConfig(configToSave);

      // Show success message
      alert(
        "Configuration saved successfully! Please restart your application to apply changes.",
      );
    } catch (error) {
      console.error("Failed to save configuration:", error);
      alert("Failed to save configuration. Please try again.");
    }
  };

  // Test current configuration
  const testConfiguration = async () => {
    setIsTestingConfig(true);
    setTestResults({
      propertyIdValid: null,
      scriptLoading: null,
      initialization: null,
      widgetVisible: null,
    });

    try {
      // Test 1: Validate Property ID format
      const propertyIdValid = validatePropertyId(config.propertyId);
      setTestResults((prev) => ({ ...prev, propertyIdValid }));

      if (!propertyIdValid) {
        setIsTestingConfig(false);
        return;
      }

      // Test 2: Test script loading
      setTestResults((prev) => ({ ...prev, scriptLoading: "testing" }));
      const scriptLoads = await testScriptLoading();
      setTestResults((prev) => ({ ...prev, scriptLoading: scriptLoads }));

      // Test 3: Test initialization
      if (scriptLoads) {
        setTestResults((prev) => ({ ...prev, initialization: "testing" }));
        const initSuccess = await testInitialization();
        setTestResults((prev) => ({ ...prev, initialization: initSuccess }));

        // Test 4: Test widget visibility
        if (initSuccess) {
          setTestResults((prev) => ({ ...prev, widgetVisible: "testing" }));
          const widgetVisible = await testWidgetVisibility();
          setTestResults((prev) => ({ ...prev, widgetVisible: widgetVisible }));
        }
      }
    } catch (error) {
      console.error("Configuration test failed:", error);
    } finally {
      setIsTestingConfig(false);
    }
  };

  // Validation functions
  const validatePropertyId = (propertyId) => {
    if (!propertyId || propertyId === "YOUR_PROPERTY_ID_HERE") {
      return false;
    }
    // Tawk.to Property IDs are typically 24 characters long (alphanumeric)
    const propertyIdRegex = /^[a-f0-9]{24}$/i;
    return propertyIdRegex.test(propertyId);
  };

  const testScriptLoading = () => {
    return new Promise((resolve) => {
      const testScript = document.createElement("script");
      testScript.src = `https://embed.tawk.to/${config.propertyId}/${config.widgetId}`;
      testScript.onload = () => {
        resolve(true);
        document.head.removeChild(testScript);
      };
      testScript.onerror = () => {
        resolve(false);
        if (document.head.contains(testScript)) {
          document.head.removeChild(testScript);
        }
      };
      document.head.appendChild(testScript);
    });
  };

  const testInitialization = async () => {
    try {
      await tawkToService.initialize({
        propertyId: config.propertyId,
        widgetId: config.widgetId,
        hideWidget: true,
      });
      return true;
    } catch (error) {
      return false;
    }
  };

  const testWidgetVisibility = () => {
    return new Promise((resolve) => {
      try {
        if (window.Tawk_API) {
          window.Tawk_API.showWidget();
          setTimeout(() => {
            const isVisible = tawkToService.isWidgetVisible();
            window.Tawk_API.hideWidget();
            resolve(isVisible);
          }, 1000);
        } else {
          resolve(false);
        }
      } catch (error) {
        resolve(false);
      }
    });
  };

  // Copy configuration to clipboard
  const copyConfiguration = () => {
    const configText = `# Tawk.to Configuration
VITE_APP_TAWKTO_PROPERTY_ID=${config.propertyId}
VITE_APP_TAWKTO_WIDGET_ID=${config.widgetId}
VITE_APP_ENABLE_LIVE_CHAT=${config.enabled}`;

    navigator.clipboard
      .writeText(configText)
      .then(() => {
        alert("Configuration copied to clipboard!");
      })
      .catch(() => {
        alert("Failed to copy configuration. Please copy manually.");
      });
  };

  // Get status icon and color
  const getStatusDisplay = (status) => {
    switch (status) {
      case true:
        return {
          icon: <Check className="w-4 h-4" />,
          color: "text-green-600",
          bg: "bg-green-100",
        };
      case false:
        return {
          icon: <X className="w-4 h-4" />,
          color: "text-red-600",
          bg: "bg-red-100",
        };
      case "testing":
        return {
          icon: <RefreshCw className="w-4 h-4 animate-spin" />,
          color: "text-blue-600",
          bg: "bg-blue-100",
        };
      default:
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          color: "text-gray-600",
          bg: "bg-gray-100",
        };
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Tawk.to Configuration Helper
          </h1>
          <p className="text-gray-600">
            Configure and test your live chat integration
          </p>
        </div>
      </div>

      {/* Current Status */}
      <div className="mb-6 p-4 rounded-lg border">
        <h2 className="text-lg font-semibold mb-3">Current Status</h2>
        <div className="flex items-center gap-2">
          {configStatus === "configured" && (
            <>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-green-700 font-medium">
                Live chat is configured and enabled
              </span>
            </>
          )}
          {configStatus === "disabled" && (
            <>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-yellow-700 font-medium">
                Live chat is configured but disabled
              </span>
            </>
          )}
          {configStatus === "missing_property_id" && (
            <>
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-red-700 font-medium">
                Property ID not configured
              </span>
            </>
          )}
        </div>
      </div>

      {/* Configuration Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Configuration */}
        <div className="space-y-6">
          <div className="p-4 border rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Configuration</h2>

            {/* Property ID */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tawk.to Property ID *
              </label>
              <div className="relative">
                <input
                  type={showPropertyId ? "text" : "password"}
                  value={config.propertyId}
                  onChange={(e) =>
                    handleConfigChange("propertyId", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your Tawk.to Property ID"
                />
                <button
                  type="button"
                  onClick={() => setShowPropertyId(!showPropertyId)}
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                >
                  {showPropertyId ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Find this in your Tawk.to dashboard: Admin Panel → Property
                Settings
              </p>
            </div>

            {/* Widget ID */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Widget ID (Optional)
              </label>
              <input
                type="text"
                value={config.widgetId}
                onChange={(e) => handleConfigChange("widgetId", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="default"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave as 'default' unless you have a specific widget
                configuration
              </p>
            </div>

            {/* Enable/Disable */}
            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={(e) =>
                    handleConfigChange("enabled", e.target.checked)
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Enable Live Chat
                </span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={saveConfiguration}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Config
              </button>
              <button
                onClick={copyConfiguration}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copy
              </button>
            </div>
          </div>

          {/* Setup Instructions */}
          <div className="p-4 border rounded-lg bg-blue-50">
            <h3 className="font-semibold text-blue-900 mb-2">Quick Setup</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Log into your Tawk.to dashboard</li>
              <li>Go to Admin Panel → Property Settings</li>
              <li>Copy your Property ID and paste it above</li>
              <li>Enable live chat and save configuration</li>
              <li>Test the configuration using the test button</li>
            </ol>
            <a
              href="https://help.tawk.to/article/getting-started"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm mt-2"
            >
              <ExternalLink className="w-3 h-3" />
              Tawk.to Documentation
            </a>
          </div>
        </div>

        {/* Right Column - Testing */}
        <div className="space-y-6">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Configuration Test</h2>
              <button
                onClick={testConfiguration}
                disabled={isTestingConfig || !config.propertyId}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              >
                <TestTube className="w-4 h-4" />
                {isTestingConfig ? "Testing..." : "Test Config"}
              </button>
            </div>

            {/* Test Results */}
            <div className="space-y-3">
              {/* Property ID Validation */}
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <span className="text-sm font-medium">Property ID Format</span>
                <div
                  className={`flex items-center gap-2 px-2 py-1 rounded-full ${getStatusDisplay(testResults.propertyIdValid).bg}`}
                >
                  <span
                    className={
                      getStatusDisplay(testResults.propertyIdValid).color
                    }
                  >
                    {getStatusDisplay(testResults.propertyIdValid).icon}
                  </span>
                </div>
              </div>

              {/* Script Loading */}
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <span className="text-sm font-medium">Script Loading</span>
                <div
                  className={`flex items-center gap-2 px-2 py-1 rounded-full ${getStatusDisplay(testResults.scriptLoading).bg}`}
                >
                  <span
                    className={
                      getStatusDisplay(testResults.scriptLoading).color
                    }
                  >
                    {getStatusDisplay(testResults.scriptLoading).icon}
                  </span>
                </div>
              </div>

              {/* Initialization */}
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <span className="text-sm font-medium">Initialization</span>
                <div
                  className={`flex items-center gap-2 px-2 py-1 rounded-full ${getStatusDisplay(testResults.initialization).bg}`}
                >
                  <span
                    className={
                      getStatusDisplay(testResults.initialization).color
                    }
                  >
                    {getStatusDisplay(testResults.initialization).icon}
                  </span>
                </div>
              </div>

              {/* Widget Visibility */}
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <span className="text-sm font-medium">Widget Visibility</span>
                <div
                  className={`flex items-center gap-2 px-2 py-1 rounded-full ${getStatusDisplay(testResults.widgetVisible).bg}`}
                >
                  <span
                    className={
                      getStatusDisplay(testResults.widgetVisible).color
                    }
                  >
                    {getStatusDisplay(testResults.widgetVisible).icon}
                  </span>
                </div>
              </div>
            </div>

            {/* Test Results Summary */}
            {Object.values(testResults).some((result) => result !== null) && (
              <div className="mt-4 p-3 rounded-lg bg-gray-50">
                <p className="text-sm text-gray-600">
                  {Object.values(testResults).every((result) => result === true)
                    ? "✅ All tests passed! Your Tawk.to integration is working correctly."
                    : "⚠️ Some tests failed. Please check your configuration and try again."}
                </p>
              </div>
            )}
          </div>

          {/* Environment Variables */}
          <div className="p-4 border rounded-lg bg-gray-50">
            <h3 className="font-semibold text-gray-900 mb-2">
              Environment Variables
            </h3>
            <div className="text-sm font-mono text-gray-700 space-y-1">
              <div>VITE_APP_TAWKTO_PROPERTY_ID={config.propertyId || '""'}</div>
              <div>VITE_APP_TAWKTO_WIDGET_ID={config.widgetId}</div>
              <div>VITE_APP_ENABLE_LIVE_CHAT={config.enabled.toString()}</div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Add these to your .env file and restart your application
            </p>
          </div>

          {/* Troubleshooting */}
          <div className="p-4 border rounded-lg bg-yellow-50">
            <h3 className="font-semibold text-yellow-900 mb-2">
              Troubleshooting
            </h3>
            <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
              <li>Ensure your Property ID is correct and active</li>
              <li>Check that Tawk.to scripts aren't blocked by ad blockers</li>
              <li>Test in incognito mode to avoid cache issues</li>
              <li>
                Verify you're not logged in (widget only shows for guests)
              </li>
              <li>Check browser console for error messages</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TawkToConfigHelper;
