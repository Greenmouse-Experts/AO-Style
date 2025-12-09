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
import { ChatBubbleBottomCenterTextIcon, ChatBubbleBottomCenterIcon } from "@heroicons/react/24/outline";
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
import { motion } from "framer-motion";
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

  //for role admin chats
  const [showToAdminMessages, setShowToAdminMessages] = useState(false);
  const [roleConversations, setRoleConversations] = useState([]);

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

    if (!socket || !isConnected) {
      toastError("Not connected to messaging service. Please try again.");
      return;
    }

    const messageData = {
      token: userToken,
      initiator_id: profileData?.id,
      target_role: "fabric-vendor",
      message: messageText.trim(),
    };

    socket.emit("sendMessageToAdmin", messageData);

    toastSuccess("Message sent successfully!");
    setShowNewMessageModal(false);
    setMessageText("");
    socket.emit("retrieveMessagesToAdmin", {
      token: userToken,
      target_role: "fabric-vendor",
    });

    // Refresh chats with a delay to prevent duplicates
    setTimeout(() => {
      if (socket && userId) {
        console.log("🔄 Refreshing chats after delay to sync with server");
        socket.emit("getChats", { userId });
      }
    }, 1000);
  };

  useEffect(() => {
    if (socket && isConnected) {
      console.log("=== FETCHING admin MESSAGES VIA SOCKET ===");

      socket.emit("retrieveMessagesToAdmin", {
        token: userToken,
        target_role: "fabric-vendor",
      });

      console.log("====================================");
    }
  }, [socket, isConnected, roleConversations]);

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
      setUserProfile(profileData);
      setProfileLoading(false);
    } else if (profileError) {
      toastError("Failed to load user profile: " + profileErrorData?.message);
      setProfileLoading(false);
    } else if (profilePending) {
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
        console.log("=== FABRIC VENDOR SOCKET CONNECTED ===");
        console.log("Socket ID:", socketInstance.id);
        console.log("Socket connected:", socketInstance.connected);
        console.log("User ID being used:", userId);
        console.log("==================================");
        setIsConnected(true);
      });

      socketInstance.on("disconnect", (reason) => {
        console.log("=== FABRIC VENDOR SOCKET DISCONNECTED ===");
        console.log("Disconnect reason:", reason);
        console.log("User ID:", userId);
        console.log("=====================================");
        setIsConnected(false);
      });
      
      socketInstance.on(`messagesRetrievedToAdmin:${userId}`, (data) => {
        console.log(
          `=== ADMIN ROLE-SPECIFIC MESSAGES RETRIEVED (${userId}) ===`
        );
        console.log("Full response:", data);
        setRoleConversations(data?.data?.result);
      });

      // Listen for user-specific message sent events
      socketInstance.on(`messageToAdminSent:${userId}`, (data) => {
        console.log("🎉 === FABRIC VENDOR MESSAGE SENT EVENT RECEIVED === 🎉");
        toastSuccess(data?.message || "Message delivered successfully");
      });

      // Listen for user-specific message sent events
      socketInstance.on(`messageToAdminSent:${userId}`, (data) => {
        toastSuccess(data?.message || "Message delivered successfully");
      });

      socketInstance.on("chatsRetrieved", (data) => {
        if (data?.status === "success" && data?.data?.result) {
          setChats(data.data.result);
          if (!selectedChat && data.data.result.length > 0) {
            setSelectedChat(data.data.result[0]);
          }
          toastSuccess(data?.message || "Chats loaded successfully");
        }
      });

      // Listen for user-specific chat events (as shown in Postman)
      if (userId) {
        socketInstance.on(`chatsRetrieved:${userId}`, (data) => {
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
            `=== FABRIC VENDOR USER-SPECIFIC MESSAGES RETRIEVED (${userId}) ===`,
          );
          console.log("Full response:", JSON.stringify(data, null, 2));
          console.log("Status:", data?.status);
          console.log("Messages array:", data?.data?.result);
          console.log("Selected chat from ref:", selectedChatRef.current);
          console.log("==============================================");

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

        // Also listen for chat-specific messages events
        // This will be set up when a chat is selected
        const setupChatSpecificListener = (chatId) => {
          const eventName = `messagesRetrieved:${chatId}:${userId}`;
          console.log(`🎯 Setting up chat-specific listener: ${eventName}`);

          socketInstance.on(eventName, (data) => {
            console.log(
              `=== FABRIC VENDOR CHAT-SPECIFIC MESSAGES RETRIEVED (${chatId}:${userId}) ===`,
            );
            console.log("Full response:", JSON.stringify(data, null, 2));
            console.log("Status:", data?.status);
            console.log("Messages array:", data?.data?.result);
            console.log("Selected chat from ref:", selectedChatRef.current);
            console.log(
              "========================================================",
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
        };

        // Store the function for later use
        socketInstance.setupChatSpecificListener = setupChatSpecificListener;

        socketInstance.on(`recentChatRetrieved:${userId}`, (data) => {
          console.log(
            `=== TAILOR USER-SPECIFIC RECENT CHAT RETRIEVED (${userId}) ===`,
          );
          console.log("Chat data:", JSON.stringify(data, null, 2));
          console.log(
            "=============================================================",
          );

          if (data?.data) {
            const currentSelectedChat = selectedChatRef.current;

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

            // Auto-refresh messages if this chat is currently selected
            if (
              currentSelectedChat &&
              currentSelectedChat.id === data.data.id
            ) {
              console.log(
                "🔄 Auto-refreshing messages for currently selected fabric vendor chat",
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
        console.log("=== FABRIC VENDOR GENERAL MESSAGES RETRIEVED ===");
        console.log("Full response:", JSON.stringify(data, null, 2));
        console.log("Status:", data?.status);
        console.log("Messages array:", data?.data?.result);
        console.log("Selected chat from ref:", selectedChatRef.current);
        console.log("==========================");

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
        console.log("=== TAILOR GENERAL RECENT CHAT RETRIEVED ===");
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

          // Auto-refresh messages if this chat is currently selected
          if (currentSelectedChat && currentSelectedChat.id === data.data.id) {
            console.log(
              "🔄 Auto-refreshing messages for currently selected fabric vendor chat (user-specific)",
            );
            socketInstance.emit("retrieveMessages", {
              token: userToken,
              chatBuddy: currentSelectedChat.chat_buddy.id,
            });
          }
        }
      });

      socketInstance.on("connect_error", (error) => {
        console.error("=== TAILOR SOCKET CONNECTION ERROR ===");
        console.error("Error:", error);
        console.error("Error message:", error.message);
        console.error("========================================");
      });
      setSocket(socketInstance);

      return () => {
        console.log("=== CLEANING UP TAILOR SOCKET ===");
        console.log("User ID:", userId);
        socketInstance.disconnect();
        console.log("====================================");
      };
    } else {
      console.log("=== WAITING FOR USER PROFILE OR TOKEN ===");
      console.log("User token exists:", !!userToken);
      console.log("User ID exists:", !!userId);
      console.log("Profile loading:", profileLoading);
      console.log("==========================================");

      if (!userToken) {
        toastError("User token not found. Please login again.");
      }
    }
  }, [userToken, userId, profileLoading]);

  // Fetch chats via Socket.IO on mount
  useEffect(() => {
    if (socket && isConnected && userToken && userId) {
      console.log("=== FETCHING CHATS VIA SOCKET ===");
      console.log("Emitting retrieveChats with token:", userToken);
      console.log("User ID:", userId);
      socket.emit("retrieveChats", { token: userToken });
      console.log("================================");
    }
  }, [socket, isConnected, userToken, userId]);

  // Fetch messages when chat is selected
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
//changed this frm retrieveMessages
      socket.emit("messagesRetrieved", {
        token: userToken,
        chatBuddy: selectedChat.chat_buddy.id,
      });
      console.log("====================================");
    }
  }, [socket, isConnected, selectedChat, userToken, userId]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowOptions(false);
      }
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEmojiClick = (emojiObject) => {
    setNewMessage((prev) => prev + emojiObject.emoji);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;

    console.log("=== TAILOR SENDING MESSAGE VIA SOCKET ===");
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
        type: "sent",
      };
      setMessageList((prev) => [...prev, newMsg]);
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

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Show loading state while profile is loading */}
      {profileLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            <span className="text-gray-700">Loading profile...</span>
          </div>
        </div>
      )}

      {/* Fixed Header */}
      <div className="bg-white shadow-sm px-6 py-4 border-b border-gray-300 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Inbox</h1>
            <p className="text-sm text-gray-500 mt-1">
              <Link
                to="/fabric"
                className="text-purple-600 hover:text-purple-700 transition-colors"
              >
                Dashboard
              </Link>
              <span className="mx-2">→</span>
              <span>Inbox</span>
            </p>
          </div>
          <div className="flex items-center space-x-2">
          <motion.button
              whileTap={{ scale: 0.95 }}
              className={` cursor-pointer flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                profileLoading
                  ? "bg-yellow-100 text-yellow-700"
                  : isConnected
                  ? "bg-purple-100 text-purple-700"
                  : "bg-red-100 text-red-700"
              }`}
              onClick={() => setShowToAdminMessages(true)}
            >
              <ChatBubbleBottomCenterTextIcon className="h-5 mr-2" />
              {/* <FaCircle size={8} /> */}
              {/* <span>
                {profileLoading
                  ? "Loading..."
                  : isConnected
                  ? "Online"
                  : "Offline"}
              </span> */}
              View messages to admin
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 bg-white border-r border-gray-200 shadow-lg z-50 w-80 transition-transform duration-300 ease-in-out md:relative md:shadow-none md:translate-x-0 flex flex-col ${
            showSidebar ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Fixed Sidebar Header */}
          <div className="p-4 border-b border-gray-300 bg-purple-300 text-gray-800 flex-shrink-0">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Messages</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowNewMessageModal(true)}
                  className="text-white hover:text-gray-200 transition-colors p-1.5 bg-purple-600 rounded-full"
                  title="New Message"
                >
                  <FaPlus size={14} />
                </button>
                <button
                  className="md:hidden text-white hover:text-gray-200 transition-colors"
                  onClick={() => setShowSidebar(false)}
                >
                  <FaTimes size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-300 bg-white flex-shrink-0">
            <div className="relative">
              <FaSearch
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={14}
              />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full py-2.5 pl-10 pr-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-colors"
              />
            </div>
          </div>

          {/* Scrollable Chat List */}
          <div className="flex-1 overflow-y-auto">
            {chats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <FaSmile className="text-purple-600" size={24} />
                </div>
                <p className="text-gray-600 font-medium mb-2">
                  No conversations yet
                </p>
                <p className="text-gray-400 text-sm mb-4">
                  Start a new conversation to get started
                </p>
                <button
                  onClick={() => {
                    if (socket && socket.connected && userToken) {
                      socket.emit("retrieveChats", { token: userToken });
                      console.log("Manual retry - retrieveChats sent");
                    }
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors"
                >
                  Retry Loading
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`p-4 cursor-pointer transition-all hover:bg-gray-50 ${
                      selectedChat?.id === chat.id
                        ? "bg-purple-50 border-r-4 border-purple-500"
                        : ""
                    }`}
                    onClick={() => {
                      setSelectedChat(chat);
                      setShowSidebar(false);
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg shadow-md">
                          {chat.chat_buddy?.name?.charAt(0).toUpperCase() ||
                            "U"}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-gray-900 truncate">
                            {chat.chat_buddy?.name || "Unknown User"}
                          </h4>
                          <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                            <span className="text-xs text-gray-500">
                              {new Date(
                                chat.created_at || Date.now(),
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })}
                            </span>
                            {chat.unread > 0 && (
                              <span className="relative flex items-center justify-center">
                                <span className="absolute bg-red-500 rounded-full h-3 w-3 animate-ping opacity-75"></span>
                                <span className="relative bg-red-500 rounded-full h-2 w-2"></span>
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 truncate mt-1">
                          {chat.last_message || "No messages yet"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Window */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Fixed Chat Header */}
          <div className="p-4 border-b border-gray-300 bg-white shadow-sm flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  className="md:hidden text-gray-500 hover:text-gray-700 transition-colors"
                  onClick={() => setShowSidebar(true)}
                >
                  <FaBars size={20} />
                </button>
                {selectedChat ? (
                  <>
                    <div className="relative">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-md">
                        {selectedChat.chat_buddy?.name
                          ?.charAt(0)
                          .toUpperCase() || "U"}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {selectedChat.chat_buddy?.name || "Unknown User"}
                      </h4>
                      <p className="text-sm text-green-600 font-medium">
                        Online
                      </p>
                    </div>
                  </>
                ) : (
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Select a chat
                    </h4>
                    <p className="text-sm text-gray-500">
                      Choose a conversation to start messaging
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Scrollable Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-gray-100">
            {selectedChat ? (
              messageList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    <FaSmile className="text-purple-600" size={24} />
                  </div>
                  <p className="text-gray-600 font-medium mb-2">
                    No messages yet
                  </p>
                  <p className="text-gray-400 text-sm">
                    Start the conversation by sending a message!
                  </p>
                </div>
              ) : (
                <>
                  {messageList?.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.type === "sent" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                          msg.type === "sent"
                            ? "bg-purple-600 text-white rounded-br-md"
                            : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                        <span
                          className={`block text-xs mt-1 ${
                            msg.type === "sent"
                              ? "text-purple-200"
                              : "text-gray-500"
                          }`}
                        >
                          {msg.time}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                  <FaSmile className="text-white" size={32} />
                </div>
                <p className="text-gray-600 font-medium mb-2">
                  Welcome to your inbox!
                </p>
                <p className="text-gray-400 text-sm">
                  Select a conversation from the sidebar to start messaging
                </p>
              </div>
            )}
          </div>

          {/* Fixed Message Input */}
          <div className="p-4 bg-white border-t border-gray-300 flex-shrink-0">
            <div className="flex items-end space-x-3">
              {/* Attachment Button */}

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowOptions(!showOptions)}
                  className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                  disabled={!selectedChat || !isConnected}
                >
                  <FaPlus size={18} />
                </button>

                {showOptions && (
                  <div className="absolute bottom-full left-0 mb-2 w-52 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                    <button className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                      <FaFile className="mr-3 text-blue-500" size={16} />
                      Attach File
                    </button>

                    <button className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                      <FaImage className="mr-3 text-green-500" size={16} />
                      Send Image
                    </button>

                    <button className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                      <FaMapMarkerAlt className="mr-3 text-red-500" size={16} />
                      Share Location
                    </button>
                  </div>
                )}
              </div>

              {/* Input Field */}

              <div className="flex-1 relative">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none max-h-32 transition-colors"
                  rows={1}
                  disabled={!selectedChat || !isConnected}
                  style={{
                    minHeight: "46px",

                    height: "auto",

                    lineHeight: "1.5",
                  }}
                />
              </div>

              {/* Emoji Button */}

              <div className="relative" ref={emojiPickerRef}>
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                  disabled={!selectedChat || !isConnected}
                >
                  <FaSmile size={18} />
                </button>

                {showEmojiPicker && (
                  <div className="absolute bottom-full right-0 mb-2 z-10">
                    <EmojiPicker
                      onEmojiClick={handleEmojiClick}
                      width={300}
                      height={400}
                    />
                  </div>
                )}
              </div>

              {/* Send Button */}

              <button
                onClick={sendMessage}
                disabled={!selectedChat || !isConnected || !newMessage.trim()}
                className="p-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg"
              >
                <FaPaperPlane size={16} />
              </button>
            </div>
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
                  New Message to Admins
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
                  !messageText.trim() ||
                  !isConnected ||
                  sendingMessage
                }
                className="cursor-pointer px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
      {showToAdminMessages && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm bg-opacity-40 flex justify-center items-center z-50"
        >
          <div className="bg-white p-8 rounded-lg max-w-xl w-full shadow-lg my-10" style={{ maxHeight: "80vh" }}>
            <h2 className="text-2xl font-bold mb-3 text-purple-700 flex items-center gap-2">
              <ChatBubbleBottomCenterIcon className="h-7 w-7 text-purple-500" />
              Messages to Admin
            </h2>
            <div className="mt-2">
              <p className="text-gray-600 mb-5">
                Here are the messages you initiated to customer admins. as soon
                as an admin responds, they automatically go to your inbox
              </p>
              {/* Messages list ONLY is scrollable */}
              <div
                className="overflow-auto"
                style={{
                  maxHeight: "45vh",
                  minHeight: "120px",
                  scrollbarWidth: "thin",           // For Firefox
                  scrollbarColor: "#a78bfa #f3f4f6" // For Firefox (thumb and track)
                }}
              >
                <style>
                  {`
                    /* For Chrome, Edge, and Safari */
                    .overflow-auto::-webkit-scrollbar {
                      width: 6px;
                    }
                    .overflow-auto::-webkit-scrollbar-thumb {
                      background: #a78bfa;
                      border-radius: 3px;
                    }
                    .overflow-auto::-webkit-scrollbar-track {
                      background: #f3f4f6;
                      border-radius: 3px;
                    }
                  `}
                </style>
                {roleConversations?.map((message) => (
                  <div
                    key={message.id}
                    className="mb-4 p-3 bg-gray-100 rounded-md shadow-sm text-sm flex flex-col"
                  >
                    <span className="font-semibold text-purple-700">
                      {message.initiator?.name || message.sender || "You"}
                    </span>
                    <span className="mt-1 text-gray-800">
                      {message.message || message.text}
                    </span>
                    <span className="mt-1 text-gray-500 text-xs self-end">
                      {message.created_at
                        ? new Date(message.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })
                        : message.time || ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                className="cursor-pointer px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition"
                onClick={() => setShowToAdminMessages(false)}
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
