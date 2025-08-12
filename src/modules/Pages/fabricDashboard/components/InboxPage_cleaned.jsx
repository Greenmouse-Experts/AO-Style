import { useEffect, useRef, useState } from "react";
import {
  FaSearch,
  FaPaperPlane,
  FaPlus,
  FaFile,
  FaImage,
  FaMapMarkerAlt,
  FaBars,
  FaSmile,
  FaTimes,
  FaCircle,
} from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";
import Cookies from "js-cookie";
import useToast from "../../../../hooks/useToast";
import { useId } from "react";
import { useCarybinUserStore } from "../../../../store/carybinUserStore";
import useGetUserProfile from "../../../Auth/hooks/useGetProfile";

export default function InboxPage() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageList, setMessageList] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const dropdownRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const { carybinUser, logOut } = useCarybinUserStore();

  // Socket and messaging states
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [chats, setChats] = useState([]);

  // User profile state
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const { toastError, toastSuccess } = useToast();
  const userToken = Cookies.get("token");
  // Use profile ID instead of hardcoded ID
  const userId = userProfile?.id || null;
  const selectedChatRef = useRef(selectedChat);

  // Get user profile hook
  const {
    data: profileData,
    isPending: profilePending,
    isSuccess: profileSuccess,
    isError: profileError,
    error: profileErrorData,
  } = useGetUserProfile();

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messageList]);

  // Update the ref whenever selectedChat changes
  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  // Handle profile loading and setting user profile state
  useEffect(() => {
    if (profileSuccess && profileData) {
      console.log("=== FABRIC USER PROFILE LOADED ===");
      console.log("Profile data:", profileData);
      console.log("User ID from profile:", profileData.id);
      console.log("====================================");
      setUserProfile(profileData);
      setProfileLoading(false);
    } else if (profileError) {
      console.error("=== FABRIC PROFILE LOADING ERROR ===");
      console.error("Error:", profileErrorData);
      console.error("====================================");
      toastError("Failed to load user profile: " + profileErrorData?.message);
      setProfileLoading(false);
    } else if (profilePending) {
      console.log("=== FABRIC PROFILE LOADING ===");
      console.log("Profile is loading...");
      console.log("===============================");
      setProfileLoading(true);
    }
  }, [
    profileSuccess,
    profileData,
    profileError,
    profileErrorData,
    profilePending,
  ]);

  // Initialize Socket.IO connection - Wait for profile to be loaded
  useEffect(() => {
    console.log("=== INITIALIZING FABRIC SOCKET CONNECTION ===");
    console.log("User token:", userToken);
    console.log("User ID from profile:", userId);
    console.log("Profile loading:", profileLoading);
    console.log("Socket URL: https://api-carybin.victornwadinobi.com");
    console.log("===============================================");

    // Wait for profile to be loaded before initializing socket
    if (userToken && userId && !profileLoading) {
      const socketInstance = io("https://api-carybin.victornwadinobi.com", {
        auth: { token: userToken },
        transports: ["websocket", "polling"],
        timeout: 20000,
        forceNew: true,
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        upgrade: true,
        rememberUpgrade: false,
      });

      socketInstance.on("connect", () => {
        console.log("=== FABRIC SOCKET CONNECTED ===");
        console.log("Socket ID:", socketInstance.id);
        console.log("Socket connected:", socketInstance.connected);
        console.log("User ID being used:", userId);
        console.log("==================================");
        setIsConnected(true);
      });

      socketInstance.on("disconnect", (reason) => {
        console.log("=== FABRIC SOCKET DISCONNECTED ===");
        console.log("Disconnect reason:", reason);
        console.log("User ID:", userId);
        console.log("===================================");
        setIsConnected(false);
      });

      socketInstance.on("messageSent", (data) => {
        console.log("🎉 === FABRIC MESSAGE SENT EVENT RECEIVED === 🎉");
        console.log("Raw data:", data);
        console.log("Formatted data:", JSON.stringify(data, null, 2));
        console.log("Status:", data?.status);
        console.log("Message:", data?.message);
        console.log("Data object:", data?.data);
        console.log("🎉 ========================================== 🎉");
        toastSuccess(data?.message || "Message delivered successfully");
      });

      socketInstance.on("chatsRetrieved", (data) => {
        console.log("=== FABRIC CHATS RETRIEVED ON LOAD ===");
        console.log("Full response:", JSON.stringify(data, null, 2));
        console.log("Status:", data?.status);
        console.log("Message:", data?.message);
        console.log("Result array:", data?.data?.result);
        console.log("======================================");

        if (data?.status === "success" && data?.data?.result) {
          setChats(data.data.result);
          if (!selectedChat && data.data.result.length > 0) {
            setSelectedChat(data.data.result[0]);
          }
          toastSuccess(data?.message || "Chats loaded successfully");
        }
      });

      // Listen for user-specific chat events
      if (userId) {
        console.log(
          `🎯 Setting up fabric user-specific event listeners for user: ${userId}`,
        );
        console.log(`🎯 Listening for: chatsRetrieved.${userId}`);
        console.log(`🎯 Listening for: messagesRetrieved.${userId}`);
        console.log(`🎯 Listening for: recentChatRetrieved.${userId}`);

        socketInstance.on(`chatsRetrieved:${userId}`, (data) => {
          console.log(
            `=== FABRIC USER-SPECIFIC CHATS RETRIEVED (${userId}) ===`,
          );
          console.log("Full response:", JSON.stringify(data, null, 2));
          console.log("Status:", data?.status);
          console.log("Message:", data?.message);
          console.log("Result array:", data?.data?.result);
          console.log(
            "=========================================================",
          );

          if (data?.status === "success" && data?.data?.result) {
            setChats(data.data.result);
            if (!selectedChat && data.data.result.length > 0) {
              setSelectedChat(data.data.result[0]);
            }
            toastSuccess(data?.message || "Chats loaded successfully");
          }
        });

        socketInstance.on(`messagesRetrieved:${userId}`, (data) => {
          console.log(
            `=== FABRIC USER-SPECIFIC MESSAGES RETRIEVED (${userId}) ===`,
          );
          console.log("Full response:", JSON.stringify(data, null, 2));
          console.log("Status:", data?.status);
          console.log("Messages array:", data?.data?.result);
          console.log("Selected chat from ref:", selectedChatRef.current);
          console.log(
            "==========================================================",
          );

          if (data?.status === "success" && data?.data?.result) {
            const currentSelectedChat = selectedChatRef.current;
            console.log("Current selected chat:", currentSelectedChat);

            const formattedMessages = data.data.result.map((msg) => ({
              id: msg.id,
              sender: msg.initiator?.name || "Unknown",
              text: msg.message,
              time: new Date(msg.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              }),
              type:
                msg.initiator_id === currentSelectedChat?.chat_buddy?.id
                  ? "received"
                  : "sent",
              read: msg.read,
            }));

            console.log("Formatted messages with types:", formattedMessages);
            setMessageList(formattedMessages);
          }
        });

        socketInstance.on(`recentChatRetrieved:${userId}`, (data) => {
          console.log(
            `=== FABRIC USER-SPECIFIC RECENT CHAT RETRIEVED (${userId}) ===`,
          );
          console.log("Chat data:", JSON.stringify(data, null, 2));
          console.log(
            "=========================================================",
          );

          if (data?.data) {
            setChats((prevChats) => {
              const existingChatIndex = prevChats.findIndex(
                (chat) => chat.id === data.data.id,
              );
              if (existingChatIndex >= 0) {
                const updatedChats = [...prevChats];
                updatedChats[existingChatIndex] = {
                  ...updatedChats[existingChatIndex],
                  last_message: data.data.last_message,
                  created_at: data.data.created_at,
                };
                return updatedChats;
              } else {
                return [data.data, ...prevChats];
              }
            });
          }
        });
      }

      socketInstance.on("messagesRetrieved", (data) => {
        console.log("=== FABRIC MESSAGES RETRIEVED ===");
        console.log("Full response:", JSON.stringify(data, null, 2));
        console.log("Status:", data?.status);
        console.log("Messages array:", data?.data?.result);
        console.log("Selected chat from ref:", selectedChatRef.current);
        console.log("=================================");

        if (data?.status === "success" && data?.data?.result) {
          const currentSelectedChat = selectedChatRef.current;
          console.log("Current selected chat:", currentSelectedChat);

          const formattedMessages = data.data.result.map((msg) => ({
            id: msg.id,
            sender: msg.initiator?.name || "Unknown",
            text: msg.message,
            time: new Date(msg.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
            type:
              msg.initiator_id === currentSelectedChat?.chat_buddy?.id
                ? "received"
                : "sent",
            read: msg.read,
          }));

          console.log("Formatted messages with types:", formattedMessages);
          setMessageList(formattedMessages);
        }
      });

      socketInstance.on("recentChatRetrieved", (data) => {
        console.log("=== FABRIC RECENT CHAT RETRIEVED ===");
        console.log("Chat data:", JSON.stringify(data, null, 2));
        console.log("====================================");

        if (data?.data) {
          setChats((prevChats) => {
            const existingChatIndex = prevChats.findIndex(
              (chat) => chat.id === data.data.id,
            );
            if (existingChatIndex >= 0) {
              const updatedChats = [...prevChats];
              updatedChats[existingChatIndex] = {
                ...updatedChats[existingChatIndex],
                last_message: data.data.last_message,
                created_at: data.data.created_at,
              };
              return updatedChats;
            } else {
              return [data.data, ...prevChats];
            }
          });
        }
      });

      socketInstance.on("connect_error", (error) => {
        console.error("=== FABRIC SOCKET CONNECTION ERROR ===");
        console.error("Error:", error);
        console.error("Error message:", error.message);
        console.error("======================================");
      });

      setSocket(socketInstance);

      return () => {
        console.log("=== CLEANING UP FABRIC SOCKET ===");
        console.log("User ID:", userId);
        socketInstance.disconnect();
        console.log("=================================");
      };
    } else {
      console.log("=== WAITING FOR FABRIC USER PROFILE OR TOKEN ===");
      console.log("User token exists:", !!userToken);
      console.log("User ID exists:", !!userId);
      console.log("Profile loading:", profileLoading);
      console.log("================================================");

      if (!userToken) {
        toastError("User token not found. Please login again.");
      }
    }
  }, [userToken, userId, profileLoading]);

  // Load chats when socket connects
  useEffect(() => {
    if (socket && isConnected && userId) {
      console.log("🔄 Emitting getChats for fabric user:", userId);
      socket.emit("getChats", { userId });
    }
  }, [socket, isConnected, userId]);

  // Load messages when chat is selected
  useEffect(() => {
    if (socket && selectedChat && userId) {
      console.log("🔄 Emitting getMessages for fabric chat:", selectedChat.id);
      console.log("🔄 User ID:", userId);
      socket.emit("getMessages", {
        chatId: selectedChat.id,
        userId: userId,
      });
    }
  }, [socket, selectedChat, userId]);

  const sendMessage = () => {
    if (!newMessage.trim() || !socket || !selectedChat || !userId) {
      if (!userId) {
        toastError("User profile not loaded. Please wait...");
      } else if (!selectedChat) {
        toastError("Please select a chat first");
      } else if (!newMessage.trim()) {
        toastError("Please enter a message");
      } else {
        console.error("Socket not connected");
      }
      return;
    }

    console.log("📤 === SENDING FABRIC MESSAGE ===");
    console.log("Message:", newMessage);
    console.log("Chat ID:", selectedChat.id);
    console.log("User ID:", userId);
    console.log("Socket connected:", socket.connected);
    console.log("================================");

    const messageData = {
      chatId: selectedChat.id,
      message: newMessage,
      userId: userId,
    };

    try {
      socket.emit("sendMessage", messageData);
      console.log("✅ Message emitted successfully");
      setNewMessage("");
    } catch (error) {
      console.error("❌ Error sending message:", error);
      toastError("Failed to send message: " + error.message);
    }
  };

  const handleChatClick = (chat) => {
    console.log("🔄 Fabric chat selected:", chat);
    setSelectedChat(chat);
    setShowSidebar(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const onEmojiClick = (emojiObject) => {
    setNewMessage((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  // Click outside handler for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowOptions(false);
      }
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Show loading state if profile is still loading
  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading fabric user profile...</p>
        </div>
      </div>
    );
  }

  // Show error state if profile failed to load
  if (profileError) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Profile Load Error
          </h2>
          <p className="text-gray-600 mb-4">
            Failed to load fabric user profile
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <div
        className={`${
          showSidebar ? "block" : "hidden"
        } md:block w-full md:w-80 bg-white border-r border-gray-200 flex flex-col`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-800">Messages</h1>
            <div className="flex items-center space-x-2">
              {/* Connection Status Indicator */}
              <div className="flex items-center space-x-1">
                <FaCircle
                  className={`text-xs ${isConnected ? "text-green-500" : "text-red-500"}`}
                />
                <span
                  className={`text-xs ${isConnected ? "text-green-600" : "text-red-600"}`}
                >
                  {isConnected ? "Connected" : "Disconnected"}
                </span>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <FaPlus className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {isConnected ? "No conversations yet" : "Connecting..."}
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleChatClick(chat)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedChat?.id === chat.id ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-medium">
                      {chat.chat_buddy?.name?.charAt(0).toUpperCase() || "?"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {chat.chat_buddy?.name || "Unknown User"}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {chat.last_message?.created_at
                          ? new Date(
                              chat.last_message.created_at,
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {chat.last_message?.message || "No messages yet"}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowSidebar(!showSidebar)}
                    className="md:hidden p-2 hover:bg-gray-100 rounded-full"
                  >
                    <FaBars className="w-5 h-5 text-gray-600" />
                  </button>
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-medium">
                      {selectedChat.chat_buddy?.name?.charAt(0).toUpperCase() ||
                        "?"}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {selectedChat.chat_buddy?.name || "Unknown User"}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {isConnected ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {messageList.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  No messages in this conversation
                </div>
              ) : (
                messageList.map((message, index) => (
                  <div
                    key={message.id || index}
                    className={`mb-4 ${
                      message.type === "sent" ? "text-right" : "text-left"
                    }`}
                  >
                    <div
                      className={`inline-block max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.type === "sent"
                          ? "bg-blue-500 text-white"
                          : "bg-white text-gray-900"
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.type === "sent"
                            ? "text-blue-100"
                            : "text-gray-500"
                        }`}
                      >
                        {message.time}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowOptions(!showOptions)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <FaPlus className="w-5 h-5 text-gray-600" />
                  </button>
                  {showOptions && (
                    <div className="absolute bottom-12 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 space-y-1">
                      <button className="flex items-center space-x-2 w-full p-2 hover:bg-gray-100 rounded">
                        <FaFile className="w-4 h-4 text-gray-600" />
                        <span className="text-sm">File</span>
                      </button>
                      <button className="flex items-center space-x-2 w-full p-2 hover:bg-gray-100 rounded">
                        <FaImage className="w-4 h-4 text-gray-600" />
                        <span className="text-sm">Image</span>
                      </button>
                      <button className="flex items-center space-x-2 w-full p-2 hover:bg-gray-100 rounded">
                        <FaMapMarkerAlt className="w-4 h-4 text-gray-600" />
                        <span className="text-sm">Location</span>
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!isConnected || !userId}
                  />
                </div>
                <div className="relative" ref={emojiPickerRef}>
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <FaSmile className="w-5 h-5 text-gray-600" />
                  </button>
                  {showEmojiPicker && (
                    <div className="absolute bottom-12 right-0 z-10">
                      <EmojiPicker onEmojiClick={onEmojiClick} />
                    </div>
                  )}
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || !isConnected || !userId}
                  className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <FaPaperPlane className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaBars className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-500">
                Choose a conversation from the sidebar to start messaging
              </p>
              <button
                onClick={() => setShowSidebar(true)}
                className="md:hidden mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Show Conversations
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
