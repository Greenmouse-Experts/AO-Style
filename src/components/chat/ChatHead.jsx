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
  // Authentication check - hide ChatHead if user is not logged in
  const adminToken = Cookies.get("adminToken");
  const userToken = Cookies.get("token");
  const currentUserUrl = Cookies.get("currUserUrl");

  // If no tokens are present, don't render the chat head
  if (!adminToken && !userToken) {
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

  const [position, setPosition] = useState({ x: 24, y: 24 }); // 24px from right and bottom
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Fetch admins for non-admin users
  const {
    data: availableAdmins,
    isPending: adminsFetching,
    isError: adminsFetchError,
    rawResponse,
  } = useGetAdmins();

  // Console log the complete admin data for debugging
  useEffect(() => {
    // Removed all console logs
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

  const handleMouseDown = (e) => {
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const newX =
      window.innerWidth - (e.clientX - dragOffset.x) - (isOpen ? 320 : 56); // 320px is chat width, 56px is button width
    const newY =
      window.innerHeight - (e.clientY - dragOffset.y) - (isOpen ? 440 : 56); // 440px is chat height, 56px is button height

    // Keep within bounds
    const boundedX = Math.max(
      24,
      Math.min(newX, window.innerWidth - (isOpen ? 320 : 56) - 24),
    );
    const boundedY = Math.max(
      24,
      Math.min(newY, window.innerHeight - (isOpen ? 440 : 56) - 24),
    );

    setPosition({ x: boundedX, y: boundedY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);
  // Handle admin profile fetching
  useEffect(() => {
    const fetchAdminProfile = async () => {
      if (!adminToken) {
        setProfileLoading(false);
        return;
      }

      try {
        const response = await AuthService.GetUser();

        if (response.data?.statusCode === 200 && response.data?.data) {
          setAdminProfile(response.data.data);
        }
      } catch (error) {
        // Removed console.error
      } finally {
        setProfileLoading(false);
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
        // Set profile state like inbox does - THIS IS THE KEY FIX!
        setUserProfile(profileData);
        setProfileLoading(false);
      } else if (profileError) {
        setProfileLoading(false);
      } else if (profilePending) {
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
    // Removed all console logs

    // Don't connect if not authenticated - check both tokens like inbox
    if (!(isAdmin ? adminToken : userToken)) {
      return;
    }

    // Wait for profile to be loaded before initializing socket (like fabric vendor)
    // Use EXACT same condition as inbox: userToken && userId && !profileLoading
    if (!isAdmin && (!userToken || !userId || profileLoading)) {
      return;
    }

    // For admin users, wait for profile loading to complete
    if (isAdmin && profileLoading) {
      return;
    }

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
      setIsConnected(true);
      setSocket(socketInstance);
      // Connection established - no toast needed
    });

    socketInstance.on("disconnect", (reason) => {
      setIsConnected(false);
    });

    // Listen for chats retrieved events - both general and user-specific
    socketInstance.on("chatsRetrieved", (data) => {
      if (data?.status === "success" && data?.data?.result) {
        setChats(data.data.result);

        // Update selectedChat if it still exists in the refreshed list
        setSelectedChat((prevSelectedChat) => {
          if (prevSelectedChat) {
            const updatedChat = data.data.result.find(
              (chat) =>
                chat.id === prevSelectedChat.id ||
                chat.chat_buddy?.id === prevSelectedChat.chat_buddy?.id,
            );
            return updatedChat || prevSelectedChat;
          }
          return prevSelectedChat;
        });

        // Check for pending chat selection from recentChatRetrieved
        if (socketInstance.pendingChatSelection) {
          const { chatId, chatBuddyId } = socketInstance.pendingChatSelection;
          const chatToSelect = data.data.result.find(
            (chat) => chat.id === chatId || chat.chat_buddy?.id === chatBuddyId,
          );

          if (chatToSelect) {
            console.log(
              "🎯 Chat Head: Auto-selecting chat from recent update:",
              chatToSelect,
            );
            setSelectedChat(chatToSelect);

            // Fetch messages for the selected chat
            if (chatToSelect.chat_buddy?.id) {
              socketInstance.emit("retrieveMessages", {
                token: userToken || adminToken,
                chatBuddy: chatToSelect.chat_buddy.id,
              });
            }
          }

          // Clear the pending selection
          delete socketInstance.pendingChatSelection;
        }

        // Calculate total unread count from server data (most accurate)
        const totalUnread = data.data.result.reduce(
          (sum, chat) => sum + (chat.unread || 0),
          0,
        );
        setUnreadCount(totalUnread);
      }
    });

    // Listen for user-specific events
    if (currentUserId) {
      // Listen for user-specific chats retrieved events
      socketInstance.on(`chatsRetrieved:${currentUserId}`, (data) => {
        if (data?.status === "success" && data?.data?.result) {
          setChats(data.data.result);

          // Update selectedChat if it still exists in the refreshed list
          setSelectedChat((prevSelectedChat) => {
            if (prevSelectedChat) {
              const updatedChat = data.data.result.find(
                (chat) =>
                  chat.id === prevSelectedChat.id ||
                  chat.chat_buddy?.id === prevSelectedChat.chat_buddy?.id,
              );
              return updatedChat || prevSelectedChat;
            }
            return prevSelectedChat;
          });

          // Check for pending chat selection from recentChatRetrieved
          if (socketInstance.pendingChatSelection) {
            const { chatId, chatBuddyId } = socketInstance.pendingChatSelection;
            const chatToSelect = data.data.result.find(
              (chat) =>
                chat.id === chatId || chat.chat_buddy?.id === chatBuddyId,
            );

            if (chatToSelect) {
              console.log(
                "🎯 Chat Head: Auto-selecting chat from user-specific update:",
                chatToSelect,
              );
              setSelectedChat(chatToSelect);

              // Fetch messages for the selected chat
              if (chatToSelect.chat_buddy?.id) {
                socketInstance.emit("retrieveMessages", {
                  token: userToken || adminToken,
                  chatBuddy: chatToSelect.chat_buddy.id,
                });
              }
            }

            // Clear the pending selection
            delete socketInstance.pendingChatSelection;
          }

          // Calculate total unread count from server data (most accurate)
          const totalUnread = data.data.result.reduce(
            (sum, chat) => sum + (chat.unread || 0),
            0,
          );
          setUnreadCount(totalUnread);
        }
      });

      // ALSO listen for the customer inbox user ID (backup listener)
      const customerInboxUserId = "7e8ffbff-ecbc-44cb-9cfd-50f9d9fc04e5";
      if (currentUserId !== customerInboxUserId) {
        socketInstance.on(`chatsRetrieved:${customerInboxUserId}`, (data) => {
          if (data?.status === "success" && data?.data?.result) {
            setChats(data.data.result);
            console.log(chats);
            const totalUnread = data.data.result.reduce(
              (sum, chat) => sum + (chat.unread || 0),
              0,
            );
            setUnreadCount(totalUnread);
          }
        });
      }

      // Listen for message sent confirmations
      socketInstance.on(`messageSent:${currentUserId}`, (data) => {
        toastSuccess(data?.message || "Message sent successfully");
      });

      // Listen for user-specific admin responses - this is the key missing piece
      socketInstance.on(`recentChatRetrieved:${currentUserId}`, (data) => {
        console.log(
          `=== CHAT HEAD: ADMIN RESPONSE RECEIVED (${currentUserId}) ===`,
        );
        console.log("Chat data:", JSON.stringify(data, null, 2));
        console.log(
          "=========================================================",
        );

        if (data?.data) {
          // Trigger full chat refresh to get updated chat list
          console.log(
            "🔄 Chat Head: Triggering chat refresh after admin response (user-specific)",
          );
          socketInstance.emit("retrieveChats", {
            token: userToken || adminToken,
          });

          // Store the chat info to select after chats are loaded
          const newChatId = data.data.id;
          const newChatBuddyId = data.data.chat_buddy?.id;

          // Set a flag to select this chat when chats are refreshed
          socketInstance.pendingChatSelection = {
            chatId: newChatId,
            chatBuddyId: newChatBuddyId,
          };

          // Update unread count immediately
          setUnreadCount((prev) => prev + 1);
        }
      });

      // Listen for admin messages sent to this user
      socketInstance.on(`messageToAdminSent:${currentUserId}`, (data) => {
        console.log(
          `=== CHAT HEAD: MESSAGE TO ADMIN SENT (${currentUserId}) ===`,
        );
        console.log("Message data:", data);
        toastSuccess(data?.message || "Message delivered successfully");
      });

      // Listen for user-specific messages retrieved (when chat is selected)
      socketInstance.on(`messagesRetrieved:${currentUserId}`, (data) => {
        console.log(
          `=== CHAT HEAD: USER-SPECIFIC MESSAGES RETRIEVED (${currentUserId}) ===`,
        );
        if (data?.status === "success" && data?.data?.result) {
          console.log("🔧 DEBUG - Selected chat:", selectedChat);
          console.log(
            "🔧 DEBUG - Chat buddy ID:",
            selectedChat?.chat_buddy?.id,
          );
          console.log("🔧 DEBUG - Current user ID:", currentUserId);
          console.log("🔧 DEBUG - Messages data:", data.data.result);

          const formattedMessages = data.data.result.map((msg) => {
            const messageType =
              msg.initiator_id === currentUserId ? "sent" : "received";
            console.log(
              `🔧 DEBUG - Message ${msg.id}: initiator_id=${msg.initiator_id}, currentUserId=${currentUserId}, type=${messageType}`,
            );

            return {
              id: msg.id,
              text: msg.message,
              time: new Date(msg.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              }),
              type: messageType,
              sender: msg.initiator?.name || "User",
            };
          });
          setMessages(formattedMessages);
          
          // Ensure unread count is updated when messages are viewed
          // Use functional update to get current state
          setChats((prevChats) => {
            const currentSelectedChat = prevChats.find((chat) => 
              selectedChat && (chat.id === selectedChat.id || chat.chat_buddy?.id === selectedChat.chat_buddy?.id)
            );
            
            if (currentSelectedChat && currentSelectedChat.unread > 0) {
              const unreadToSubtract = currentSelectedChat.unread;
              setUnreadCount((prev) => Math.max(0, prev - unreadToSubtract));
              
              return prevChats.map((chat) =>
                chat.id === currentSelectedChat.id ? { ...chat, unread: 0 } : chat
              );
            }
            return prevChats;
          });
        }
      });

      // DEBUG: Listen for ALL chatsRetrieved events to see what's actually being fired
      const originalEmit = socketInstance.emit;
      const originalOn = socketInstance.on;

      // Override socket.on to log all event listeners
      socketInstance.on = function (event, callback) {
        return originalOn.call(this, event, function (...args) {
          return callback.apply(this, args);
        });
      };
    }

    // Listen for new messages - general messageReceived
    socketInstance.on("messageReceived", (data) => {
      console.log("=== CHAT HEAD: MESSAGE RECEIVED (GENERAL) ===");
      console.log("Message data:", data);
      if (data?.data) {
        const isCurrentlyViewing = selectedChat && data.data.chat_id === selectedChat.id;
        
        // Only update unread count if user is NOT currently viewing this chat
        if (!isCurrentlyViewing) {
          setUnreadCount((prev) => prev + 1);
        }

        // If chat is selected, add message to current view
        if (isCurrentlyViewing) {
          const newMsg = {
            id: data.data.id,
            text: data.data.message,
            time: new Date(data.data.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
            type:
              data.data.initiator_id === currentUserId ? "sent" : "received",
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
                  // Don't increment unread if user is currently viewing this chat
                  unread: isCurrentlyViewing ? 0 : (chat.unread || 0) + 1,
                }
              : chat,
          );
          return updatedChats;
        });
      }
    });

    // Listen for general recentChatRetrieved (admin responses)
    socketInstance.on("recentChatRetrieved", (data) => {
      console.log("=== CHAT HEAD: RECENT CHAT RETRIEVED (GENERAL) ===");
      console.log("Chat data:", JSON.stringify(data, null, 2));

      if (data?.data) {
        // Trigger full chat refresh
        console.log(
          "🔄 Chat Head: Triggering chat refresh after admin response (general)",
        );
        socketInstance.emit("retrieveChats", {
          token: userToken || adminToken,
        });

        // Store the chat info to select after chats are loaded
        const newChatId = data.data.id;
        const newChatBuddyId = data.data.chat_buddy?.id;

        socketInstance.pendingChatSelection = {
          chatId: newChatId,
          chatBuddyId: newChatBuddyId,
        };

        // Update unread count immediately
        setUnreadCount((prev) => prev + 1);
      }
    });

    // Listen for general messages retrieved (when selecting a chat)
    socketInstance.on("messagesRetrieved", (data) => {
      console.log("=== CHAT HEAD: MESSAGES RETRIEVED (GENERAL) ===");
      console.log("Messages data:", data);
      if (data?.status === "success" && data?.data?.result) {
        console.log("🔧 DEBUG - Socket message data:", data.data.result);

        const formattedMessages = data.data.result.map((msg) => {
          const messageType =
            msg.initiator_id === currentUserId ? "sent" : "received";
          console.log(
            `🔧 DEBUG - Socket Message ${msg.id}: initiator_id=${msg.initiator_id}, currentUserId=${currentUserId}, type=${messageType}`,
          );

          return {
            id: msg.id,
            text: msg.message,
            time: new Date(msg.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
            timestamp: msg.created_at,
            type: messageType,
            sender: msg.initiator?.name || "User",
            read: msg.read,
          };
        });

        // Sort messages by timestamp (oldest first)
        const sortedMessages = formattedMessages.sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
        );
        setMessages(sortedMessages);
        
        // Ensure unread count is updated when messages are viewed
        // Use functional update to get current state
        setChats((prevChats) => {
          const currentSelectedChat = prevChats.find((chat) => 
            selectedChat && (chat.id === selectedChat.id || chat.chat_buddy?.id === selectedChat.chat_buddy?.id)
          );
          
          if (currentSelectedChat && currentSelectedChat.unread > 0) {
            const unreadToSubtract = currentSelectedChat.unread;
            setUnreadCount((prev) => Math.max(0, prev - unreadToSubtract));
            
            return prevChats.map((chat) =>
              chat.id === currentSelectedChat.id ? { ...chat, unread: 0 } : chat
            );
          }
          return prevChats;
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
    // Removed all console logs

    // Use EXACT same conditions as customer inbox
    if (isAdmin) {
      // Admin condition
      if (socket && isConnected && adminToken && currentUserId) {
        socket.emit("retrieveChats", { token: adminToken });
      }
    } else {
      // Non-admin condition - MATCH INBOX EXACTLY: socket && isConnected && userToken && userId
      if (socket && isConnected && userToken && userId) {
        // Use EXACT same emit as customer inbox
        socket.emit("retrieveChats", { token: userToken });
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
    if (!messageText.trim()) {
      toastError("Please select an admin and enter a message");
      return;
    }

    if (!socket || !isConnected) {
      return;
    }
    console.log("this is the currnt user type", currentUserUrl);
    const messageData = {
      token: userToken,
      initiator_id: currentUserId,
      target_role:
        currentUserUrl === "customer"
          ? "user"
          : currentUserUrl === "fabric"
            ? "fabric-vendor"
            : currentUserUrl === "tailor"
              ? "fashion-designer"
              : currentUserUrl === "logistics"
                ? "logistics-agent"
                : currentUserUrl === "sales"
                  ? "market-representative"
                  : "user",
      message: messageText.trim(),
    };

    socket.emit("sendMessageToAdmin", messageData);

    toastSuccess("Message sent successfully!");
    // setSelectedAdmin(null);
    setMessageText("");
    setCurrentView("chats");

    // Refresh chats with a delay to prevent duplicates
    setTimeout(() => {
      if (socket && currentUserId) {
        socket.emit("getChats", { userId: currentUserId });
      }
    }, 1000);
  };

  // Send message
  const sendMessage = () => {
    if (!newMessage.trim() || !selectedChat || !socket) return;

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

    // Refresh chats list after sending to get updated unread counts from server
    setTimeout(() => {
      if (socket && (userToken || adminToken)) {
        socket.emit("retrieveChats", {
          token: isAdmin ? adminToken : userToken,
        });
      }
    }, 500);
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
    setSelectedChat(chat);
    setCurrentView("chat");

    // Clear messages first
    setMessages([]);

    // Immediately update unread count when viewing a chat
    const chatUnreadCount = chat.unread || 0;
    if (chatUnreadCount > 0) {
      // Update the unread count by subtracting this chat's unread count
      setUnreadCount((prev) => Math.max(0, prev - chatUnreadCount));
      
      // Update the chats array to mark this chat as read (0 unread)
      setChats((prevChats) =>
        prevChats.map((c) =>
          c.id === chat.id ? { ...c, unread: 0 } : c
        )
      );
    }

    // Emit retrieveMessages - match inbox pattern exactly
    if (socket && (userToken || adminToken)) {
      console.log("=== CHAT HEAD: Fetching messages for chat ===");
      console.log("Chat:", chat);
      console.log("Chat buddy ID:", chat.chat_buddy?.id);

      socket.emit("retrieveMessages", {
        token: isAdmin ? adminToken : userToken,
        chatBuddy: chat.chat_buddy?.id || chat.id,
      });
    }

    // The message listeners are already set up in the socket initialization
    // No need to add duplicate listeners here - they're handled globally
  };

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Debug logging for render conditions
  // Removed all console logs

  // Don't render for non-authenticated users or if profile is still loading
  if (!(isAdmin ? adminToken : userToken)) {
    return null;
  }

  // For non-admin users, wait for profile loading to complete
  if (!isAdmin && profileLoading) {
    return null;
  }

  if (!isAdmin && !userId) {
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
    return null;
  }

  return (
    <>
      {/* Chat Head Button */}
      <div
        className="fixed z-50 select-none"
        style={{
          right: `${position.x}px`,
          bottom: `${position.y}px`,
          cursor: isDragging ? "grabbing" : "grab",
        }}
      >
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            onMouseDown={handleMouseDown}
            className="relative bg-purple-600 hover:bg-purple-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110"
            style={{ cursor: isDragging ? "grabbing" : "grab" }}
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
            <div
              className="bg-purple-600 text-white p-3 rounded-t-lg flex items-center justify-between cursor-grab active:cursor-grabbing"
              onMouseDown={handleMouseDown}
            >
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
                            setCurrentView("newChat");
                          }}
                          className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                        >
                          {isAdmin &&
                          adminProfile?.role?.role_id ===
                            "owner-super-administrator"
                            ? "New Message"
                            : !isAdmin
                              ? "Message Admin"
                              : ""}
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      {chats.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">
                          {isAdmin
                            ? "No conversations yet. Start a new chat!"
                            : "No Chats here yet, You will see chats when an admin respond to your message. "}
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
                                Message
                              </label>
                              <textarea
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                placeholder="Send message to admins..."
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
                              : !messageText.trim() || !isConnected
                          }
                          className="cursor-pointer w-full bg-purple-600 text-white p-2 rounded text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
