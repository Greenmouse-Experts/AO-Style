import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import Cookies from "js-cookie";
import useGetAllUsersByRole from "../../../../hooks/admin/useGetAllUserByRole";
import useSendMessage from "../../../../hooks/messaging/useSendMessage";
import useToast from "../../../../hooks/useToast";

const roleMapping = {
  Customer: "user",
  Tailor: "fashion-designer",
  Fabric: "fabric-vendor",
  "Market Rep": "market-representative",
  Logistics: "logistics-agent",
};

export default function MessagingDebug() {
  const [userType, setUserType] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [messageText, setMessageText] = useState("");
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [debugLogs, setDebugLogs] = useState([]);

  const { toastError, toastSuccess } = useToast();
  const adminToken = Cookies.get("adminToken");

  // Get users by role hook
  const {
    data: usersData,
    isLoading: loadingUsers,
    error: usersError,
  } = useGetAllUsersByRole({
    role: userType ? roleMapping[userType] : null,
  });

  // Send message hook
  const { isPending: sendingMessage, sendMessageMutate } = useSendMessage();

  const users = usersData?.data || [];

  // Helper function to add debug logs
  const addDebugLog = (message, type = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs((prev) => [...prev, { timestamp, message, type }]);
  };

  // Initialize Socket.IO connection
  useEffect(() => {
    if (adminToken) {
      addDebugLog(
        `Initializing socket connection with token: ${adminToken?.substring(0, 20)}...`,
        "info",
      );

      const socketInstance = io("https://api-carybin.victornwadinobi.com", {
        auth: { token: adminToken },
        transports: ["websocket", "polling"],
        timeout: 20000,
      });

      socketInstance.on("connect", () => {
        addDebugLog(
          `Socket connected with ID: ${socketInstance.id}`,
          "success",
        );
        setIsConnected(true);
      });

      socketInstance.on("disconnect", () => {
        addDebugLog("Socket disconnected", "error");
        setIsConnected(false);
      });

      socketInstance.on("messageSent", (data) => {
        addDebugLog(
          `Message sent via socket: ${JSON.stringify(data)}`,
          "success",
        );
      });

      socketInstance.on("recentChatRetrieved", (data) => {
        addDebugLog(`Recent chat retrieved: ${JSON.stringify(data)}`, "info");
      });

      socketInstance.on("connect_error", (error) => {
        addDebugLog(`Socket connection error: ${error.message}`, "error");
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    } else {
      addDebugLog("No admin token found", "error");
    }
  }, [adminToken]);

  // Debug users data
  useEffect(() => {
    if (usersData) {
      addDebugLog(`Users data received: ${JSON.stringify(usersData)}`, "info");
      addDebugLog(`Users array length: ${users.length}`, "info");
    }
    if (usersError) {
      addDebugLog(
        `Error fetching users: ${JSON.stringify(usersError)}`,
        "error",
      );
    }
  }, [usersData, usersError, users]);

  // Handle user type selection
  const handleUserTypeChange = (e) => {
    const selectedType = e.target.value;
    addDebugLog(
      `Selected user type: ${selectedType}, mapped role: ${roleMapping[selectedType]}`,
      "info",
    );
    setUserType(selectedType);
    setSelectedUser("");
  };

  // Handle message sending
  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!selectedUser || !messageText.trim()) {
      addDebugLog("Missing selected user or message text", "error");
      return;
    }

    const messageData = {
      token: adminToken,
      chatBuddy: selectedUser,
      message: messageText.trim(),
    };

    addDebugLog(`Sending message: ${JSON.stringify(messageData)}`, "info");

    // Send via API
    sendMessageMutate(messageData, {
      onSuccess: (response) => {
        addDebugLog(
          `API message sent successfully: ${JSON.stringify(response?.data)}`,
          "success",
        );

        // Also emit via socket if connected
        if (socket && isConnected) {
          addDebugLog("Emitting message via socket...", "info");
          socket.emit("sendMessage", messageData);
        } else {
          addDebugLog("Socket not connected, skipping socket emit", "warning");
        }

        setMessageText("");
        toastSuccess("Message sent successfully!");
      },
      onError: (error) => {
        addDebugLog(
          `API message send failed: ${JSON.stringify(error)}`,
          "error",
        );
        toastError(
          "Failed to send message: " + (error?.data?.message || error?.message),
        );
      },
    });
  };

  // Clear debug logs
  const clearLogs = () => {
    setDebugLogs([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Messaging Debug Panel
      </h1>

      {/* Status indicators */}
      <div className="mb-6 flex gap-4">
        <div
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            adminToken
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          Token: {adminToken ? "Available" : "Missing"}
        </div>
        <div
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            isConnected
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          Socket: {isConnected ? "Connected" : "Disconnected"}
        </div>
      </div>

      {/* Messaging form */}
      <form onSubmit={handleSendMessage} className="mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            User Type
          </label>
          <select
            value={userType}
            onChange={handleUserTypeChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Choose user type</option>
            <option value="Customer">Customer</option>
            <option value="Tailor">Tailor</option>
            <option value="Fabric">Fabric</option>
            <option value="Market Rep">Market Rep</option>
            <option value="Logistics">Logistics</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select User
          </label>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            disabled={!userType || loadingUsers}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">
              {loadingUsers ? "Loading users..." : "Choose a user"}
            </option>
            {users.length > 0
              ? users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name || user.email || `User ${user.id}`}
                  </option>
                ))
              : !loadingUsers &&
                userType && (
                  <option value="" disabled>
                    No users found for this role
                  </option>
                )}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message
          </label>
          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type message..."
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={sendingMessage || !selectedUser || !messageText.trim()}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {sendingMessage ? "Sending..." : "Send Message"}
        </button>
      </form>

      {/* Debug logs */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Debug Logs</h2>
          <button
            onClick={clearLogs}
            className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
          >
            Clear Logs
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto space-y-2">
          {debugLogs.length === 0 ? (
            <p className="text-gray-500 text-sm">No logs yet...</p>
          ) : (
            debugLogs.map((log, index) => (
              <div
                key={index}
                className={`p-2 rounded-md text-sm ${
                  log.type === "success"
                    ? "bg-green-100 text-green-800"
                    : log.type === "error"
                      ? "bg-red-100 text-red-800"
                      : log.type === "warning"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-blue-100 text-blue-800"
                }`}
              >
                <span className="font-mono text-xs text-gray-600">
                  {log.timestamp}
                </span>
                <br />
                {log.message}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
