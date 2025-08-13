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
import useGetAdmins from "../../../../hooks/messaging/useGetAdmins";
import useSendMessage from "../../../../hooks/messaging/useSendMessage";

export default function InboxPage() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageList, setMessageList] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState("");
  const [messageText, setMessageText] = useState("");
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

  // Get admins and send message hooks
  const {
    data: admins,
    isPending: adminsLoading,
    isError: adminsError,
  } = useGetAdmins();

  // Send message hook
  const { isPending: sendingMessage, sendMessageMutate } = useSendMessage();

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

  // Handle sending message to admin via socket
  const handleSendMessageToAdmin = () => {
    if (!selectedAdmin || !messageText.trim()) {
      toastError("Please select an admin and enter a message");
      return;
    }

    if (!socket || !isConnected) {
      toastError("Not connected to messaging service. Please try again.");
      return;
    }

    const messageData = {
      token: userToken,
      chatBuddy: selectedAdmin,
      message: messageText.trim(),
    };

    console.log("=== SENDING MESSAGE TO ADMIN VIA SOCKET ===");
    console.log("Socket ID:", socket.id);
    console.log("Message data:", messageData);
    console.log("Socket connected:", socket.connected);
    console.log("User ID:", userId);
    console.log("Admin ID:", selectedAdmin);
    console.log("=========================================");

    socket.emit("sendMessage", messageData);

    // Update existing chat or create new one in local state
    const adminUser = admins?.find((admin) => admin.id === selectedAdmin);
    if (adminUser) {
      console.log("=== UPDATING CHAT LIST AFTER MESSAGE ===");
      console.log("Admin ID:", selectedAdmin);
      console.log("Current chats count:", chats.length);

      setChats((prevChats) => {
        // Check if chat with this admin already exists
        const existingChatIndex = prevChats.findIndex(
          (chat) => chat.chat_buddy?.id === selectedAdmin,
        );

        console.log("Existing chat index:", existingChatIndex);

        if (existingChatIndex !== -1) {
          // Update existing chat
          console.log("📝 Updating existing chat with admin");
          const updatedChats = [...prevChats];
          updatedChats[existingChatIndex] = {
            ...updatedChats[existingChatIndex],
            last_message: messageText.trim(),
            created_at: new Date().toISOString(),
            unread: 0,
          };
          // Move updated chat to top
          const updatedChat = updatedChats.splice(existingChatIndex, 1)[0];
          console.log("✅ Chat updated and moved to top");
          return [updatedChat, ...updatedChats];
        } else {
          // Create new chat entry
          console.log("➕ Creating new chat with admin");
          const newChat = {
            id: Date.now(),
            last_message: messageText.trim(),
            chat_buddy: adminUser,
            created_at: new Date().toISOString(),
            unread: 0,
          };
          console.log("✅ New chat created");
          return [newChat, ...prevChats];
        }
      });

      console.log("========================================");
    }

    toastSuccess("Message sent successfully!");
    setShowNewMessageModal(false);
    setSelectedAdmin("");
    setMessageText("");

    // Refresh chats with a delay to prevent duplicates
    setTimeout(() => {
      if (socket && userId) {
        console.log("🔄 Refreshing chats after delay to sync with server");
        socket.emit("getChats", { userId });
      }
    }, 1000);
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
    console.log("Socket URL: https://api-staging.carybin.com/");
    console.log("===============================================");

    // Wait for profile to be loaded before initializing socket
    if (userToken && userId && !profileLoading) {
      const socketInstance = io("https://api-staging.carybin.com/", {
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

      // Listen for user-specific message sent events
      socketInstance.on(`messageSent:${userId}`, (data) => {
        console.log("🎉 === FABRIC MESSAGE SENT EVENT RECEIVED === 🎉");
        console.log("User ID:", userId);
        console.log("Raw data:", data);
        console.log("Formatted data:", JSON.stringify(data, null, 2));
        console.log("Status:", data?.status);
        console.log("Message:", data?.message);
        console.log("Data object:", data?.data);
        console.log("🎉 ============================================ 🎉");
        toastSuccess(data?.message || "Message delivered successfully");
      });

      // Listen for user-specific message sent events
      socketInstance.on(`messageSent:${userId}`, (data) => {
        console.log("🎉 === FABRIC MESSAGE SENT EVENT RECEIVED === 🎉");
        console.log("User ID:", userId);
        console.log("Raw data:", data);
        console.log("Formatted data:", JSON.stringify(data, null, 2));
        console.log("Status:", data?.status);
        console.log("Message:", data?.message);
        console.log("Data object:", data?.data);
        console.log("🎉 ========================================= 🎉");
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
          console.log(data.data.result);
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
              timestamp: msg.created_at,
              type:
                msg.initiator_id === currentSelectedChat?.chat_buddy?.id
                  ? "received"
                  : "sent",
              read: msg.read,
            }));

            console.log("Formatted messages with types:", formattedMessages);
            // Sort messages by created_at (oldest first for chat display)
            const sortedMessages = formattedMessages.sort(
              (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
            );
            setMessageList(sortedMessages);
          }
        });

        // Also listen for chat-specific messages events
        // This will be set up when a chat is selected
        const setupChatSpecificListener = (chatId) => {
          const eventName = `messagesRetrieved:${chatId}:${userId}`;
          console.log(`🎯 Setting up chat-specific listener: ${eventName}`);

          socketInstance.on(eventName, (data) => {
            console.log(
              `=== FABRIC CHAT-SPECIFIC MESSAGES RETRIEVED (${chatId}:${userId}) ===`,
            );
            console.log("Full response:", JSON.stringify(data, null, 2));
            console.log("Status:", data?.status);
            console.log("Messages array:", data?.data?.result);
            console.log("Selected chat from ref:", selectedChatRef.current);
            console.log(
              "=================================================================",
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
                timestamp: msg.created_at,
                type:
                  msg.initiator_id === currentSelectedChat?.chat_buddy?.id
                    ? "received"
                    : "sent",
                read: msg.read,
              }));

              console.log("Formatted messages with types:", formattedMessages);
              // Sort messages by created_at (oldest first for chat display)
              const sortedMessages = formattedMessages.sort(
                (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
              );
              setMessageList(sortedMessages);
            }
          });
        };

        // Store the function for later use
        socketInstance.setupChatSpecificListener = setupChatSpecificListener;

        socketInstance.on(`recentChatRetrieved:${userId}`, (data) => {
          console.log(
            `=== FABRIC USER-SPECIFIC RECENT CHAT RETRIEVED (${userId}) ===`,
          );
          console.log("Chat data:", JSON.stringify(data, null, 2));
          console.log(
            "=========================================================",
          );

          if (data?.data) {
            const currentSelectedChat = selectedChatRef.current;

            setChats((prevChats) => {
              const existingChatIndex = prevChats.findIndex(
                (chat) => chat.id === data.data.id,
              );
              if (existingChatIndex >= 0) {
                const updatedChats = [...prevChats];
                const updatedChat = {
                  ...updatedChats[existingChatIndex],
                  last_message: data.data.last_message,
                  created_at: data.data.created_at,
                  updated_at: data.data.updated_at || data.data.created_at,
                };
                // Remove from current position and add to top
                updatedChats.splice(existingChatIndex, 1);
                return [updatedChat, ...updatedChats];
              } else {
                return [data.data, ...prevChats];
              }
            });

            // Auto-refresh messages if this chat is currently selected
            if (
              currentSelectedChat &&
              currentSelectedChat.id === data.data.id
            ) {
              console.log(
                "🔄 Auto-refreshing messages for currently selected fabric chat (user-specific)",
              );
              socketInstance.emit("retrieveMessages", {
                token: userToken,
                chatBuddy: currentSelectedChat.chat_buddy.id,
              });
            }
          }
        });
      }

      socketInstance.on("messagesRetrieved", (data) => {
        console.log("=== FABRIC GENERAL MESSAGES RETRIEVED ===");
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
            timestamp: msg.created_at,
            type:
              msg.initiator_id === currentSelectedChat?.chat_buddy?.id
                ? "received"
                : "sent",
            read: msg.read,
          }));

          console.log("Formatted messages with types:", formattedMessages);
          // Sort messages by created_at (oldest first for chat display)
          const sortedMessages = formattedMessages.sort(
            (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
          );
          setMessageList(sortedMessages);
        }
      });

      socketInstance.on("recentChatRetrieved", (data) => {
        console.log("=== FABRIC RECENT CHAT RETRIEVED ===");
        console.log("Chat data:", JSON.stringify(data, null, 2));
        console.log("====================================");

        if (data?.data) {
          const currentSelectedChat = selectedChatRef.current;

          setChats((prevChats) => {
            const existingChatIndex = prevChats.findIndex(
              (chat) => chat.id === data.data.id,
            );
            if (existingChatIndex >= 0) {
              const updatedChats = [...prevChats];
              const updatedChat = {
                ...updatedChats[existingChatIndex],
                last_message: data.data.last_message,
                created_at: data.data.created_at,
                updated_at: data.data.updated_at || data.data.created_at,
              };
              // Remove from current position and add to top
              updatedChats.splice(existingChatIndex, 1);
              return [updatedChat, ...updatedChats];
            } else {
              return [data.data, ...prevChats];
            }
          });

          // Auto-refresh messages if this chat is currently selected
          if (currentSelectedChat && currentSelectedChat.id === data.data.id) {
            console.log(
              "🔄 Auto-refreshing messages for currently selected fabric chat",
            );
            socketInstance.emit("retrieveMessages", {
              token: userToken,
              chatBuddy: currentSelectedChat.chat_buddy.id,
            });
          }
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
    if (socket && isConnected && userToken && userId) {
      console.log("=== FETCHING CHATS VIA SOCKET ===");
      console.log("Emitting retrieveChats with token:", userToken);
      console.log("User ID:", userId);
      socket.emit("retrieveChats", { token: userToken });
      console.log("================================");
    }
  }, [socket, isConnected, userToken, userId]);

  // Load messages when chat is selected
  useEffect(() => {
    if (socket && isConnected && selectedChat && userToken && userId) {
      console.log("=== FETCHING MESSAGES VIA SOCKET ===");
      console.log("Selected chat:", selectedChat);
      console.log("Chat ID:", selectedChat.id);
      console.log("User ID:", userId);
      console.log("Chat buddy ID:", selectedChat.chat_buddy?.id);
      console.log("Emitting retrieveMessages");

      // Set up chat-specific listener for this chat
      if (socket.setupChatSpecificListener) {
        socket.setupChatSpecificListener(selectedChat.id);
      }

      socket.emit("retrieveMessages", {
        token: userToken,
        chatBuddy: selectedChat.chat_buddy.id,
      });
      console.log("====================================");
    }
  }, [socket, isConnected, selectedChat, userToken, userId]);

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;

    console.log("=== FABRIC SENDING MESSAGE VIA SOCKET ===");
    console.log("Socket ID:", socket?.id);
    console.log("Selected chat:", selectedChat.id);
    console.log("Message:", newMessage);
    console.log("Socket connected:", socket?.connected);
    console.log("User ID from profile:", userId);
    console.log("=======================================");

    if (!userId) {
      toastError("User profile not loaded. Please wait and try again.");
      return;
    }

    if (socket && isConnected) {
      const messageData = {
        token: userToken,
        chatBuddy: selectedChat.chat_buddy?.id || selectedChat.id,
        message: newMessage.trim(),
      };

      console.log("Message data to send:", messageData);
      socket.emit("sendMessage", messageData);

      // Add message to local state immediately
      const newMsg = {
        id: Date.now(),
        sender: "You",
        text: newMessage.trim(),
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        timestamp: new Date().toISOString(),
        type: "sent",
        read: true,
      };
      setMessageList((prev) => [...prev, newMsg]);

      // Update chat list to move this chat to top with latest message
      setChats((prevChats) => {
        const currentChatIndex = prevChats.findIndex(
          (chat) => chat.id === selectedChat.id,
        );
        if (currentChatIndex >= 0) {
          const updatedChats = [...prevChats];
          const updatedChat = {
            ...updatedChats[currentChatIndex],
            last_message: newMessage.trim(),
            updated_at: new Date().toISOString(),
          };
          // Remove from current position and add to top
          updatedChats.splice(currentChatIndex, 1);
          return [updatedChat, ...updatedChats];
        }
        return prevChats;
      });
      setNewMessage("");
      toastSuccess("Message sent successfully!");
    } else {
      console.error("=== SOCKET NOT CONNECTED ===");
      console.error("Socket exists:", !!socket);
      console.error("Is connected:", isConnected);
      console.error("Socket state:", socket?.connected);
      console.error("============================");
      console.error("Socket not connected. Please check your connection.");
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
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
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
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
              <button
                onClick={() => setShowNewMessageModal(true)}
                className="p-2 hover:bg-gray-100 rounded-full"
                title="New Message"
              >
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  selectedChat?.id === chat.id ? "bg-purple-50" : ""
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
                        {chat.updated_at || chat.created_at
                          ? new Date(
                              chat.updated_at || chat.created_at,
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })
                          : ""}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500 truncate flex-1">
                        {chat.last_message || "No messages yet"}
                      </p>
                      {chat.unread_count > 0 && (
                        <span className="inline-flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs rounded-full ml-2">
                          {chat.unread_count}
                        </span>
                      )}
                    </div>
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
                          ? "bg-purple-500 text-white"
                          : "bg-white text-gray-900"
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <div
                        className={`flex items-center justify-between mt-1 ${
                          message.type === "sent"
                            ? "text-purple-100"
                            : "text-gray-500"
                        }`}
                      >
                        <p className="text-xs">{message.time}</p>
                        {message.type === "sent" && (
                          <p className="text-xs ml-2">
                            {message.read ? "✓✓" : "✓"}
                          </p>
                        )}
                      </div>
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  className="p-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
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
                className="md:hidden mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
              >
                Show Conversations
              </button>
            </div>
          </div>
        </div>

        {/* New Message Modal */}
        {showNewMessageModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    New Message to Admin
                  </h3>
                  <button
                    onClick={() => {
                      setShowNewMessageModal(false);
                      setSelectedAdmin("");
                      setMessageText("");
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FaTimes size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Admin Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Admin
                  </label>
                  {adminsLoading ? (
                    <div className="text-sm text-gray-500">Loading admins...</div>
                  ) : adminsError ? (
                    <div className="text-sm text-red-500">
                      Failed to load admins
                    </div>
                  ) : (
                    <select
                      value={selectedAdmin}
                      onChange={(e) => setSelectedAdmin(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Choose an admin...</option>
                      {admins?.map((admin) => (
                        <option key={admin.id} value={admin.id}>
                          {admin.name} - {admin.email}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Message Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your message here..."
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowNewMessageModal(false);
                    setSelectedAdmin("");
                    setMessageText("");
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  disabled={sendingMessage}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendMessageToAdmin}
                  disabled={
                    !selectedAdmin ||
                    !messageText.trim() ||
                    !isConnected ||
                    sendingMessage
                  }
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingMessage
                    ? "Sending..."
                    : !isConnected
                      ? "Connecting..."
                      : "Send Message"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
