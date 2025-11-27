import { useEffect, useRef, useState } from "react";
import { Plus, Mail, ChevronRight, Info, Menu, X } from "lucide-react";
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
import { customerRoutes } from "../../../../routes/customerRoutes";

// Role mapping for the API
const roleMapping = {
  Customer: "user",
  Tailor: "fashion-designer",
  Fabric: "fabric-vendor",
  "Market Rep": "market-representative",
  Logistics: "logistics-agent",
};

export default function ImprovedInboxPage() {
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
  const [selectedUser, setSelectedUser] = useState("");
  const [userListSelected, setUserListSelected] = useState("");
  const [messageText, setMessageText] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [chats, setChats] = useState([]);
  const [chatId, setChatId] = useState(null);

  // Admin profile state
  const [adminProfile, setAdminProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Role-based state
  const [roleConversations, setRoleConversations] = useState([]);
  const [roleSidebarLoading, setRoleSidebarLoading] = useState(false);
  const [roleCounts, setRoleCounts] = useState({});

  const dropdownRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const selectedChatRef = useRef(selectedChat);
  const adminToken = Cookies.get("adminToken");
  const adminId = adminProfile?.id || null;
  const { toastError, toastSuccess } = useToast();

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userPage, setUserPage] = useState(1);
  const usersPerPage = 10;
  const [totalUsers, setTotalUsers] = useState(0);

  const [currentView, setCurrentView] = useState("all");
  const totalPages = Math.ceil(totalUsers / usersPerPage);
  const [currentSelectedChatTwo, setCurrentSelectedChatTwo] = useState("");
  const [selectedRoleTab, setSelectedRoleTab] = useState("");

  const [currentSelectedChatMessages, setCurrentSelectedChatMessages] =
    useState();

  // NEW: Mobile role selector dropdown state
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const getRoleNameFromCode = (code) => {
    const map = {
      user: "Customer",
      "fashion-designer": "Tailor",
      "fabric-vendor": "Fabric",
      "market-representative": "Market Rep",
      "logistics-agent": "Logistics",
    };
    return map[code] || null;
  };

  const getUserAdminRole = () => {
    if (!adminProfile?.admin_role?.role) return [];

    const roleMap = {
      user: "Customer",
      "logistics-agent": "Logistics",
      "fashion-designer": "Tailor",
      "fabric-vendor": "Fabric",
      "market-representative": "Market Rep",
    };

    return adminProfile.admin_role.role
      .map((roleId) => roleMap[roleId])
      .filter(Boolean);
  };

  const getUserAdminTypeCode = () => {
    if (!adminProfile?.admin_role?.role || !selectedRoleTab) return null;

    const reverseMap = {
      Customer: "user",
      Logistics: "logistics-agent",
      Tailor: "fashion-designer",
      Fabric: "fabric-vendor",
      "Market Rep": "market-representative",
    };

    return reverseMap[selectedRoleTab];
  };

  // Fetch users with pagination
  const fetchUsers = async (role, page = 1) => {
    if (!role) return;
    setUsersLoading(true);
    try {
      const res = await CaryBinApi.get(
        `/auth/users/${roleMapping[role]}?pagination[page]=${page}`
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

  useEffect(() => {
    if (userType) {
      fetchUsers(userType, userPage);
    } else {
      setUsers([]);
      setTotalUsers(0);
    }
  }, [userType, userPage]);

  useEffect(() => {
    if (users) {
      console.log("Users data received:", users);
    }
  }, [users]);

  const { isPending: sendingMessage, sendMessageMutate } = useSendMessage();

  useEffect(() => {
    selectedChatRef.current = selectedChat;
    if (selectedChat) {
      setChatId(selectedChat.id);
    } else {
      setChatId(null);
    }
  }, [selectedChat]);

  useEffect(() => {
    console.log("Chat ID changed:", chatId);
  }, [chatId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messageList]);

  useEffect(() => {
    if (socket && isConnected && adminToken && adminId) {
      socket.emit("retrieveChats", {
        token: adminToken,
      });
    }
  }, [socket, isConnected, adminToken, adminId]);

  useEffect(() => {
    if (socket && isConnected && selectedChat && adminToken && adminId) {
      if (currentView === "role") {
        socket.emit("retrieveMessagesToAdmin", {
          token: adminToken,
          target_role: getUserAdminTypeCode(),
        });
      } else {
        if (socket.setupChatSpecificListener) {
          socket.setupChatSpecificListener(selectedChat.id);
        }

        socket.emit("retrieveMessages", {
          token: adminToken,
          chatBuddy: selectedChat.chat_buddy?.id || selectedChat.id,
        });
      }
    }
  }, [
    socket,
    isConnected,
    selectedChat,
    adminToken,
    adminId,
    chatId,
    currentView,
  ]);

  useEffect(() => {
    if (
      socket &&
      isConnected &&
      adminToken &&
      adminId &&
      currentView === "role" &&
      selectedRoleTab
    ) {
      socket.emit("retrieveMessagesToAdmin", {
        token: adminToken,
        target_role: getUserAdminTypeCode(),
      });
    }
  }, [socket, isConnected, adminToken, adminId, currentView, selectedRoleTab]);

  useEffect(() => {
    if (adminToken && adminId && !profileLoading) {
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
        setIsConnected(true);

        const myRoles = getUserAdminRole();

        myRoles.forEach((roleName) => {
          // We need the code (e.g., "fashion-designer") to send to backend
          const typeCode = roleMapping[roleName];
          if (typeCode) {
            socketInstance.emit("retrieveMessagesToAdmin", {
              token: adminToken,
              target_role: typeCode,
            });
          }
        });
      });

      socketInstance.on("disconnect", (reason) => {
        setIsConnected(false);
      });

      socketInstance.on(`messageSent:${adminId}`, (data) => {
        toastSuccess(data?.message || "Message delivered successfully");
      });

      socketInstance.on(`chatsRetrieved:${adminId}`, (data) => {
        if (data?.status === "success" && data?.data?.result) {
          setChats(data.data.result);
          toastSuccess(data?.message || "Chats loaded successfully");
        }
      });

      // socketInstance.on(`messagesRetrievedToAdmin:${adminId}`, (data) => {
      //   setRoleConversations(data?.data?.result);
      //   if (data?.status === "success" && data?.data?.result) {
      //     const currentSelectedChat = selectedChatRef.current;
      //     setCurrentSelectedChatMessages(currentSelectedChat);

      //     const formattedMessages = data.data.result.map((msg) => ({
      //       id: msg.id,
      //       sender: msg.initiator?.name || "Unknown",
      //       text: msg.message,
      //       time: new Date(msg.created_at).toLocaleTimeString([], {
      //         hour: "2-digit",
      //         minute: "2-digit",
      //         hour12: true,
      //       }),
      //       type:
      //         msg.initiator_id === currentSelectedChat?.chat_buddy?.id
      //           ? "received"
      //           : "sent",
      //       read: msg.read,
      //     }));

      //     setMessageList(formattedMessages);
      //   }
      // });
      socketInstance.on(`messagesRetrievedToAdmin:${adminId}`, (data) => {
        const result = data?.data?.result || [];
        setRoleConversations(result);

        // 1. Calculate and update the Count for the specific role
        if (result.length > 0) {
          const currentSelectedChat = selectedChatRef.current;
          setCurrentSelectedChatMessages(currentSelectedChat);

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

          setMessageList(formattedMessages);
          // We look at the first item to determine which role this data belongs to
          // Assumes result[0].role holds values like 'user', 'fashion-designer' etc.
          const firstItemRole = result[0].role || result[0].initiator?.role;
          const roleTabName = getRoleNameFromCode(firstItemRole);

          if (roleTabName) {
            setRoleCounts((prev) => ({
              ...prev,
              [roleTabName]: result.length,
            }));

            // 2. ONLY update the visible list if this data belongs to the currently selected tab
            // This prevents "Tailor" chats from overwriting "Customer" chats if you are looking at Customer
            // but the system is fetching Tailor in the background.
            if (selectedRoleTab === roleTabName) {
              setRoleConversations(result);
            }
          }
        } else {
          // Handle empty results if necessary (If we are on the tab and result is empty)
          if (currentView === "role" && result.length === 0) {
            setRoleConversations([]);
          }
        }
      });

      socketInstance.on(`recentChatRetrieved:${adminId}`, (data) => {
        if (data?.data) {
          const currentSelectedChat = selectedChatRef.current;

          setChats((prevChats) => {
            const existingChatIndex = prevChats.findIndex(
              (chat) => chat.id === data.data.id
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
              const duplicateChatIndex = prevChats.findIndex(
                (chat) => chat.chat_buddy?.id === data.data.chat_buddy?.id
              );

              if (duplicateChatIndex >= 0) {
                const updatedChats = [...prevChats];
                updatedChats[duplicateChatIndex] = {
                  ...updatedChats[duplicateChatIndex],
                  last_message: data.data.last_message,
                  created_at: data.data.created_at,
                  id: data.data.id,
                };
                return updatedChats;
              } else {
                return [data.data, ...prevChats];
              }
            }
          });

          if (currentSelectedChat && currentSelectedChat.id === data.data.id) {
            socketInstance.emit("retrieveMessages", {
              token: adminToken,
              chatBuddy: currentSelectedChat.chat_buddy.id,
            });
          }
        }
      });

      socketInstance.on(`messagesRetrieved:${adminId}`, (data) => {
        if (data?.status === "success" && data?.data?.result) {
          const currentSelectedChat = selectedChatRef.current;

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

          setMessageList(formattedMessages);
        }
      });

      const setupChatSpecificListener = (chatId) => {
        const eventName = `messagesRetrieved:${chatId}:${adminId}`;

        socketInstance.on(eventName, (data) => {
          if (data?.status === "success" && data?.data?.result) {
            const currentSelectedChat = selectedChatRef.current;
            setCurrentSelectedChatTwo(currentSelectedChat);

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

            setMessageList(formattedMessages);
          }
        });
      };

      socketInstance.setupChatSpecificListener = setupChatSpecificListener;

      socketInstance.on("messagesRetrieved", (data) => {
        if (data?.status === "success" && data?.data?.result) {
          const currentSelectedChat = selectedChatRef.current;

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

          setMessageList(formattedMessages);
        }
      });

      socketInstance.on("recentChatRetrieved", (data) => {
        if (data?.data) {
          const currentSelectedChat = selectedChatRef.current;

          setChats((prevChats) => {
            const existingChatIndex = prevChats.findIndex(
              (chat) => chat.id === data.data.id
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
              const duplicateChatIndex = prevChats.findIndex(
                (chat) => chat.chat_buddy?.id === data.data.chat_buddy?.id
              );

              if (duplicateChatIndex >= 0) {
                const updatedChats = [...prevChats];
                updatedChats[duplicateChatIndex] = {
                  ...updatedChats[duplicateChatIndex],
                  last_message: data.data.last_message,
                  created_at: data.data.created_at,
                  id: data.data.id,
                };
                return updatedChats;
              } else {
                return [data.data, ...prevChats];
              }
            }
          });

          if (currentSelectedChat && currentSelectedChat.id === data.data.id) {
            socketInstance.emit("retrieveMessages", {
              token: adminToken,
              chatBuddy: currentSelectedChat.chat_buddy.id,
            });
          }
        }
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    } else {
      if (!adminToken) {
        toastError("Admin token not found. Please login again.");
      }
    }
  }, [adminToken, adminId, profileLoading, selectedRoleTab]);

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
        } else {
          toastError("Failed to load admin profile");
        }
      } catch (error) {
        toastError("Error loading admin profile: " + error.message);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchAdminProfile();
  }, [adminToken]);

  const handleUserTypeChange = (e) => {
    const selectedType = e.target.value;
    setUserType(selectedType);
    setSelectedUser("");
  };

  const handleUserDropdownChange = (e) => {
    setSelectedUser(e.target.value);
    setUserListSelected(e.target.value);
  };

  const handleUserListClick = (id) => {
    setSelectedUser(id);
    setUserListSelected(id);
  };

  const handleSocketMessage = (e) => {
    if (!navigator.onLine) {
      toastError("No internet connection. Please check your network.");
      return;
    }
    e.preventDefault();

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

    if (socket && isConnected) {
      socket.emit("sendMessage", messageData);

      const isMessageForCurrentChat =
        selectedChat &&
        (selectedChat.chat_buddy?.id === selectedUser ||
          selectedChat.id === selectedUser);

      if (isMessageForCurrentChat) {
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
      }

      const targetUser = users.find((user) => user.id === selectedUser);
      if (targetUser) {
        setChats((prevChats) => {
          const existingChatIndex = prevChats.findIndex(
            (chat) => chat.chat_buddy?.id === selectedUser
          );

          if (existingChatIndex >= 0) {
            const updatedChats = [...prevChats];
            updatedChats[existingChatIndex] = {
              ...updatedChats[existingChatIndex],
              last_message: messageText.trim(),
              created_at: new Date().toISOString(),
            };
            const updatedChat = updatedChats.splice(existingChatIndex, 1)[0];
            return [updatedChat, ...updatedChats];
          } else {
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

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;

    if (!adminId) {
      toastError("Admin profile not loaded. Please wait and try again.");
      return;
    }

    if (socket && isConnected) {
      let messageData = {};
      
      // Determine message data based on admin role
      if (adminProfile?.role?.role_id === "owner-super-administrator") {
        messageData = {
          token: adminToken,
          chatBuddy: selectedChat.chat_buddy?.id || selectedChat.id,
          message: newMessage.trim(),
        };
      } else {
        messageData = {
          token: adminToken,
          chatBuddy:
            currentView === "all"
              ? selectedChatRef?.current?.chat_buddy_id
              : selectedChatRef?.current?.initiator_id,
          message: newMessage.trim(),
        };
      }

      socket.emit("sendMessage", messageData);

      // Add message to UI immediately
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

      // --- FIX STARTS HERE ---
      // If we are currently inside a specific Role Tab (e.g., "Tailor")
      if (currentView === "role" && selectedRoleTab) {
        
        // 1. Manually decrease the count for this specific tab
        setRoleCounts((prev) => ({
          ...prev,
          [selectedRoleTab]: Math.max(0, (prev[selectedRoleTab] || 0) - 1),
        }));

        // 2. Remove this chat from the current role list so it doesn't reappear 
        // if we switch back without fetching
        setRoleConversations((prev) => 
          prev.filter((chat) => chat.id !== selectedChat.id)
        );

        // 3. Switch view to "All Inbox" as per your logic
        setCurrentView("all");
        setSelectedChat(null);
      } 
      // --- FIX ENDS HERE ---
      
      else if (currentView === "all") {
        return;
      }
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setUserType("");
    setSelectedUser("");
    setMessageText("");
  };

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
    <>
      {/* IMPROVED: Mobile-responsive role tabs */}
      {adminProfile?.role?.role_id !== "owner-super-administrator" && (
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
          {/* Desktop view - horizontal tabs */}
          <div className="hidden md:flex items-center justify-center space-x-2 lg:space-x-4 py-3 px-4 overflow-x-auto">
            <div className="inline-flex bg-gray-200 rounded-t-full p-1 shadow-sm">
              <button
                className={`cursor-pointer px-4 lg:px-6 py-2 rounded-t-full transition-colors duration-200 text-sm font-semibold focus:outline-none whitespace-nowrap ${
                  currentView === "all"
                    ? "bg-purple-600 text-white shadow"
                    : "text-gray-700 hover:bg-gray-300"
                }`}
                onClick={() => {
                  setCurrentView("all");
                  setSearchTerm("");
                  setSelectedUser("");
                  setSelectedChat(null);
                  setSelectedRoleTab("");
                }}
                aria-pressed={currentView === "all"}
              >
                All Inbox
              </button>

              {getUserAdminRole().map((roleName) => (
                <button
                  key={roleName}
                  className={`relative cursor-pointer px-4 lg:px-6 py-2 rounded-t-full transition-colors duration-200 text-sm font-semibold focus:outline-none whitespace-nowrap ${
                    currentView === "role" && selectedRoleTab === roleName
                      ? "bg-purple-600 text-white shadow"
                      : "text-gray-700 hover:bg-gray-300"
                  }`}
                  onClick={() => {
                    setCurrentView("role");
                    setSelectedRoleTab(roleName);
                    setSearchTerm("");
                    setSelectedUser("");
                    setSelectedChat(null);
                  }}
                  aria-pressed={
                    currentView === "role" && selectedRoleTab === roleName
                  }
                >
                  {roleName}
                  {roleCounts[roleName] > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow animate-pulse">
                      {roleCounts[roleName]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile view - dropdown selector */}
          <div className="md:hidden px-4 py-3">
            <div className="relative">
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold text-gray-900">
                    {currentView === "all"
                      ? "All Inbox"
                      : `${selectedRoleTab} Inbox`}
                  </span>
                  {currentView === "role" && roleConversations?.length > 0 && (
                    <span className="bg-red-600 text-white text-xs font-bold rounded-full px-2 py-0.5">
                      {roleConversations.length}
                    </span>
                  )}
                </div>
                <ChevronRight
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    showRoleDropdown ? "rotate-90" : ""
                  }`}
                />
              </button>

              {/* Dropdown menu */}
              {showRoleDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                  <button
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                      currentView === "all"
                        ? "bg-purple-50 text-purple-700 font-semibold"
                        : "text-gray-700"
                    }`}
                    onClick={() => {
                      setCurrentView("all");
                      setSearchTerm("");
                      setSelectedUser("");
                      setSelectedChat(null);
                      setSelectedRoleTab("");
                      setShowRoleDropdown(false);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span>All Inbox</span>
                      {currentView === "all" && (
                        <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      )}
                    </div>
                  </button>

                  {getUserAdminRole().map((roleName) => (
                    <button
                      key={roleName}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                        currentView === "role" && selectedRoleTab === roleName
                          ? "bg-purple-50 text-purple-700 font-semibold"
                          : "text-gray-700"
                      }`}
                      onClick={() => {
                        setCurrentView("role");
                        setSelectedRoleTab(roleName);
                        setSearchTerm("");
                        setSelectedUser("");
                        setSelectedChat(null);
                        setShowRoleDropdown(false);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span>{roleName} Inbox</span>
                        <div className="flex items-center space-x-2">
                          {roleCounts[roleName] > 0 && (
                            <span className="bg-red-600 text-white text-xs font-bold rounded-full px-2 py-0.5">
                              {roleCounts[roleName]}
                            </span>
                          )}
                          {currentView === "role" &&
                            selectedRoleTab === roleName && (
                              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                            )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MAIN INBOX AREA */}
      <div className="h-[calc(100vh-120px)] md:h-screen flex flex-col bg-gray-50">
        {currentView === "all" ? (
          <div className="flex flex-col h-full">
            {/* Fixed header - improved mobile spacing */}
            <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 md:py-6 flex-shrink-0">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-3 md:space-y-0">
                <div className="flex items-center space-x-3 md:space-x-4">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Mail className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                      Inbox
                    </h1>
                    <div className="flex items-center text-xs md:text-sm text-gray-500">
                      <a
                        href="/admin"
                        className="text-purple-600 hover:text-purple-800 font-medium transition-colors"
                      >
                        Dashboard
                      </a>
                      <ChevronRight className="w-3 h-3 md:w-4 md:h-4 mx-1 md:mx-2" />
                      <span>Inbox</span>
                    </div>
                  </div>
                </div>

                <button
                  className="group relative bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-lg font-medium hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95 w-full md:w-auto"
                  onClick={() => setShowModal(true)}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Plus className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="text-sm md:text-base">New Message</span>
                  </div>
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-200"></div>
                </button>
              </div>
            </div>

            {/* Main Chat Container */}
            <div className="flex flex-1 min-h-0 overflow-hidden">
              {/* Sidebar - improved mobile behavior */}
              <div
                className={`fixed inset-y-0 left-0 bg-white border-r border-gray-200 w-full sm:w-80 transition-transform duration-300 md:relative md:w-1/3 lg:w-1/4 z-30 flex flex-col ${
                  showSidebar
                    ? "translate-x-0"
                    : "-translate-x-full md:translate-x-0"
                }`}
              >
                {/* Fixed Sidebar Header */}
                <div className="p-4 md:p-6 border-b border-gray-100 flex-shrink-0">
                  <div className="flex justify-between items-center mb-3 md:mb-4">
                    <h2 className="text-lg md:text-xl font-bold text-gray-900">
                      Messages
                    </h2>
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
                      size={14}
                    />
                    <input
                      type="text"
                      placeholder="Search conversations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full py-2.5 md:py-3 pl-9 md:pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm focus:border-purple-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Scrollable Chat List */}
                <div className="flex-1 overflow-y-auto">
                  {filteredChats.length === 0 ? (
                    <div className="text-center text-gray-500 py-8 md:py-12 px-4 md:px-6">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-full mx-auto mb-3 md:mb-4 flex items-center justify-center">
                        <FaSearch className="text-gray-400" size={20} />
                      </div>
                      <p className="font-medium mb-2 text-sm md:text-base">
                        No conversations yet
                      </p>
                      <p className="text-xs md:text-sm">
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
                          <div className="relative flex-shrink-0">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm md:text-base">
                              {chat.chat_buddy?.name?.charAt(0).toUpperCase() ||
                                "U"}
                            </div>
                            {chat.online && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded-full border-2 border-white"></div>
                            )}
                          </div>

                          <div className="flex-1 ml-3 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="font-semibold text-gray-900 truncate text-sm">
                                {chat.chat_buddy?.name || "Unknown User"}
                              </h4>
                            </div>

                            <div className="flex justify-between items-center">
                              <p className="text-xs text-gray-600 truncate flex-1">
                                {chat.last_message || "No messages yet"}
                              </p>
                              {chat.unread > 0 && (
                                <span className="inline-block bg-purple-500 text-white text-xs rounded-full px-2 py-0.5 ml-2 flex-shrink-0">
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
              <div className="flex-1 flex flex-col bg-white min-h-0 h-full">
                {/* Fixed Chat Header */}
                <div className="p-3 md:p-4 border-b border-gray-200 bg-white shadow-sm flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1 min-w-0">
                      <button
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors mr-2 flex-shrink-0"
                        onClick={() => setShowSidebar(true)}
                      >
                        <FaBars size={18} className="text-gray-500" />
                      </button>

                      {selectedChat && (
                        <>
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                            {selectedChat?.chat_buddy?.name
                              ?.charAt(0)
                              .toUpperCase() || "U"}
                          </div>
                          <div className="ml-2 md:ml-3 min-w-0">
                            <h4 className="font-semibold text-gray-900 text-sm md:text-base truncate">
                              {selectedChat?.chat_buddy?.name}
                            </h4>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                      <div className="flex items-center gap-1 px-2 md:px-3 py-1 rounded-full bg-gray-100">
                        <div
                          className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${
                            isConnected ? "bg-green-500" : "bg-red-500"
                          }`}
                        ></div>
                        <span className="text-xs text-gray-600 hidden sm:inline">
                          {isConnected ? "Connected" : "Disconnected"}
                        </span>
                      </div>

                      {selectedChat && (
                        <button className="text-xs md:text-sm text-purple-500 hover:text-purple-600 font-medium transition-colors hidden sm:inline">
                          View Profile
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Scrollable Messages Area */}
                <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 bg-gray-50 min-h-0">
                  {selectedChat ? (
                    messageList.length === 0 ? (
                      <div className="text-center text-gray-500 py-8 md:py-12">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-200 rounded-full mx-auto mb-3 md:mb-4 flex items-center justify-center">
                          <FaPaperPlane className="text-gray-400" size={20} />
                        </div>
                        <p className="font-medium mb-2 text-sm md:text-base">
                          No messages yet
                        </p>
                        <p className="text-xs md:text-sm">
                          Start the conversation!
                        </p>
                      </div>
                    ) : (
                      <>
                        {messageList?.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${
                              msg.type === "sent"
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`px-3 md:px-4 py-2 md:py-3 rounded-2xl max-w-[85%] md:max-w-[70%] shadow-sm ${
                                msg.type === "sent"
                                  ? "bg-purple-500 text-white rounded-br-md"
                                  : "bg-white text-gray-800 rounded-bl-md border border-gray-200"
                              }`}
                            >
                              <p className="text-xs md:text-sm leading-relaxed break-words">
                                {msg.text}
                              </p>
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
                    <div className="text-center text-gray-500 py-8 md:py-12">
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-200 rounded-full mx-auto mb-3 md:mb-4 flex items-center justify-center">
                        <FaSearch className="text-gray-400" size={24} />
                      </div>
                      <p className="font-medium mb-2 text-base md:text-lg">
                        Select a conversation
                      </p>
                      <p className="text-xs md:text-sm px-4">
                        Choose a chat from the sidebar to start messaging
                      </p>
                    </div>
                  )}
                </div>

                {/* Input - improved mobile sizing */}
                <div className="p-3 md:p-4 border-t border-gray-200 bg-white flex-shrink-0">
                  <div className="flex items-center gap-2 md:gap-3">
                    {/* Attachment Button */}
                    <div className="relative" ref={dropdownRef}>
                      <button
                        onClick={() => setShowOptions(!showOptions)}
                        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex-shrink-0"
                        disabled={!selectedChat}
                      >
                        <FaPlus size={16} className="text-gray-500" />
                      </button>

                      {showOptions && (
                        <div className="absolute bottom-12 md:bottom-14 left-0 w-40 md:w-44 bg-white shadow-lg rounded-lg border border-gray-200 py-2 z-20">
                          <button className="flex items-center w-full px-3 md:px-4 py-2 text-xs md:text-sm text-gray-700 hover:bg-gray-50">
                            <FaFile
                              size={14}
                              className="mr-2 md:mr-3 text-purple-500"
                            />
                            Attach File
                          </button>
                          <button className="flex items-center w-full px-3 md:px-4 py-2 text-xs md:text-sm text-gray-700 hover:bg-gray-50">
                            <FaImage
                              size={14}
                              className="mr-2 md:mr-3 text-green-500"
                            />
                            Send Image
                          </button>
                          <button className="flex items-center w-full px-3 md:px-4 py-2 text-xs md:text-sm text-gray-700 hover:bg-gray-50">
                            <FaMapMarkerAlt
                              size={14}
                              className="mr-2 md:mr-3 text-red-500"
                            />
                            Share Location
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Message Input */}
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        placeholder="Type message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        className="w-full py-2 md:py-3 px-3 md:px-4 pr-10 md:pr-12 bg-gray-50 border border-gray-200 rounded-2xl outline-none text-sm focus:border-purple-500 focus:bg-white transition-all"
                        disabled={!selectedChat}
                      />

                      {/* Emoji Button */}
                      <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 transition-colors"
                        disabled={!selectedChat}
                      >
                        <FaSmile size={18} className="text-gray-500" />
                      </button>

                      {showEmojiPicker && (
                        <div
                          ref={emojiPickerRef}
                          className="absolute bottom-12 md:bottom-14 right-0 bg-white shadow-lg rounded-lg border border-gray-200 z-20"
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
                      className="p-2 md:p-3 bg-purple-500 text-white rounded-2xl hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex-shrink-0"
                      disabled={!selectedChat}
                    >
                      <FaPaperPlane size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal - improved mobile responsiveness */}
            {showModal && (
              <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
                  <div className="sticky top-0 bg-white border-b border-gray-200 p-4 md:p-6 z-10">
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg md:text-xl font-semibold">
                        Send Message
                      </h2>
                      <button
                        onClick={() => {
                          handleModalClose();
                          setUserPage(1);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <X size={20} className="text-gray-500" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 md:p-6">
                    <form onSubmit={handleSocketMessage} className="space-y-4">
                      <div>
                        <label className="block text-sm md:text-base text-gray-700 mb-2 font-medium">
                          User Type
                        </label>
                        <select
                          className="w-full p-3 md:p-4 border border-gray-300 text-gray-700 outline-none rounded-lg text-sm md:text-base focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                          value={userType}
                          onChange={(e) => {
                            handleUserTypeChange(e);
                            setUserPage(1);
                          }}
                          required
                        >
                          <option value="">Choose user type</option>
                          {adminProfile?.role?.role_id ===
                          "owner-super-administrator" ? (
                            <>
                              <option value="Customer">Customer</option>
                              <option value="Tailor">Tailor</option>
                              <option value="Fabric">Fabric</option>
                              <option value="Market Rep">Market Rep</option>
                              <option value="Logistics">Logistics</option>
                            </>
                          ) : (
                            getUserAdminRole().map((role) => (
                              <option key={role} value={role}>
                                {role}
                              </option>
                            ))
                          )}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm md:text-base text-gray-700 mb-2 font-medium">
                          Select User
                        </label>
                        <div className="max-h-48 md:max-h-60 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                          {users.length > 0 ? (
                            users.map((user) => (
                              <div
                                key={user.id}
                                className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 cursor-pointer hover:bg-purple-50 transition ${
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
                                    className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border border-purple-200 flex-shrink-0"
                                  />
                                ) : (
                                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-purple-200 flex items-center justify-center text-sm md:text-lg font-bold text-purple-700 flex-shrink-0">
                                    {(
                                      user.name?.charAt(0) ||
                                      user.email?.charAt(0) ||
                                      "U"
                                    ).toUpperCase()}
                                  </div>
                                )}
                                <div className="flex flex-col min-w-0 flex-1">
                                  <span className="font-medium text-sm md:text-base text-gray-900 truncate">
                                    {user.name || "No Name"}
                                  </span>
                                  <span className="text-xs text-gray-500 truncate">
                                    {user.email}
                                  </span>
                                </div>
                                {userListSelected === user.id && (
                                  <span className="text-xs text-purple-600 font-semibold flex-shrink-0">
                                    Selected
                                  </span>
                                )}
                              </div>
                            ))
                          ) : !usersLoading && userType ? (
                            <div className="px-3 md:px-4 py-3 text-gray-400 text-xs md:text-sm text-center">
                              No users found for this role
                            </div>
                          ) : null}
                        </div>

                        {/* Pagination */}
                        <div className="flex justify-between items-center mt-2 px-2">
                          <button
                            type="button"
                            className="px-3 py-1.5 rounded bg-gray-100 text-gray-700 text-xs md:text-sm font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors"
                            onClick={() =>
                              setUserPage((p) => Math.max(1, p - 1))
                            }
                            disabled={userPage === 1 || usersLoading}
                          >
                            Previous
                          </button>
                          <span className="text-xs text-gray-500">
                            Page {userPage}
                          </span>
                          <button
                            type="button"
                            className="px-3 py-1.5 rounded bg-purple-100 text-purple-700 text-xs md:text-sm font-medium hover:bg-purple-200 disabled:opacity-50 transition-colors"
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
                        <label className="block text-sm md:text-base text-gray-700 mb-2 font-medium">
                          Message
                        </label>
                        <textarea
                          className="w-full p-3 md:p-4 border border-gray-300 outline-none rounded-lg text-sm md:text-base focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all resize-none"
                          placeholder="Type your message..."
                          rows="5"
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          required
                        />
                      </div>

                      <button
                        className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] text-sm md:text-base"
                        type="submit"
                        disabled={
                          sendingMessage || !selectedUser || !messageText.trim()
                        }
                      >
                        {sendingMessage ? "Sending..." : "Send Message"}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          // ROLE BASED CHAT - Same mobile improvements applied
          <div className="flex flex-col h-full">
            <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 md:py-6 flex-shrink-0">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-3 md:space-y-0">
                <div className="flex items-center space-x-3 md:space-x-4">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Mail className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                      {selectedRoleTab} Messages
                    </h1>
                    <div className="flex items-center text-xs md:text-sm text-gray-500">
                      <a
                        href="/admin"
                        className="text-purple-600 hover:text-purple-800 font-medium transition-colors"
                      >
                        Dashboard
                      </a>
                      <ChevronRight className="w-3 h-3 md:w-4 md:h-4 mx-1 md:mx-2" />
                      <span>Inbox</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-1 min-h-0 overflow-hidden">
              {/* Sidebar for role view */}
              <div
                className={`fixed inset-y-0 left-0 bg-white border-r border-gray-200 w-full sm:w-80 transition-transform duration-300 md:relative md:w-1/3 lg:w-1/4 z-30 flex flex-col ${
                  showSidebar
                    ? "translate-x-0"
                    : "-translate-x-full md:translate-x-0"
                }`}
              >
                <div className="p-4 md:p-6 border-b border-gray-100 flex-shrink-0">
                  <div className="flex justify-between items-center mb-3 md:mb-4">
                    <h2 className="text-lg md:text-xl font-bold text-gray-900">
                      Messages
                    </h2>
                    <button
                      className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      onClick={() => setShowSidebar(false)}
                    >
                      <FaTimes size={20} className="text-gray-500" />
                    </button>
                  </div>

                  <div className="relative">
                    <FaSearch
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={14}
                    />
                    <input
                      type="text"
                      placeholder="Search conversations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full py-2.5 md:py-3 pl-9 md:pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm focus:border-purple-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {roleConversations.length === 0 ? (
                    <div className="text-center text-gray-500 py-8 md:py-12 px-4 md:px-6">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-full mx-auto mb-3 md:mb-4 flex items-center justify-center">
                        <FaSearch className="text-gray-400" size={20} />
                      </div>
                      <p className="font-medium mb-2 text-sm md:text-base">
                        No conversations yet
                      </p>
                      <p className="text-xs md:text-sm">
                        Start a new conversation to see chats here
                      </p>
                    </div>
                  ) : (
                    <div className="p-2">
                      {roleConversations.map((chat) => (
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
                          <div className="relative flex-shrink-0">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm md:text-base">
                              {chat.initiator?.name?.charAt(0).toUpperCase() ||
                                "U"}
                            </div>
                            {chat.online && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded-full border-2 border-white"></div>
                            )}
                          </div>

                          <div className="flex-1 ml-3 min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate text-sm">
                              {chat.initiator?.name || "Unknown User"}
                            </h4>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Main chat window for role view */}
              <div className="flex-1 flex flex-col bg-white min-h-0 h-full">
                <div className="p-3 md:p-4 border-b border-gray-200 bg-white shadow-sm flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1 min-w-0">
                      <button
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors mr-2 flex-shrink-0"
                        onClick={() => setShowSidebar(true)}
                      >
                        <FaBars size={18} className="text-gray-500" />
                      </button>

                      {selectedChat && (
                        <>
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                            {selectedChat?.initiator?.name
                              ?.charAt(0)
                              .toUpperCase() || "U"}
                          </div>
                          <div className="ml-2 md:ml-3 min-w-0">
                            <h4 className="font-semibold text-gray-900 text-sm md:text-base truncate">
                              {selectedChat?.initiator?.name}
                            </h4>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                      <div className="flex items-center gap-1 px-2 md:px-3 py-1 rounded-full bg-gray-100">
                        <div
                          className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${
                            isConnected ? "bg-green-500" : "bg-red-500"
                          }`}
                        ></div>
                        <span className="text-xs text-gray-600 hidden sm:inline">
                          {isConnected ? "Connected" : "Disconnected"}
                        </span>
                      </div>

                      {selectedChat && (
                        <button className="text-xs md:text-sm text-purple-500 hover:text-purple-600 font-medium transition-colors hidden sm:inline">
                          View Profile
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 bg-gray-50 min-h-0">
                  {roleConversations.length > 0 && (
                    <div className="w-full bg-purple-100 text-purple-700 rounded-lg p-3 flex items-start gap-2 text-sm">
                      <Info
                        className="text-purple-600 flex-shrink-0 mt-0.5"
                        size={18}
                      />
                      <p className="text-xs md:text-sm">
                        After responding to this chat, you'll be redirected to
                        all inbox. This chat becomes part of all inbox chats
                        once responded to.
                      </p>
                    </div>
                  )}
                  {selectedChat ? (
                    currentSelectedChatMessages?.message === null ? (
                      <div className="text-center text-gray-500 py-8 md:py-12">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-200 rounded-full mx-auto mb-3 md:mb-4 flex items-center justify-center">
                          <FaPaperPlane className="text-gray-400" size={20} />
                        </div>
                        <p className="font-medium mb-2 text-sm md:text-base">
                          No messages yet
                        </p>
                        <p className="text-xs md:text-sm">
                          Start the conversation!
                        </p>
                      </div>
                    ) : (
                      <>
                        <div
                          className={`flex ${
                            currentSelectedChatMessages?.role === "user" ||
                            currentSelectedChatMessages?.role ===
                              "logistics-agent" ||
                            currentSelectedChatMessages?.role ===
                              "fabric-vendor" ||
                            currentSelectedChatMessages?.role ===
                              "fashion-designer" ||
                            currentSelectedChatMessages?.role ===
                              "market-representative"
                              ? "justify-start"
                              : "justify-end"
                          }`}
                        >
                          <div
                            className={`px-3 md:px-4 py-2 md:py-3 rounded-2xl max-w-[85%] md:max-w-[70%] shadow-sm ${
                              currentSelectedChatMessages?.role === "user" ||
                              currentSelectedChatMessages?.role ===
                                "logistics-agent" ||
                              currentSelectedChatMessages?.role ===
                                "fabric-vendor" ||
                              currentSelectedChatMessages?.role ===
                                "fashion-designer" ||
                              currentSelectedChatMessages?.role ===
                                "market-representative"
                                ? "bg-white text-gray-800 rounded-bl-md border border-gray-200"
                                : "bg-purple-500 text-white rounded-br-md"
                            }`}
                          >
                            <p className="text-xs md:text-sm leading-relaxed break-words">
                              {currentSelectedChatMessages?.message}
                            </p>
                          </div>
                        </div>
                        <div ref={messagesEndRef} />
                      </>
                    )
                  ) : (
                    <div className="text-center text-gray-500 py-8 md:py-12">
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-200 rounded-full mx-auto mb-3 md:mb-4 flex items-center justify-center">
                        <FaSearch className="text-gray-400" size={24} />
                      </div>
                      <p className="font-medium mb-2 text-base md:text-lg">
                        Select a conversation
                      </p>
                      <p className="text-xs md:text-sm px-4">
                        Choose a chat from the sidebar to start messaging
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-3 md:p-4 border-t border-gray-200 bg-white flex-shrink-0">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="relative" ref={dropdownRef}>
                      <button
                        onClick={() => setShowOptions(!showOptions)}
                        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex-shrink-0"
                        disabled={!selectedChat}
                      >
                        <FaPlus size={16} className="text-gray-500" />
                      </button>

                      {showOptions && (
                        <div className="absolute bottom-12 md:bottom-14 left-0 w-40 md:w-44 bg-white shadow-lg rounded-lg border border-gray-200 py-2 z-20">
                          <button className="flex items-center w-full px-3 md:px-4 py-2 text-xs md:text-sm text-gray-700 hover:bg-gray-50">
                            <FaFile
                              size={14}
                              className="mr-2 md:mr-3 text-purple-500"
                            />
                            Attach File
                          </button>
                          <button className="flex items-center w-full px-3 md:px-4 py-2 text-xs md:text-sm text-gray-700 hover:bg-gray-50">
                            <FaImage
                              size={14}
                              className="mr-2 md:mr-3 text-green-500"
                            />
                            Send Image
                          </button>
                          <button className="flex items-center w-full px-3 md:px-4 py-2 text-xs md:text-sm text-gray-700 hover:bg-gray-50">
                            <FaMapMarkerAlt
                              size={14}
                              className="mr-2 md:mr-3 text-red-500"
                            />
                            Share Location
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 relative">
                      <input
                        type="text"
                        placeholder="Type message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        className="w-full py-2 md:py-3 px-3 md:px-4 pr-10 md:pr-12 bg-gray-50 border border-gray-200 rounded-2xl outline-none text-sm focus:border-purple-500 focus:bg-white transition-all"
                        disabled={!selectedChat}
                      />

                      <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 transition-colors"
                        disabled={!selectedChat}
                      >
                        <FaSmile size={18} className="text-gray-500" />
                      </button>

                      {showEmojiPicker && (
                        <div
                          ref={emojiPickerRef}
                          className="absolute bottom-12 md:bottom-14 right-0 bg-white shadow-lg rounded-lg border border-gray-200 z-20"
                        >
                          <EmojiPicker
                            onEmojiClick={handleEmojiClick}
                            width={280}
                            height={350}
                          />
                        </div>
                      )}
                    </div>

                    <button
                      onClick={sendMessage}
                      className="p-2 md:p-3 bg-purple-500 text-white rounded-2xl hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex-shrink-0"
                      disabled={!selectedChat}
                    >
                      <FaPaperPlane size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
