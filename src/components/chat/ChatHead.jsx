import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, User, Users } from "lucide-react";
import Cookies from "js-cookie";
import io from "socket.io-client";
import useToast from "../../hooks/useToast";
import AuthService from "../../services/api/auth";
import CaryBinApi from "../../services/CarybinBaseUrl";
import useGetUserProfile from "../../modules/Auth/hooks/useGetProfile";
import { useQuery } from "@tanstack/react-query";
import useGetAdmins from "../../hooks/messaging/useGetAdmins";

const ChatHead = () => {
  console.log("🟣🟣🟣 CHAT HEAD COMPONENT LOADED 🟣🟣🟣");

  // Authentication check - hide ChatHead if user is not logged in
  const adminToken = Cookies.get("adminToken");
  const userToken = Cookies.get("token");
  const currentUserUrl = Cookies.get("currUserUrl");

  // If no tokens are present, don't render the chat head
  if (!adminToken && !userToken) {
    console.log(
      "🚫 ChatHead: No authentication tokens found, hiding chat head",
    );
    return null;
  }

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentView, setCurrentView] = useState("chats"); // 'chats' or 'newChat'
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Admin-specific states
  const [userType, setUserType] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [usersLoading, setUsersLoading] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [adminProfile, setAdminProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // User profile state (match inbox pattern)
  const [userProfile, setUserProfile] = useState(null);

  // Fetch admins for non-admin users
  const {
    data: availableAdmins,
    isPending: adminsFetching,
    isError: adminsFetchError,
    rawResponse,
  } = useGetAdmins();

  // Console log the complete admin data for debugging
  useEffect(() => {
    console.log("🚀🚀🚀 CHAT HEAD - COMPLETE GET ADMINS RESPONSE 🚀🚀🚀");
    console.log("📋 FULL RAW RESPONSE:", rawResponse);
    console.log(
      "📋 RAW RESPONSE STRINGIFIED:",
      JSON.stringify(rawResponse, null, 2),
    );
    console.log("📋 AVAILABLE ADMINS ARRAY:", availableAdmins);
    console.log("📋 ADMINS FETCH ERROR:", adminsFetchError);
    console.log("📋 IS FETCHING:", adminsFetching);
    console.log("📋 ADMIN COUNT:", availableAdmins?.length || 0);
    if (availableAdmins?.length > 0) {
      console.log("📋 FIRST ADMIN OBJECT:", availableAdmins[0]);
      console.log(
        "📋 ALL ADMIN IDS:",
        availableAdmins.map((admin) => admin.id),
      );
      console.log(
        "📋 ALL ADMIN NAMES:",
        availableAdmins.map((admin) => admin.name),
      );
    }
    console.log("🚀🚀🚀 END GET ADMINS RESPONSE LOG 🚀🚀🚀");
  }, [availableAdmins, adminsFetchError, adminsFetching, rawResponse]);

  // Admin messaging states for non-admin users
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  const messagesEndRef = useRef(null);
  const { toastError, toastSuccess } = useToast();

  // Get user profile for non-admin users
  const {
    data: profileData,
    isPending: profilePending,
    isSuccess: profileSuccess,
    isError: profileError,
  } = useGetUserProfile();

  // Determine user type and authentication - match customer inbox exactly
  const isAdmin =
    !!adminToken ||
    currentUserUrl === "admin" ||
    currentUserUrl === "super-admin";
  const adminId = adminProfile?.id || null;
  // Use profile state like inbox - this is the key fix!
  const userId = userProfile?.id || null;
  const currentUserId = isAdmin ? adminId : userId;

  // Fetch admins for non-admin users
  const {
    data: admins,
    isPending: adminsLoading,
    isError: adminsError,
  } = useGetAdmins();

  // User type mapping for display
  const userTypeDisplay = {
    customer: "Customer",
    tailor: "Tailor",
    fabric: "Fabric Vendor",
    logistics: "Logistics Agent",
    sales: "Market Representative",
    admin: "Admin",
    "super-admin": "Super Admin",
  };

  // Role mapping for admin API calls
  const roleMapping = {
    Customer: "user",
    Tailor: "fashion-designer",
    Fabric: "fabric-vendor",
    "Market Rep": "market-representative",
    Logistics: "logistics-agent",
  };

  // Handle admin profile fetching
  useEffect(() => {
    const fetchAdminProfile = async () => {
      if (!adminToken) {
        console.log("=== NO ADMIN TOKEN - SETTING PROFILE LOADING FALSE ===");
        setProfileLoading(false);
        return;
      }

      console.log("=== FETCHING ADMIN PROFILE FOR CHAT HEAD ===");
      console.log("Admin token exists:", !!adminToken);

      try {
        const response = await AuthService.GetUser();
        console.log("Admin profile response:", response);

        if (response.data?.statusCode === 200 && response.data?.data) {
          setAdminProfile(response.data.data);
          console.log("✅ Admin profile loaded successfully for chat head");
        } else {
          console.log("❌ Admin profile response invalid:", response.data);
        }
      } catch (error) {
        console.error("❌ Error fetching admin profile for chat head:", error);
      } finally {
        setProfileLoading(false);
        console.log("=== ADMIN PROFILE LOADING COMPLETE FOR CHAT HEAD ===");
      }
    };

    if (isAdmin) {
      // Set profile loading to false immediately for admin to show chat head
      setProfileLoading(false);
      fetchAdminProfile();
    } else {
      setProfileLoading(false);
    }
  }, [adminToken, isAdmin]);

  // Handle non-admin user profile loading - MATCH INBOX PATTERN EXACTLY
  useEffect(() => {
    if (!isAdmin) {
      if (profileSuccess && profileData) {
        console.log("=== 🟢 CHAT HEAD: USER PROFILE LOADED ===");
        console.log("Full profile data:", JSON.stringify(profileData, null, 2));
        console.log("Profile ID (chat head):", profileData.id);
        console.log("User type:", currentUserUrl);
        console.log("Compare with customer inbox profile ID!");
        console.log("Expected socket event: chatsRetrieved:" + profileData.id);
        console.log("=========================================");
        // Set profile state like inbox does - THIS IS THE KEY FIX!
        setUserProfile(profileData);
        setProfileLoading(false);
      } else if (profileError) {
        console.error("=== ❌ CHAT HEAD: PROFILE LOADING ERROR ===");
        console.error("Error:", profileError);
        console.error("==========================================");
        setProfileLoading(false);
      } else if (profilePending) {
        console.log("=== ⏳ CHAT HEAD: USER PROFILE LOADING ===");
        console.log("Profile is loading...");
        console.log("User type:", currentUserUrl);
        console.log("========================================");
        setProfileLoading(true);
      }
    }
  }, [
    profileSuccess,
    profileData,
    profileError,
    profilePending,
    isAdmin,
    currentUserUrl,
  ]);

  // Initialize socket connection
  useEffect(() => {
    console.log("🟣🟣🟣 CHAT HEAD: SOCKET EFFECT RUNNING 🟣🟣🟣");
    console.log("Current token:", !!(isAdmin ? adminToken : userToken));
    console.log("Profile loading:", profileLoading);
    console.log("Is admin:", isAdmin);
    console.log("User ID:", userId);
    console.log("Admin ID:", adminId);
    console.log("Current user URL:", currentUserUrl);

    // Don't connect if not authenticated - check both tokens like inbox
    if (!(isAdmin ? adminToken : userToken)) {
      console.log("❌ Socket: No token, skipping connection");
      console.log("  - Admin token:", !!adminToken);
      console.log("  - User token:", !!userToken);
      console.log("  - Is admin:", isAdmin);
      return;
    }

    // Wait for profile to be loaded before initializing socket (like fabric vendor)
    // Use EXACT same condition as inbox: userToken && userId && !profileLoading
    if (!isAdmin && (!userToken || !userId || profileLoading)) {
      console.log("❌ Socket: Non-admin profile not ready");
      console.log("  - User token:", !!userToken);
      console.log("  - User ID:", !!userId);
      console.log("  - Profile loading:", profileLoading);
      return;
    }

    // For admin users, wait for profile loading to complete
    if (isAdmin && profileLoading) {
      console.log("❌ Socket: Admin profile still loading, waiting...");
      return;
    }

    console.log("=== INITIALIZING SOCKET CONNECTION ===");
    console.log("User type:", currentUserUrl);
    console.log("Is admin:", isAdmin);
    console.log("Current user ID:", currentUserId);
    console.log(
      "Token:",
      (isAdmin ? adminToken : userToken)?.substring(0, 20) + "...",
    );
    console.log("======================================");

    const socketInstance = io("https://api-staging.carybin.com/", {
      auth: { token: isAdmin ? adminToken : userToken },
      transports: ["websocket", "polling"],
      timeout: 20000,
      forceNew: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on("connect", () => {
      console.log("=== SOCKET CONNECTED ===");
      console.log("Socket ID:", socketInstance.id);
      console.log("User type:", currentUserUrl);
      console.log("User ID:", currentUserId);
      console.log("========================");
      setIsConnected(true);
      setSocket(socketInstance);

      // Connection established - no toast needed
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("=== SOCKET DISCONNECTED ===");
      console.log("Reason:", reason);
      console.log("User type:", currentUserUrl);
      console.log("===========================");
      setIsConnected(false);
    });

    // Listen for chats retrieved events - both general and user-specific
    socketInstance.on("chatsRetrieved", (data) => {
      console.log("🚨🚨🚨 CHAT HEAD: chatsRetrieved EVENT RECEIVED! 🚨🚨🚨");
      console.log("Data received:", data);

      if (data?.status === "success" && data?.data?.result) {
        console.log("✅ CHAT HEAD: SUCCESS - Setting chats:", data.data.result);
        setChats(data.data.result);
        const totalUnread = data.data.result.reduce(
          (sum, chat) => sum + (chat.unread || 0),
          0,
        );
        setUnreadCount(totalUnread);
        console.log(
          "✅ CHAT HEAD: Chats state updated. Count:",
          data.data.result.length,
        );
      } else {
        console.log("❌ CHAT HEAD: Event received but no valid data");
      }
    });

    // Listen for user-specific events
    if (currentUserId) {
      console.log(
        `🚨 CHAT HEAD: Setting up listener for: chatsRetrieved:${currentUserId}`,
      );

      // Listen for user-specific chats retrieved events
      socketInstance.on(`chatsRetrieved:${currentUserId}`, (data) => {
        console.log(
          `🚨🚨🚨 CHAT HEAD: USER-SPECIFIC chatsRetrieved:${currentUserId} EVENT RECEIVED! 🚨🚨🚨`,
        );
        console.log("Data received:", data);

        if (data?.status === "success" && data?.data?.result) {
          console.log(
            "✅ CHAT HEAD: USER-SPECIFIC SUCCESS - Setting chats:",
            data.data.result,
          );
          setChats(data.data.result);
          const totalUnread = data.data.result.reduce(
            (sum, chat) => sum + (chat.unread || 0),
            0,
          );
          setUnreadCount(totalUnread);
          console.log(
            "✅ CHAT HEAD: User-specific chats state updated. Count:",
            data.data.result.length,
          );
        } else {
          console.log(
            "❌ CHAT HEAD: User-specific event received but no valid data",
          );
        }
      });

      // ALSO listen for the customer inbox user ID (backup listener)
      const customerInboxUserId = "7e8ffbff-ecbc-44cb-9cfd-50f9d9fc04e5";
      if (currentUserId !== customerInboxUserId) {
        console.log(
          `🚨 CHAT HEAD: ALSO setting up backup listener for: chatsRetrieved:${customerInboxUserId}`,
        );
        socketInstance.on(`chatsRetrieved:${customerInboxUserId}`, (data) => {
          console.log(
            `🚨🚨🚨 CHAT HEAD: BACKUP chatsRetrieved:${customerInboxUserId} EVENT RECEIVED! 🚨🚨🚨`,
          );
          console.log("Data received:", data);

          if (data?.status === "success" && data?.data?.result) {
            console.log(
              "✅ CHAT HEAD: BACKUP SUCCESS - Setting chats:",
              data.data.result,
            );
            setChats(data.data.result);
            const totalUnread = data.data.result.reduce(
              (sum, chat) => sum + (chat.unread || 0),
              0,
            );
            setUnreadCount(totalUnread);
            console.log(
              "✅ CHAT HEAD: Backup chats state updated. Count:",
              data.data.result.length,
            );
          }
        });
      }

      // Listen for message sent confirmations
      socketInstance.on(`messageSent:${currentUserId}`, (data) => {
        console.log(`=== MESSAGE SENT CONFIRMATION (${currentUserId}) ===`);
        console.log("Data:", data);
        console.log("==================================================");
        toastSuccess(data?.message || "Message sent successfully");
      });

      // DEBUG: Listen for ALL chatsRetrieved events to see what's actually being fired
      const originalEmit = socketInstance.emit;
      const originalOn = socketInstance.on;

      // Override socket.on to log all event listeners
      socketInstance.on = function (event, callback) {
        if (event.includes("chatsRetrieved")) {
          console.log(`🔍 CHAT HEAD: Registering listener for ${event}`);
        }
        return originalOn.call(this, event, function (...args) {
          if (event.includes("chatsRetrieved")) {
            console.log(`🔥 CHAT HEAD: Event fired: ${event}`, args);
          }
          return callback.apply(this, args);
        });
      };
    }

    // Listen for new messages
    socketInstance.on("messageReceived", (data) => {
      if (data?.data) {
        console.log("=== NEW MESSAGE RECEIVED ===");
        console.log("Message data:", data.data);
        console.log("============================");

        // Update unread count
        setUnreadCount((prev) => prev + 1);

        // If chat is selected, add message to current view
        if (selectedChat && data.data.chat_id === selectedChat.id) {
          const newMsg = {
            id: data.data.id,
            text: data.data.message,
            time: new Date(data.data.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
            type: "received",
            sender: data.data.initiator?.name || "User",
          };
          setMessages((prev) => [...prev, newMsg]);
        }

        // Update chats list
        setChats((prevChats) => {
          const updatedChats = prevChats.map((chat) =>
            chat.id === data.data.chat_id
              ? {
                  ...chat,
                  last_message: data.data.message,
                  unread: (chat.unread || 0) + 1,
                }
              : chat,
          );
          return updatedChats;
        });
      }
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [
    adminToken,
    userToken,
    isAdmin,
    currentUserId,
    adminId,
    userId,
    currentUserUrl,
    profileLoading,
    userProfile,
  ]);

  // Fetch chats via Socket.IO on mount - EXACT SAME CONDITIONS AS INBOX
  useEffect(() => {
    console.log("🚨🚨🚨 CHAT HEAD: FETCH CHATS EFFECT RUNNING 🚨🚨🚨");
    console.log("Socket exists:", !!socket);
    console.log("Is connected:", isConnected);
    console.log("Has token:", !!(isAdmin ? adminToken : userToken));
    console.log("Has user ID:", !!currentUserId);
    console.log("Profile loading:", profileLoading);

    // Use EXACT same conditions as customer inbox
    if (isAdmin) {
      // Admin condition
      if (socket && isConnected && adminToken && currentUserId) {
        console.log("🚨🚨🚨 CHAT HEAD ADMIN: EMITTING retrieveChats 🚨🚨🚨");
        socket.emit("retrieveChats", { token: adminToken });
        console.log("🚨 Admin retrieveChats EMITTED");
      }
    } else {
      // Non-admin condition - MATCH INBOX EXACTLY: socket && isConnected && userToken && userId
      if (socket && isConnected && userToken && userId) {
        console.log(
          "🚨🚨🚨 CHAT HEAD USER: EMITTING retrieveChats (EXACT INBOX MATCH) 🚨🚨🚨",
        );
        console.log("User ID:", userId);
        console.log("Socket ID:", socket.id);
        console.log("Token:", userToken?.substring(0, 20) + "...");
        console.log("Using EXACT same format as customer inbox");

        // Use EXACT same emit as customer inbox
        socket.emit("retrieveChats", { token: userToken });
        console.log("🚨 User retrieveChats EMITTED - waiting for response...");
      } else {
        console.log(
          "❌ CHAT HEAD USER: Cannot emit retrieveChats - missing requirements",
        );
        console.log("  - Socket:", !!socket);
        console.log("  - Connected:", isConnected);
        console.log("  - User Token:", !!userToken);
        console.log("  - User ID:", !!userId);
      }
    }
  }, [socket, isConnected, adminToken, userToken, userId, isAdmin]);

  // Fetch users for admin (when creating new chat)
  const fetchUsers = async (role) => {
    if (!isAdmin || !role) return;

    setUsersLoading(true);
    try {
      const res = await CaryBinApi.get(
        `/auth/users/${roleMapping[role]}?pagination[page]=1`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        },
      );
      setUsers(res.data.data || []);
    } catch (e) {
      setUsers([]);
      toastError("Failed to fetch users.");
    }
    setUsersLoading(false);
  };

  // Handle sending message to admin (for non-admin users) via socket
  const handleSendMessageToAdmin = () => {
    if (!selectedAdmin || !messageText.trim()) {
      toastError("Please select an admin and enter a message");
      return;
    }

    if (!socket || !isConnected) {
      console.error("Not connected to messaging service. Please try again.");
      return;
    }

    const messageData = {
      token: userToken,
      chatBuddy: selectedAdmin.id,
      message: messageText.trim(),
    };

    console.log("=== SENDING MESSAGE TO ADMIN VIA SOCKET (CHATHEAD) ===");
    console.log("Socket ID:", socket.id);
    console.log("Message data:", messageData);
    console.log("Socket connected:", socket.connected);
    console.log("User ID:", currentUserId);
    console.log("Admin ID:", selectedAdmin.id);
    console.log("=========================================");

    socket.emit("sendMessage", messageData);

    // Update existing chat or create new one in local state
    if (selectedAdmin) {
      console.log("=== UPDATING CHAT LIST AFTER MESSAGE (CHATHEAD) ===");
      console.log("Admin ID:", selectedAdmin.id);
      console.log("Current chats count:", chats.length);

      setChats((prevChats) => {
        // Check if chat with this admin already exists
        const existingChatIndex = prevChats.findIndex(
          (chat) => chat.chat_buddy?.id === selectedAdmin.id,
        );

        console.log("Existing chat index:", existingChatIndex);

        if (existingChatIndex !== -1) {
          // Update existing chat
          console.log("📝 Updating existing chat with admin (ChatHead)");
          const updatedChats = [...prevChats];
          updatedChats[existingChatIndex] = {
            ...updatedChats[existingChatIndex],
            last_message: messageText.trim(),
            created_at: new Date().toISOString(),
            unread: 0,
          };
          // Move updated chat to top
          const updatedChat = updatedChats.splice(existingChatIndex, 1)[0];
          console.log("✅ Chat updated and moved to top (ChatHead)");
          return [updatedChat, ...updatedChats];
        } else {
          // Create new chat entry
          console.log("➕ Creating new chat with admin (ChatHead)");
          const newChat = {
            id: Date.now(),
            last_message: messageText.trim(),
            chat_buddy: selectedAdmin,
            created_at: new Date().toISOString(),
            unread: 0,
          };
          console.log("✅ New chat created (ChatHead)");
          return [newChat, ...prevChats];
        }
      });

      console.log("========================================");
    }

    toastSuccess("Message sent successfully!");
    setSelectedAdmin(null);
    setMessageText("");
    setCurrentView("chats");

    // Refresh chats with a delay to prevent duplicates
    setTimeout(() => {
      if (socket && currentUserId) {
        console.log(
          "🔄 Refreshing chats after delay to sync with server (ChatHead)",
        );
        socket.emit("getChats", { userId: currentUserId });
      }
    }, 1000);
  };

  // Send message
  const sendMessage = () => {
    if (!newMessage.trim() || !selectedChat || !socket) return;

    console.log("=== SENDING MESSAGE ===");
    console.log("User type:", currentUserUrl);
    console.log("User ID:", currentUserId);
    console.log("Selected chat:", selectedChat);
    console.log("Message:", newMessage.trim());
    console.log("======================");

    const messageData = {
      token: isAdmin ? adminToken : userToken,
      chatBuddy: selectedChat.chat_buddy?.id || selectedChat.id,
      message: newMessage.trim(),
    };

    socket.emit("sendMessage", messageData);

    // Add message to local state
    const newMsg = {
      id: Date.now(),
      text: newMessage.trim(),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      type: "sent",
      sender: "You",
    };

    setMessages((prev) => [...prev, newMsg]);
    setNewMessage("");
  };

  // Send new message (admin)
  const sendNewMessage = () => {
    if (!messageText.trim() || !selectedUser || !socket) return;

    const messageData = {
      token: adminToken,
      chatBuddy: selectedUser.id,
      message: messageText.trim(),
    };

    socket.emit("sendMessage", messageData);

    setMessageText("");
    setCurrentView("chats");
    setUserType("");
    setSelectedUser(null);
    setUsers([]);
    toastSuccess("Message sent successfully!");
  };

  // Select chat and fetch messages
  const selectChat = (chat) => {
    console.log("=== SELECTING CHAT ===");
    console.log("Chat:", chat);
    console.log("User type:", currentUserUrl);
    console.log("User ID:", currentUserId);
    console.log("======================");

    setSelectedChat(chat);
    setCurrentView("chat");

    if (socket) {
      socket.emit("retrieveMessages", {
        token: isAdmin ? adminToken : userToken,
        chatBuddy: chat.chat_buddy?.id || chat.id,
      });
    }

    // Listen for messages for this chat - match fabric vendor implementation
    if (socket && currentUserId) {
      // Remove existing listeners to avoid duplicates
      socket.off("messagesRetrieved");
      socket.off(`messagesRetrieved:${currentUserId}`);

      // Listen for general messages retrieved events (like fabric vendor)
      socket.on("messagesRetrieved", (data) => {
        console.log("=== MESSAGES RETRIEVED (GENERAL) ===");
        console.log("User type:", currentUserUrl);
        console.log("Data:", data);
        console.log("====================================");

        if (data?.status === "success" && data?.data?.result) {
          const formattedMessages = data.data.result.map((msg) => ({
            id: msg.id,
            text: msg.message,
            time: new Date(msg.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
            timestamp: msg.created_at,
            type:
              msg.initiator_id === chat.chat_buddy?.id ? "received" : "sent",
            sender: msg.initiator?.name || "User",
            read: msg.read,
          }));

          // Sort messages by timestamp (oldest first)
          const sortedMessages = formattedMessages.sort(
            (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
          );
          setMessages(sortedMessages);
        }
      });

      // Also listen for user-specific event
      socket.on(`messagesRetrieved:${currentUserId}`, (data) => {
        console.log(
          `=== USER-SPECIFIC MESSAGES RETRIEVED (${currentUserId}) ===`,
        );
        console.log("User type:", currentUserUrl);
        console.log("Data:", data);
        console.log(
          "=========================================================",
        );

        if (data?.status === "success" && data?.data?.result) {
          const formattedMessages = data.data.result.map((msg) => ({
            id: msg.id,
            text: msg.message,
            time: new Date(msg.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
            timestamp: msg.created_at,
            type:
              msg.initiator_id === chat.chat_buddy?.id ? "received" : "sent",
            sender: msg.initiator?.name || "User",
            read: msg.read,
          }));

          // Sort messages by timestamp (oldest first)
          const sortedMessages = formattedMessages.sort(
            (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
          );
          setMessages(sortedMessages);
        }
      });
    }
  };

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Debug logging for render conditions
  console.log("=== CHAT HEAD RENDER CONDITIONS ===");
  console.log("Current token:", !!(isAdmin ? adminToken : userToken));
  console.log("Profile loading:", profileLoading);
  console.log("Current user URL:", currentUserUrl);
  console.log("Is admin:", isAdmin);
  console.log("Admin ID:", adminId);
  console.log("User ID:", userId);
  console.log("===================================");

  // Don't render for non-authenticated users
  console.log("🟣🟣🟣 CHAT HEAD: RENDER CHECK 🟣🟣🟣");
  console.log("Has token:", !!(isAdmin ? adminToken : userToken));
  console.log("Profile loading:", profileLoading);
  console.log("User type:", currentUserUrl);

  // Don't render for non-authenticated users or if profile is still loading
  if (!(isAdmin ? adminToken : userToken)) {
    console.log("❌ Chat head not rendering: No token");
    console.log("  - Admin token:", !!adminToken);
    console.log("  - User token:", !!userToken);
    console.log("  - Is admin:", isAdmin);
    return null;
  }

  // Check specific render conditions with detailed logging
  console.log("🔍 Checking render conditions:");
  console.log("- Is admin:", isAdmin);
  console.log("- Profile loading:", profileLoading);
  console.log("- User ID:", userId);
  console.log("- Current user URL:", currentUserUrl);

  // For non-admin users, wait for profile loading to complete
  if (!isAdmin && profileLoading) {
    console.log(
      "❌ Chat head not rendering: Profile still loading (non-admin)",
    );
    return null;
  }

  if (!isAdmin && !userId) {
    console.log("❌ Chat head not rendering: No user ID (non-admin)");
    return null;
  }

  // For admin users, show chat head even without full profile
  // The profile will load in the background

  // Don't render for users who don't have a valid user type
  // For admin users, allow rendering even without currUserUrl
  if (
    !isAdmin &&
    (!currentUserUrl ||
      ![
        "admin",
        "super-admin",
        "customer",
        "tailor",
        "fabric",
        "logistics",
        "sales",
      ].includes(currentUserUrl))
  ) {
    console.log("❌ Chat head not rendering: Invalid user type");
    console.log("- Current user URL:", currentUserUrl);
    console.log("- Valid types:", [
      "admin",
      "super-admin",
      "customer",
      "tailor",
      "fabric",
      "logistics",
      "sales",
    ]);
    return null;
  }

  console.log("✅ Chat head render conditions passed - should render now!");

  return (
    <>
      {/* Chat Head Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="relative bg-purple-600 hover:bg-purple-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110"
          >
            <MessageCircle size={24} />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-semibold">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
        )}

        {/* Chat Window */}
        {isOpen && (
          <div
            className={`bg-white rounded-lg shadow-2xl border-gray-200 border transition-all duration-300 ${
              isMinimized ? "w-80 h-12" : "w-80 h-[440px]"
            }`}
          >
            {/* Header */}
            <div className="bg-purple-600 text-white p-3 rounded-t-lg flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageCircle size={20} />
                <span className="font-medium">
                  {currentView === "chat" && selectedChat
                    ? selectedChat.chat_buddy?.name
                    : currentView === "newChat"
                      ? "New Message"
                      : `Messages (${isAdmin ? "Admin" : userTypeDisplay[currentUserUrl] || currentUserUrl || "User"})`}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  {isMinimized ? "▲" : "▼"}
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsMinimized(false);
                    setCurrentView("chats");
                    setSelectedChat(null);
                  }}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <div className="flex flex-col h-[400px]">
                {/* Chat List View */}
                {currentView === "chats" && (
                  <>
                    <div className="p-3 border-b border-gray-200 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          Recent Chats
                        </span>
                        <button
                          onClick={() => {
                            console.log(
                              "🎯🎯🎯 MESSAGE ADMIN BUTTON CLICKED 🎯🎯🎯",
                            );
                            console.log(
                              "🎯 COMPLETE RAW RESPONSE AT CLICK:",
                              rawResponse,
                            );
                            console.log(
                              "🎯 RAW RESPONSE STRINGIFIED AT CLICK:",
                              JSON.stringify(rawResponse, null, 2),
                            );
                            console.log(
                              "🎯 AVAILABLE ADMINS AT CLICK:",
                              availableAdmins,
                            );
                            console.log(
                              "🎯 ADMINS LOADING STATE:",
                              adminsFetching,
                            );
                            console.log(
                              "🎯 ADMINS ERROR STATE:",
                              adminsFetchError,
                            );
                            console.log(
                              "🎯 TOTAL ADMIN COUNT:",
                              availableAdmins?.length || 0,
                            );
                            console.log("🎯🎯🎯 END BUTTON CLICK LOG 🎯🎯🎯");
                            setCurrentView("newChat");
                          }}
                          className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                        >
                          {isAdmin ? "New Message" : "Message Admin"}
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      {chats.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">
                          {isAdmin
                            ? "No conversations yet. Start a new chat!"
                            : "No messages yet. Admins will message you here."}
                        </div>
                      ) : (
                        chats.map((chat) => (
                          <div
                            key={chat.id}
                            onClick={() => selectChat(chat)}
                            className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center">
                                <User size={16} className="text-purple-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {chat.chat_buddy?.name || "Unknown User"}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {chat.last_message || "No messages yet"}
                                </p>
                              </div>
                              {chat.unread > 0 && (
                                <span className="bg-purple-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                  {chat.unread}
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}

                {/* New Chat View */}
                {currentView === "newChat" && (
                  <>
                    <div className="p-3 border-b border-gray-200 bg-gray-50">
                      <button
                        onClick={() => setCurrentView("chats")}
                        className="text-purple-600 hover:text-purple-700 text-sm"
                      >
                        ← Back to chats
                      </button>
                    </div>
                    <div className="flex-1 flex flex-col">
                      <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                        {isAdmin ? (
                          <>
                            {/* Admin view - select user type and user */}
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                User Type
                              </label>
                              <select
                                value={userType}
                                onChange={(e) => {
                                  setUserType(e.target.value);
                                  if (e.target.value) {
                                    fetchUsers(e.target.value);
                                  }
                                }}
                                className="w-full p-2 border border-gray-300 rounded text-sm"
                              >
                                <option value="">Select user type</option>
                                <option value="Customer">Customer</option>
                                <option value="Tailor">Tailor</option>
                                <option value="Fabric">Fabric Vendor</option>
                                <option value="Market Rep">Market Rep</option>
                                <option value="Logistics">Logistics</option>
                              </select>
                            </div>

                            {userType && (
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Select User
                                </label>
                                <div className="max-h-20 overflow-y-auto border border-gray-300 rounded">
                                  {usersLoading ? (
                                    <div className="p-2 text-center text-xs text-gray-500">
                                      Loading...
                                    </div>
                                  ) : users.length === 0 ? (
                                    <div className="p-2 text-center text-xs text-gray-500">
                                      No users found
                                    </div>
                                  ) : (
                                    users.map((user) => (
                                      <div
                                        key={user.id}
                                        onClick={() => setSelectedUser(user)}
                                        className={`p-2 text-xs cursor-pointer hover:bg-gray-50 flex items-center justify-between ${
                                          selectedUser?.id === user.id
                                            ? "bg-purple-50 border-l-2 border-purple-500"
                                            : ""
                                        }`}
                                      >
                                        <div className="flex-1">
                                          <div className="font-medium">
                                            {user.name || "No Name"}
                                          </div>
                                          <div className="text-gray-500">
                                            {user.email}
                                          </div>
                                        </div>
                                        {selectedUser?.id === user.id && (
                                          <div className="text-purple-600 ml-2">
                                            ✓
                                          </div>
                                        )}
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>
                            )}

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Message
                              </label>
                              <textarea
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                placeholder="Type your message..."
                                className="w-full p-2 border border-gray-300 rounded text-sm resize-none"
                                rows={2}
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Non-admin view - select admin to message */}
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Select Admin
                              </label>
                              <div className="max-h-24 overflow-y-auto border border-gray-300 rounded">
                                {adminsFetching ? (
                                  <div className="p-2 text-center text-xs text-gray-500">
                                    Loading admins...
                                  </div>
                                ) : adminsFetchError ? (
                                  <div className="p-2 text-center text-xs text-red-500">
                                    Failed to load admins
                                  </div>
                                ) : availableAdmins.length === 0 ? (
                                  <div className="p-2 text-center text-xs text-gray-500">
                                    No admins available
                                  </div>
                                ) : (
                                  availableAdmins.map((admin) => (
                                    <div
                                      key={admin.id}
                                      onClick={() => setSelectedAdmin(admin)}
                                      className={`p-2 text-xs cursor-pointer hover:bg-gray-50 flex items-center justify-between ${
                                        selectedAdmin?.id === admin.id
                                          ? "bg-purple-50 border-l-2 border-purple-500"
                                          : ""
                                      }`}
                                    >
                                      <div className="flex-1">
                                        <div className="font-medium">
                                          {admin.name || "No Name"}
                                        </div>
                                        <div className="text-gray-500">
                                          {admin.email}
                                        </div>
                                      </div>
                                      {selectedAdmin?.id === admin.id && (
                                        <div className="text-purple-600 ml-2">
                                          ✓
                                        </div>
                                      )}
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Message
                              </label>
                              <textarea
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                placeholder="Type your message to admin..."
                                className="w-full p-2 border border-gray-300 rounded text-sm resize-none"
                                rows={2}
                              />
                            </div>
                          </>
                        )}
                      </div>

                      {/* Send Button - Fixed at bottom */}
                      <div className="p-3 border-t border-gray-200 bg-gray-50">
                        <button
                          onClick={
                            isAdmin ? sendNewMessage : handleSendMessageToAdmin
                          }
                          disabled={
                            isAdmin
                              ? !selectedUser || !messageText.trim()
                              : !selectedAdmin ||
                                !messageText.trim() ||
                                !isConnected
                          }
                          className="w-full bg-purple-600 text-white p-2 rounded text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {!isConnected ? "Connecting..." : "Send Message"}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* Individual Chat View */}
                {currentView === "chat" && selectedChat && (
                  <>
                    <div className="p-3 border-b border-gray-200 bg-gray-50">
                      <button
                        onClick={() => {
                          setCurrentView("chats");
                          setSelectedChat(null);
                          setMessages([]);
                        }}
                        className="text-purple-600 hover:text-purple-700 text-sm"
                      >
                        ← Back to chats
                      </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                      {messages.length === 0 ? (
                        <div className="text-center text-gray-500 text-sm py-4">
                          No messages yet. Start the conversation!
                        </div>
                      ) : (
                        messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.type === "sent" ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[80%] p-2 rounded-lg text-sm ${
                                message.type === "sent"
                                  ? "bg-purple-600 text-white rounded-br-sm"
                                  : "bg-gray-200 text-gray-800 rounded-bl-sm"
                              }`}
                            >
                              <p>{message.text}</p>
                              <span
                                className={`block text-xs mt-1 ${
                                  message.type === "sent"
                                    ? "text-purple-200"
                                    : "text-gray-500"
                                }`}
                              >
                                {message.time}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                    {/* one more*/}

                    {/* Message Input */}
                    <div className="p-3 border-t border-gray-200 bg-gray-50">
                      <div className="relative">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                          placeholder="Type a message..."
                          className="w-full p-2 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                        />
                        <button
                          onClick={sendMessage}
                          disabled={!newMessage.trim()}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Send size={14} />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default ChatHead;
