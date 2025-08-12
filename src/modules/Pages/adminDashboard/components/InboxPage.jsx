import { useEffect, useRef, useState } from "react";
import { Plus, Mail, ChevronRight } from "lucide-react";
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
} from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";
import { Link } from "react-router-dom";
import io from "socket.io-client";
import Cookies from "js-cookie";
import useSendMessage from "../../../../hooks/messaging/useSendMessage";
import useToast from "../../../../hooks/useToast";
import { useQuery } from "@tanstack/react-query";
import CaryBinApi from "../../../../services/CarybinBaseUrl";
import AuthService from "../../../../services/api/auth";

// Role mapping for the API
const roleMapping = {
  Customer: "user",
  Tailor: "fashion-designer",
  Fabric: "fabric-vendor",
  "Market Rep": "market-representative",
  Logistics: "logistics-agent",
};

export default function InboxPage() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageList, setMessageList] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Socket and messaging states
  const [socket, setSocket] = useState(null);
  const [userType, setUserType] = useState("");
  const [selectedUser, setSelectedUser] = useState(""); // for value in <select>
  const [userListSelected, setUserListSelected] = useState(""); // for custom list selection
  const [messageText, setMessageText] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [chats, setChats] = useState([]);
  const [chatId, setChatId] = useState(null);

  // Admin profile state
  const [adminProfile, setAdminProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const dropdownRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const selectedChatRef = useRef(selectedChat);
  const adminToken = Cookies.get("adminToken");
  // Use profile ID instead of hardcoded ID
  const adminId = adminProfile?.id || null;
  const { toastError, toastSuccess } = useToast();

  // Remove usersError and related debug code
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userPage, setUserPage] = useState(1);
  const usersPerPage = 10;
  const [totalUsers, setTotalUsers] = useState(0);

  // Pagination calculation
  const totalPages = Math.ceil(totalUsers / usersPerPage);

  // Fetch users with pagination using the correct endpoint
  const fetchUsers = async (role, page = 1) => {
    if (!role) return;
    setUsersLoading(true);
    try {
      const res = await CaryBinApi.get(
        `/auth/users/${roleMapping[role]}?pagination[page]=${page}`,
      );
      setUsers(res.data.data || []);
      setTotalUsers(res.data.count || 0);
    } catch (e) {
      setUsers([]);
      setTotalUsers(0);
      toastError("Failed to fetch users.");
    }
    setUsersLoading(false);
  };

  // Fetch users when userType or userPage changes
  useEffect(() => {
    if (userType) {
      fetchUsers(userType, userPage);
    } else {
      setUsers([]);
      setTotalUsers(0);
    }
  }, [userType, userPage]);

  // Debug users data (remove usersError usage)
  useEffect(() => {
    if (users) {
      console.log("Users data received:", users);
      console.log("Users array:", users);
    }
    // Remove usersError block
  }, [users]);

  // Send message hook
  const { isPending: sendingMessage, sendMessageMutate } = useSendMessage();

  // Keep selectedChatRef in sync and set chatId
  useEffect(() => {
    selectedChatRef.current = selectedChat;
    if (selectedChat) {
      setChatId(selectedChat.id);
      console.log("=== CHAT SELECTED ===");
      console.log("Selected chat:", selectedChat);
      console.log("Chat ID set to:", selectedChat.id);
      console.log("====================");
    } else {
      setChatId(null);
      console.log("=== CHAT DESELECTED ===");
      console.log("Chat ID set to null");
      console.log("======================");
    }
  }, [selectedChat]);

  // Debug chatId changes
  useEffect(() => {
    console.log("=== CHAT ID CHANGED ===");
    console.log("New chatId value:", chatId);
    console.log("Selected chat:", selectedChat);
    console.log("Admin ID:", adminId);
    console.log("=====================");
  }, [chatId]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messageList]);

  // Fetch chats via Socket.IO on mount
  useEffect(() => {
    if (socket && isConnected && adminToken && adminId) {
      console.log("=== FETCHING CHATS VIA SOCKET ===");
      console.log("Emitting retrieveChats with token:", adminToken);
      console.log("Admin ID:", adminId);
      socket.emit("retrieveChats", {
        token: adminToken,
      });
      console.log("================================");
    }
  }, [socket, isConnected, adminToken, adminId]);

  // Fetch messages when chat is selected
  useEffect(() => {
    if (socket && isConnected && selectedChat && adminToken && adminId) {
      console.log("=== FETCHING MESSAGES VIA SOCKET ===");
      console.log("Selected chat object:", selectedChat);
      console.log("Selected chat ID:", selectedChat.id);
      console.log("Admin ID:", adminId);
      console.log("Current chatId state:", chatId);
      console.log("Chat buddy ID:", selectedChat.chat_buddy?.id);
      console.log("Emitting retrieveMessages");

      // Set up chat-specific listener for this chat
      if (socket.setupChatSpecificListener) {
        socket.setupChatSpecificListener(selectedChat.id);
      }

      socket.emit("retrieveMessages", {
        token: adminToken,
        chatBuddy: selectedChat.chat_buddy?.id || selectedChat.id,
      });
      console.log("====================================");
    }
  }, [socket, isConnected, selectedChat, adminToken, adminId, chatId]);

  // Initialize Socket.IO connection
  useEffect(() => {
    console.log("=== INITIALIZING ADMIN SOCKET CONNECTION ===");
    console.log("Admin token:", adminToken);
    console.log("Admin ID from profile:", adminId);
    console.log("Profile loading:", profileLoading);
    console.log("Socket URL: https://api-staging.carybin.com/");
    console.log("============================================");

    // Wait for profile to be loaded before initializing socket
    if (adminToken && adminId && !profileLoading) {
      console.log(adminToken, adminId);
      const socketInstance = io("https://api-staging.carybin.com/", {
        auth: {
          token: adminToken,
        },
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
        console.log("=== ADMIN SOCKET CONNECTED ===");
        console.log("Socket ID:", socketInstance.id);
        console.log("Socket connected:", socketInstance.connected);
        console.log("Admin ID being used:", adminId);
        console.log("==============================");
        setIsConnected(true);
      });

      socketInstance.on("disconnect", (reason) => {
        console.log("=== SOCKET DISCONNECTED ===");
        console.log("Disconnect reason:", reason);
        console.log("===========================");
        setIsConnected(false);
      });

      // Listen for admin-specific message sent events
      socketInstance.on(`messageSent:${adminId}`, (data) => {
        console.log("🎉 === ADMIN MESSAGE SENT EVENT RECEIVED === 🎉");
        console.log("Admin ID:", adminId);
        console.log("Event data:", data);
        console.log("🎉 ========================================= 🎉");
        toastSuccess(data?.message || "Message delivered successfully");
      });

      // Listen for admin-specific chats retrieved events
      socketInstance.on(`chatsRetrieved:${adminId}`, (data) => {
        console.log("=== ADMIN CHATS RETRIEVED ===");
        console.log("Admin ID:", adminId);
        console.log("Event data:", data);
        console.log("Status:", data?.status);
        console.log("Chats array:", data?.data?.result);
        console.log("============================");

        // Set chats from the retrieved data
        if (data?.status === "success" && data?.data?.result) {
          setChats(data.data.result);
          toastSuccess(data?.message || "Chats loaded successfully");
        }
      });

      // Listen for admin-specific recent chat retrieved events
      socketInstance.on(`recentChatRetrieved:${adminId}`, (data) => {
        console.log("=== ADMIN RECENT CHAT RETRIEVED ===");
        console.log("Admin ID:", adminId);
        console.log("Event data:", data);
        console.log("==================================");

        // Update chats list with new chat data
        if (data?.data) {
          const currentSelectedChat = selectedChatRef.current;

          setChats((prevChats) => {
            const existingChatIndex = prevChats.findIndex(
              (chat) => chat.id === data.data.id,
            );

            if (existingChatIndex >= 0) {
              // Update existing chat
              const updatedChats = [...prevChats];
              updatedChats[existingChatIndex] = {
                ...updatedChats[existingChatIndex],
                last_message: data.data.last_message,
                created_at: data.data.created_at,
              };
              return updatedChats;
            } else {
              // Check if this is a chat with the same chat_buddy to prevent duplicates
              const duplicateChatIndex = prevChats.findIndex(
                (chat) => chat.chat_buddy?.id === data.data.chat_buddy?.id,
              );

              if (duplicateChatIndex >= 0) {
                // Update the existing chat with same buddy instead of creating new one
                const updatedChats = [...prevChats];
                updatedChats[duplicateChatIndex] = {
                  ...updatedChats[duplicateChatIndex],
                  last_message: data.data.last_message,
                  created_at: data.data.created_at,
                  id: data.data.id, // Update the ID to the latest one
                };
                return updatedChats;
              } else {
                // Add new chat only if no duplicate buddy exists
                return [data.data, ...prevChats];
              }
            }
          });

          // Auto-refresh messages if this chat is currently selected
          if (currentSelectedChat && currentSelectedChat.id === data.data.id) {
            console.log(
              "🔄 Auto-refreshing messages for currently selected admin chat",
            );
            socketInstance.emit("retrieveMessages", {
              token: adminToken,
              chatBuddy: currentSelectedChat.chat_buddy.id,
            });
          }
        }
      });

      // Listen for admin-specific messages retrieved events
      socketInstance.on(`messagesRetrieved:${adminId}`, (data) => {
        console.log(`=== ADMIN-SPECIFIC MESSAGES RETRIEVED (${adminId}) ===`);
        console.log("Full response:", JSON.stringify(data, null, 2));
        console.log("Status:", data?.status);
        console.log("Messages array:", data?.data?.result);
        console.log("Selected chat from ref:", selectedChatRef.current);
        console.log("===============================================");

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
        const eventName = `messagesRetrieved:${chatId}:${adminId}`;
        console.log(`🎯 Setting up chat-specific listener: ${eventName}`);

        socketInstance.on(eventName, (data) => {
          console.log(
            `=== ADMIN CHAT-SPECIFIC MESSAGES RETRIEVED (${chatId}:${adminId}) ===`,
          );
          console.log("Full response:", JSON.stringify(data, null, 2));
          console.log("Status:", data?.status);
          console.log("Messages array:", data?.data?.result);
          console.log("Selected chat from ref:", selectedChatRef.current);
          console.log(
            "==============================================================",
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

      // Listen for general messagesRetrieved events (without adminId)
      socketInstance.on("messagesRetrieved", (data) => {
        console.log("=== ADMIN GENERAL MESSAGES RETRIEVED ===");
        console.log("Full response:", JSON.stringify(data, null, 2));
        console.log("Status:", data?.status);
        console.log("Messages array:", data?.data?.result);
        console.log("Selected chat from ref:", selectedChatRef.current);
        console.log("========================================");

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

      // Listen for general recentChatRetrieved events (without adminId)
      socketInstance.on("recentChatRetrieved", (data) => {
        console.log("=== ADMIN GENERAL RECENT CHAT RETRIEVED ===");
        console.log("Chat data:", JSON.stringify(data, null, 2));
        console.log("==========================================");

        if (data?.data) {
          const currentSelectedChat = selectedChatRef.current;

          setChats((prevChats) => {
            const existingChatIndex = prevChats.findIndex(
              (chat) => chat.id === data.data.id,
            );

            if (existingChatIndex >= 0) {
              // Update existing chat
              const updatedChats = [...prevChats];
              updatedChats[existingChatIndex] = {
                ...updatedChats[existingChatIndex],
                last_message: data.data.last_message,
                created_at: data.data.created_at,
              };
              return updatedChats;
            } else {
              // Check if this is a chat with the same chat_buddy to prevent duplicates
              const duplicateChatIndex = prevChats.findIndex(
                (chat) => chat.chat_buddy?.id === data.data.chat_buddy?.id,
              );

              if (duplicateChatIndex >= 0) {
                // Update the existing chat with same buddy instead of creating new one
                const updatedChats = [...prevChats];
                updatedChats[duplicateChatIndex] = {
                  ...updatedChats[duplicateChatIndex],
                  last_message: data.data.last_message,
                  created_at: data.data.created_at,
                  id: data.data.id, // Update the ID to the latest one
                };
                return updatedChats;
              } else {
                // Add new chat only if no duplicate buddy exists
                return [data.data, ...prevChats];
              }
            }
          });

          // Auto-refresh messages if this chat is currently selected
          if (currentSelectedChat && currentSelectedChat.id === data.data.id) {
            console.log(
              "🔄 Auto-refreshing messages for currently selected admin chat (general event)",
            );
            socketInstance.emit("retrieveMessages", {
              token: adminToken,
              chatBuddy: currentSelectedChat.chat_buddy.id,
            });
          }
        }
      });

      setSocket(socketInstance);

      return () => {
        console.log("=== CLEANING UP ADMIN SOCKET ===");
        console.log("Admin ID:", adminId);
        socketInstance.disconnect();
        console.log("===============================");
      };
    } else {
      console.log("=== WAITING FOR ADMIN PROFILE OR TOKEN ===");
      console.log("Admin token exists:", !!adminToken);
      console.log("Admin ID exists:", !!adminId);
      console.log("Profile loading:", profileLoading);
      console.log("==========================================");

      if (!adminToken) {
        toastError("Admin token not found. Please login again.");
      }
    }
  }, [adminToken, adminId, profileLoading]);

  // Fetch admin profile on mount
  useEffect(() => {
    const fetchAdminProfile = async () => {
      if (!adminToken) {
        console.error("=== NO ADMIN TOKEN FOR PROFILE FETCH ===");
        setProfileLoading(false);
        return;
      }

      try {
        console.log("=== FETCHING ADMIN PROFILE ===");
        console.log("Admin token:", adminToken);

        const response = await AuthService.GetUser();
        console.log("Admin profile response:", response.data);

        if (response.data?.statusCode === 200 && response.data?.data) {
          setAdminProfile(response.data.data);
          console.log("✅ Admin profile loaded:", response.data.data);
          console.log("✅ Admin ID from profile:", response.data.data.id);
        } else {
          console.error("❌ Invalid admin profile response:", response.data);
          toastError("Failed to load admin profile");
        }
      } catch (error) {
        console.error("❌ Error fetching admin profile:", error);
        toastError("Error loading admin profile: " + error.message);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchAdminProfile();
  }, [adminToken]);

  // Handle user type selection
  const handleUserTypeChange = (e) => {
    const selectedType = e.target.value;
    console.log("Selected user type:", selectedType);
    console.log("Mapped role:", roleMapping[selectedType]);
    setUserType(selectedType);
    setSelectedUser("");
  };

  // When user selects from dropdown, sync custom list selection
  const handleUserDropdownChange = (e) => {
    setSelectedUser(e.target.value);
    setUserListSelected(e.target.value);
  };

  // When user clicks on custom list, sync dropdown selection
  const handleUserListClick = (id) => {
    setSelectedUser(id);
    setUserListSelected(id);
  };

  // Handle message sending via Socket.IO and API (for modal)
  const handleSocketMessage = (e) => {
    if (!navigator.onLine) {
      toastError("No internet connection. Please check your network.");
      return;
    }
    e.preventDefault();

    console.log("=== ADMIN SENDING MESSAGE VIA MODAL ===");
    console.log("Selected user:", selectedUser);
    console.log("Message text:", messageText);
    console.log("Admin token:", adminToken);
    console.log("Admin ID from profile:", adminId);
    console.log("Current selected chat:", selectedChat);
    console.log("=====================================");

    if (!selectedUser || !messageText.trim()) {
      toastError("Please select a user and enter a message.");
      return;
    }

    if (!adminId) {
      toastError("Admin profile not loaded. Please wait and try again.");
      return;
    }

    const messageData = {
      token: adminToken,
      chatBuddy: selectedUser,
      message: messageText.trim(),
    };

    console.log("Message data to send:", messageData);

    // Send via Socket.IO only
    if (socket && isConnected) {
      console.log("=== SENDING MESSAGE VIA SOCKET (MODAL) ===");
      console.log("Socket ID:", socket.id);
      console.log("Message data:", messageData);
      console.log("Socket connected:", socket.connected);
      console.log("=========================================");

      socket.emit("sendMessage", messageData);

      // Only add message to local state if it's for the currently selected chat
      const isMessageForCurrentChat =
        selectedChat &&
        (selectedChat.chat_buddy?.id === selectedUser ||
          selectedChat.id === selectedUser);

      if (isMessageForCurrentChat) {
        console.log("Adding message to current chat's message list");
        const newMsg = {
          id: Date.now(),
          sender: "You",
          text: messageText.trim(),
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
          type: "sent",
        };
        setMessageList((prev) => [...prev, newMsg]);
      } else {
        console.log(
          "Message is for different user, not adding to current chat",
        );
      }

      // Update chats list - find or create chat entry for the sent message
      const targetUser = users.find((user) => user.id === selectedUser);
      if (targetUser) {
        setChats((prevChats) => {
          const existingChatIndex = prevChats.findIndex(
            (chat) => chat.chat_buddy?.id === selectedUser,
          );

          if (existingChatIndex >= 0) {
            // Update existing chat
            const updatedChats = [...prevChats];
            updatedChats[existingChatIndex] = {
              ...updatedChats[existingChatIndex],
              last_message: messageText.trim(),
              created_at: new Date().toISOString(),
            };
            // Move updated chat to top
            const updatedChat = updatedChats.splice(existingChatIndex, 1)[0];
            return [updatedChat, ...updatedChats];
          } else {
            // Create new chat entry
            const newChat = {
              id: Date.now(),
              last_message: messageText.trim(),
              chat_buddy: targetUser,
              created_at: new Date().toISOString(),
              unread: 0,
            };
            return [newChat, ...prevChats];
          }
        });
      }

      setMessageText("");
      setShowModal(false);
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

  // Unified sendMessage for chat input (Socket.IO) - for selected chat only
  const sendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;

    console.log("=== ADMIN SENDING MESSAGE VIA CHAT INPUT ===");
    console.log("Socket ID:", socket?.id);
    console.log("Selected chat:", selectedChat.id);
    console.log("Message:", newMessage);
    console.log("Socket connected:", socket?.connected);
    console.log("Admin ID from profile:", adminId);
    console.log("===========================================");

    if (!adminId) {
      toastError("Admin profile not loaded. Please wait and try again.");
      return;
    }

    if (socket && isConnected) {
      const messageData = {
        token: adminToken,
        chatBuddy: selectedChat.chat_buddy?.id || selectedChat.id,
        message: newMessage.trim(),
      };

      console.log("Message data to send:", messageData);
      socket.emit("sendMessage", messageData);

      // Add message to local state immediately (only for current chat)
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

  const handleModalClose = () => {
    setShowModal(false);
    setUserType("");
    setSelectedUser("");
    setMessageText("");
  };

  // Filter chats by search term (by chat buddy name or email)
  const filteredChats = chats.filter((chat) => {
    const buddy = chat.chat_buddy;
    const name = buddy?.name?.toLowerCase() || "";
    const email = buddy?.email?.toLowerCase() || "";
    return (
      name.includes(searchTerm.toLowerCase()) ||
      email.includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Fixed Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6 flex-shrink-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Mail className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Inbox</h1>
              <div className="flex items-center text-sm text-gray-500">
                <a
                  href="/admin"
                  className="text-purple-600 purple:text-purple-800 font-medium transition-colors"
                >
                  Dashboard
                </a>
                <ChevronRight className="w-4 h-4 mx-2" />
                <span>Inbox</span>
              </div>
            </div>
          </div>

          <button
            className="group relative bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-lg font-medium hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
            onClick={() => setShowModal(true)}
          >
            <div className="flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>New Message</span>
            </div>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-200"></div>
          </button>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 bg-white border-r border-gray-200 w-80 transition-transform duration-300 md:relative md:w-1/3 lg:w-1/4 z-30 flex flex-col ${
            showSidebar ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          {/* Fixed Sidebar Header */}
          <div className="p-6 border-b border-gray-100 flex-shrink-0">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Messages</h2>
              <button
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setShowSidebar(false)}
              >
                <FaTimes size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <FaSearch
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-3 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm focus:border-purple-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Scrollable Chat List */}
          <div className="flex-1 overflow-y-auto">
            {filteredChats.length === 0 ? (
              <div className="text-center text-gray-500 py-12 px-6">
                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <FaSearch className="text-gray-400" size={24} />
                </div>
                <p className="font-medium mb-2">No conversations yet</p>
                <p className="text-sm">
                  Start a new conversation to see chats here
                </p>
              </div>
            ) : (
              <div className="p-2">
                {filteredChats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`flex items-center p-3 rounded-xl cursor-pointer transition-all hover:bg-gray-50 ${
                      selectedChat?.id === chat.id
                        ? "bg-purple-50 border-l-4 border-purple-500"
                        : ""
                    }`}
                    onClick={() => {
                      setSelectedChat(chat);
                      localStorage.setItem("selectedChatId", chat.id);
                      setShowSidebar(false);
                    }}
                  >
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {chat.chat_buddy?.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      {chat.online && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>

                    <div className="flex-1 ml-3 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-semibold text-gray-900 truncate text-sm">
                          {chat.chat_buddy?.name || "Unknown User"}
                        </h4>
                        {/* <span className="text-xs text-gray-500 flex-shrink-0">
                          {new Date(chat.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </span> */}
                      </div>

                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-600 truncate flex-1">
                          {chat.last_message || "No messages yet"}
                        </p>
                        {chat.unread > 0 && (
                          <span className="inline-block bg-purple-500 text-white text-xs rounded-full px-2 py-1 ml-2 flex-shrink-0">
                            {chat.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Window */}
        <div className="flex-1 flex flex-col bg-white min-h-0">
          {/* Fixed Chat Header */}
          <div className="p-4 border-b border-gray-200 bg-white shadow-sm flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors mr-2"
                  onClick={() => setShowSidebar(true)}
                >
                  <FaBars size={20} className="text-gray-500" />
                </button>

                {selectedChat && (
                  <>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {selectedChat?.chat_buddy?.name
                        ?.charAt(0)
                        .toUpperCase() || "U"}
                    </div>
                    <div className="ml-3">
                      <h4 className="font-semibold text-gray-900">
                        {selectedChat?.chat_buddy?.name}
                      </h4>
                      {/* <p className="text-xs text-green-500">Online</p> */}
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isConnected ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></div>
                  <span className="text-xs text-gray-600">
                    {isConnected ? "Connected" : "Disconnected"}
                  </span>
                </div>

                {selectedChat && (
                  <button className="text-sm text-purple-500 hover:text-purple-600 font-medium transition-colors">
                    View Profile
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Scrollable Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 min-h-0">
            {selectedChat ? (
              messageList.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <FaPaperPlane className="text-gray-400" size={24} />
                  </div>
                  <p className="font-medium mb-2">No messages yet</p>
                  <p className="text-sm">Start the conversation!</p>
                </div>
              ) : (
                <>
                  {messageList.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.type === "sent" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`px-4 py-3 rounded-2xl max-w-[70%] shadow-sm ${
                          msg.type === "sent"
                            ? "bg-purple-500 text-white rounded-br-md"
                            : "bg-white text-gray-800 rounded-bl-md border border-gray-200"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                        <span
                          className={`block text-xs mt-1 ${
                            msg.type === "sent"
                              ? "text-purple-100"
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
              <div className="text-center text-gray-500 py-12">
                <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <FaSearch className="text-gray-400" size={28} />
                </div>
                <p className="font-medium mb-2 text-lg">
                  Select a conversation
                </p>
                <p className="text-sm">
                  Choose a chat from the sidebar to start messaging
                </p>
              </div>
            )}
          </div>

          {/* Fixed Message Input */}
          <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
            <div className="flex items-center gap-3">
              {/* Attachment Button */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowOptions(!showOptions)}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  disabled={!selectedChat}
                >
                  <FaPlus size={20} className="text-gray-500" />
                </button>

                {showOptions && (
                  <div className="absolute bottom-14 left-0 w-44 bg-white shadow-lg rounded-lg border border-gray-200 py-2 z-20">
                    <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <FaFile size={16} className="mr-3 text-purple-500" />{" "}
                      Attach File
                    </button>
                    <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <FaImage size={16} className="mr-3 text-green-500" /> Send
                      Image
                    </button>
                    <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <FaMapMarkerAlt size={16} className="mr-3 text-red-500" />{" "}
                      Share Location
                    </button>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  className="w-full py-3 px-4 pr-12 bg-gray-50 border border-gray-200 rounded-2xl outline-none text-sm focus:border-purple-500 focus:bg-white transition-all"
                  disabled={!selectedChat}
                />

                {/* Emoji Button */}
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 transition-colors"
                  disabled={!selectedChat}
                >
                  <FaSmile size={20} className="text-gray-500" />
                </button>

                {showEmojiPicker && (
                  <div
                    ref={emojiPickerRef}
                    className="absolute bottom-14 right-0 bg-white shadow-lg rounded-lg border border-gray-200 z-20"
                  >
                    <EmojiPicker
                      onEmojiClick={handleEmojiClick}
                      width={280}
                      height={350}
                    />
                  </div>
                )}
              </div>

              {/* Send Button */}
              <button
                onClick={sendMessage}
                className="p-3 bg-purple-500 text-white rounded-2xl hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                disabled={!selectedChat}
              >
                <FaPaperPlane size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Modal with Socket.IO Integration */}
      {showModal && (
        <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center outline-none pb-3 mb-4">
              <h2 className="text-lg font-semibold">Send Message</h2>
              <button
                onClick={() => {
                  handleModalClose();
                  setUserPage(1);
                }}
                className="text-gray-500 hover:text-black"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <form onSubmit={handleSocketMessage}>
                <div>
                  <label className="block text-gray-700 mb-4">User Type</label>
                  <select
                    className="w-full p-4 border border-[#CCCCCC] text-gray-700 outline-none rounded-lg"
                    value={userType}
                    onChange={(e) => {
                      handleUserTypeChange(e);
                      setUserPage(1);
                    }}
                    required
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
                  <label className="block text-gray-700 mb-4 mt-4">
                    Users will show here
                  </label>
                  <div className="max-h-60 overflow-y-auto mt-2 rounded border border-gray-100 bg-white shadow">
                    {users.length > 0
                      ? users.map((user) => (
                          <div
                            key={user.id}
                            className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-purple-50 transition ${
                              userListSelected === user.id
                                ? "bg-purple-100"
                                : ""
                            }`}
                            onClick={() => handleUserListClick(user.id)}
                          >
                            {user.profile?.profile_picture ? (
                              <img
                                src={user.profile.profile_picture}
                                alt={user.name || user.email}
                                className="w-10 h-10 rounded-full object-cover border border-purple-200"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center text-lg font-bold text-purple-700">
                                {(
                                  user.name?.charAt(0) ||
                                  user.email?.charAt(0) ||
                                  "U"
                                ).toUpperCase()}
                              </div>
                            )}
                            <div className="flex flex-col min-w-0">
                              <span className="font-medium text-gray-900 truncate">
                                {user.name || "No Name"}
                              </span>
                              <span className="text-xs text-gray-500 truncate">
                                {user.email}
                              </span>
                            </div>
                            {userListSelected === user.id && (
                              <span className="ml-auto text-xs text-purple-600 font-semibold">
                                Selected
                              </span>
                            )}
                          </div>
                        ))
                      : !usersLoading &&
                        userType && (
                          <div className="px-4 py-3 text-gray-400 text-sm">
                            No users found for this role
                          </div>
                        )}
                  </div>
                  {/* Pagination controls */}
                  <div className="flex justify-between items-center mt-2 px-2">
                    <button
                      type="button"
                      className="px-3 py-1 rounded bg-gray-100 text-gray-700 text-sm font-medium hover:bg-purple-100 disabled:opacity-50"
                      onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                      disabled={userPage === 1 || usersLoading}
                    >
                      Previous
                    </button>
                    <span className="text-xs text-gray-500">
                      Page {userPage}
                    </span>
                    <button
                      type="button"
                      className="px-3 py-1 rounded bg-purple-100 text-purple-700 text-sm font-medium hover:bg-purple-100 disabled:opacity-50"
                      onClick={() =>
                        setUserPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={
                        userPage === totalPages ||
                        usersLoading ||
                        totalPages === 0
                      }
                    >
                      Next
                    </button>
                  </div>
                  {usersLoading && (
                    <div className="py-4 flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500 mb-2"></div>
                      <div className="text-purple-400 text-xs">
                        Loading users...
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-gray-700 mb-4 mt-4">
                    Message
                  </label>
                  <textarea
                    className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                    placeholder="Type in your message"
                    rows="6"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    className="bg-gradient text-white px-4 py-3 mt-4 rounded disabled:opacity-50 disabled:cursor-not-allowed flex-1"
                    type="submit"
                    disabled={
                      sendingMessage || !selectedUser || !messageText.trim()
                    }
                  >
                    {sendingMessage ? "Sending..." : "Send Message"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
