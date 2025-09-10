import React, { useState } from "react";
import { Upload, AlertCircle, CheckCircle, X, Info } from "lucide-react";
import useUploadImage from "../../hooks/multimedia/useUploadImage";
import useToast from "../../hooks/useToast";
import Cookies from "js-cookie";

const FabricUploadDebug = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [debugInfo, setDebugInfo] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const { uploadImageMutate, isPending } = useUploadImage();
  const { toastSuccess, toastError } = useToast();

  const runDiagnostics = () => {
    const info = {
      // Authentication checks
      fabricToken: !!Cookies.get("fabricToken"),
      token: !!Cookies.get("token"),
      adminToken: !!Cookies.get("adminToken"),

      // Network checks
      onlineStatus: navigator.onLine,

      // Path checks
      currentPath: window.location.pathname,
      isFabricRoute: window.location.pathname.includes("/fabric"),

      // Browser capabilities
      formDataSupported: typeof FormData !== "undefined",
      fileAPISupported: typeof FileReader !== "undefined",

      // Environment
      baseURL: import.meta.env.VITE_APP_CaryBin_API_URL,

      // Time
      timestamp: new Date().toISOString(),
    };

    setDebugInfo(info);
    console.log("🔍 Fabric Upload Debug Info:", info);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toastError("File size must be less than 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toastError("Please select a valid image file");
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const testUpload = async () => {
    if (!selectedFile) {
      toastError("Please select a file first");
      return;
    }

    console.log("🧪 Starting upload test...");
    setTestResult(null);

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const startTime = Date.now();

      uploadImageMutate(formData, {
        onSuccess: (result) => {
          const endTime = Date.now();
          const duration = endTime - startTime;

          console.log("✅ Test upload successful:", result);

          const imageUrl =
            result?.data?.data?.url ||
            result?.url ||
            result?.data?.image_url ||
            result?.imageUrl ||
            result?.data?.url;

          setTestResult({
            success: true,
            duration: `${duration}ms`,
            imageUrl,
            response: result,
            message: "Upload successful!"
          });

          toastSuccess("Test upload successful!");
        },
        onError: (error) => {
          const endTime = Date.now();
          const duration = endTime - startTime;

          console.error("❌ Test upload failed:", error);

          setTestResult({
            success: false,
            duration: `${duration}ms`,
            error: error?.response?.data || error,
            status: error?.response?.status,
            message: error?.response?.data?.message || error?.message || "Upload failed"
          });

          toastError(`Test upload failed: ${error?.response?.data?.message || error?.message}`);
        }
      });
    } catch (error) {
      console.error("❌ Upload test error:", error);
      setTestResult({
        success: false,
        error: error,
        message: error.message || "Unknown error"
      });
    }
  };

  const clearTest = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setTestResult(null);
    const fileInput = document.getElementById("debug-upload");
    if (fileInput) fileInput.value = "";
  };

  // Only show on fabric routes
  if (!window.location.pathname.includes("/fabric")) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="Fabric Upload Debug"
      >
        <AlertCircle className="w-5 h-5" />
      </button>

      {/* Debug Panel */}
      {isVisible && (
        <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-2xl border w-96 max-h-[80vh] overflow-y-auto">
          <div className="p-4 border-b bg-blue-50">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Fabric Upload Debug
              </h3>
              <button
                onClick={() => setIsVisible(false)}
                className="text-blue-600 hover:text-blue-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* System Diagnostics */}
            <div>
              <button
                onClick={runDiagnostics}
                className="w-full bg-gray-100 text-gray-700 p-2 rounded hover:bg-gray-200 transition-colors text-sm"
              >
                Run System Diagnostics
              </button>

              {Object.keys(debugInfo).length > 0 && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono">
                  {Object.entries(debugInfo).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-600">{key}:</span>
                      <span className={value ? "text-green-600" : "text-red-600"}>
                        {String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* File Upload Test */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Upload Test</h4>

              {!selectedFile ? (
                <div className="border-2 border-dashed border-gray-300 rounded p-4 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="debug-upload"
                    onChange={handleFileSelect}
                  />
                  <label
                    htmlFor="debug-upload"
                    className="cursor-pointer text-sm text-blue-600 hover:text-blue-800"
                  >
                    Select Test Image
                  </label>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{selectedFile.name}</span>
                    <button
                      onClick={clearTest}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-24 object-cover rounded"
                    />
                  )}

                  <button
                    onClick={testUpload}
                    disabled={isPending}
                    className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
                  >
                    {isPending ? "Testing..." : "Test Upload"}
                  </button>
                </div>
              )}
            </div>

            {/* Test Results */}
            {testResult && (
              <div className={`p-3 rounded text-sm ${
                testResult.success
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {testResult.success ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className={`font-medium ${
                    testResult.success ? "text-green-800" : "text-red-800"
                  }`}>
                    {testResult.success ? "Success" : "Failed"}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div>Duration: {testResult.duration}</div>
                  <div>Message: {testResult.message}</div>

                  {testResult.success && testResult.imageUrl && (
                    <div>
                      <div>Image URL:</div>
                      <div className="break-all text-blue-600">{testResult.imageUrl}</div>
                    </div>
                  )}

                  {!testResult.success && testResult.status && (
                    <div>Status: {testResult.status}</div>
                  )}
                </div>

                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-gray-600">
                    Raw Response
                  </summary>
                  <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                    {JSON.stringify(testResult.response || testResult.error, null, 2)}
                  </pre>
                </details>
              </div>
            )}

            {/* Quick Actions */}
            <div className="text-xs text-gray-500 space-y-1">
              <div>Current path: {window.location.pathname}</div>
              <div>Network: {navigator.onLine ? "Online" : "Offline"}</div>
              <div>Auth: {Cookies.get("token") ? "Token present" : "No token"}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FabricUploadDebug;
