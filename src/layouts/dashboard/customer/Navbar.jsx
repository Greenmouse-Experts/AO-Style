import { useState, useEffect } from "react";
import { Bell, Menu, ShoppingCart } from "lucide-react";
// import { FaBullhorn } from "react-icons/fa";
import { Link } from "react-router-dom";
import useToast from "../../../hooks/useToast";
import Cookies from "js-cookie";
import { useCarybinUserStore } from "../../../store/carybinUserStore";
import useSessionManager from "../../../hooks/useSessionManager";
import useGetNotification from "../../../hooks/notification/useGetNotification";
import useGetCart from "../../../hooks/cart/useGetCart";
// import useGetAnnouncementsWithProfile from "../../../hooks/announcement/useGetAnnouncementsWithProfile";

export default function Navbar({ toggleSidebar }) {
  const { toastSuccess } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { carybinUser, logOut } = useCarybinUserStore();
  const { clearAuthData } = useSessionManager();

  // Check if user is authenticated (has token)
  const token = Cookies.get("token");

  const {
    data: cartResponse,
    refetch: refetchCart,
  } = useGetCart();

  // Calculate cart count based on authentication status
  const getCartCount = () => {
    if (token) {
      // User is logged in - use API cart data
      const cartData = cartResponse?.data;
      const items = cartData?.items || [];
      return items.length;
    } else {
      // User is not logged in - use localStorage pending fabric data
      try {
        const pendingFabricData = localStorage.getItem("pending_fabric_data");
        console.log(
          "Pending Fabric Data from localStorage:",
          pendingFabricData,
        );
        if (pendingFabricData) {
          const parsedData = JSON.parse(pendingFabricData);
          // Check if it has an items array
          if (parsedData && Array.isArray(parsedData.items)) {
            return parsedData.items.length;
          }
          // If it's directly an array
          if (Array.isArray(parsedData)) {
            return parsedData.length;
          }
        }
      } catch (error) {
        console.error(
          "Error parsing pending_fabric_data from localStorage:",
          error,
        );
      }
      return 0;
    }
  };

  const cartCount = getCartCount();

  // Announcements hook commented out since announcement button is hidden
  // const { data: unreadAnnouncementsData, refetchAll } =
  //   useGetAnnouncementsWithProfile("user", "unread");

  // Refetch cart every 10 seconds (only if authenticated)
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      if (typeof refetchCart === "function") {
        refetchCart();
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [refetchCart, token]);

  // Listen for localStorage changes to update cart count in real-time
  useEffect(() => {
    if (!token) {
      const handleStorageChange = (e) => {
        if (e.key === "pending_fabric_data") {
          // Force re-render by updating a state or triggering component update
          // This will cause getCartCount to be called again
          setIsDropdownOpen((prev) => prev); // Trigger re-render without changing state
        }
      };

      window.addEventListener("storage", handleStorageChange);

      // Also listen for custom events in case localStorage is updated in the same tab
      const handleCustomStorageChange = () => {
        setIsDropdownOpen((prev) => prev); // Trigger re-render
      };

      window.addEventListener("localStorageUpdated", handleCustomStorageChange);

      return () => {
        window.removeEventListener("storage", handleStorageChange);
        window.removeEventListener(
          "localStorageUpdated",
          handleCustomStorageChange,
        );
      };
    }
  }, [token]);

  // Announcements count calculation commented out since announcement button is hidden
  // console.log("Unread Announcements Data:", unreadAnnouncementsData);
  // let unreadAnnouncementsCount = 0;
  // if (token && unreadAnnouncementsData) {
  //   let announcementsArray = [];
  //   if (Array.isArray(unreadAnnouncementsData)) {
  //     announcementsArray = unreadAnnouncementsData;
  //   } else if (
  //     unreadAnnouncementsData.data &&
  //     Array.isArray(unreadAnnouncementsData.data)
  //   ) {
  //     announcementsArray = unreadAnnouncementsData.data;
  //   } else if (
  //     unreadAnnouncementsData.data?.data &&
  //     Array.isArray(unreadAnnouncementsData.data.data)
  //   ) {
  //     announcementsArray = unreadAnnouncementsData.data.data;
  //   }
  //   if (announcementsArray.length > 0) {
  //     unreadAnnouncementsCount = announcementsArray.filter(
  //       (announcement) => !announcement.read,
  //     ).length;
  //   } else if (unreadAnnouncementsData.count) {
  //     unreadAnnouncementsCount = unreadAnnouncementsData.count;
  //   }
  // }

  const handleSignOut = () => {
    toastSuccess("Logout Successfully");
    logOut();
    clearAuthData();
    localStorage.setItem("logout", Date.now().toString());
    window.location.replace("/login");
  };

  const { data } = useGetNotification({
    read: false,
  });

  const unreadNotificationsCount = token ? data?.count || 0 : 0;

  return (
    <div>
      <nav className="bg-white shadow-md p-4 md:p-6 flex items-center justify-between gap-3 md:gap-4">
        {/* Left: Sidebar Toggle & Title */}
        <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
          {/* Sidebar Toggle Button (Only on Mobile) */}
          <button
            className="md:block lg:hidden p-2 text-gray-600 flex-shrink-0"
            onClick={toggleSidebar}
          >
            <Menu size={20} className="md:w-6 md:h-6" />
          </button>

          {/* Page Title */}
          <h1 className="text-xs md:text-sm lg:text-xl font-bold lg:ml-4 flex-1 min-w-0 truncate">
            <span className="hidden md:inline truncate">
              {token
                ? "Welcome to Your Customer Dashboard – Manage Orders, Track Deliveries, and View Notifications"
                : "Welcome to Carybin – Browse Products and Add to Cart"}
            </span>
            <span className="inline md:hidden">
              {token
                ? "Customer Dashboard"
                : "Welcome to Carybin"}
            </span>
          </h1>
        </div>

        {/* Right: Cart, Announcements, Notifications & Profile */}
        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          {/* Cart - Always visible */}
          <Link
            to="/view-cart"
            className="relative bg-purple-100 p-1.5 md:p-2 rounded-full"
          >
            <ShoppingCart size={18} className="md:w-5 md:h-5 text-purple-600" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Announcements - Commented out for space */}
          {/* {token && (
            <Link
              to="/customer/announcements"
              className="relative bg-purple-100 p-2 rounded-full"
            >
              <FaBullhorn size={20} className="text-purple-600" />
              {unreadAnnouncementsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {unreadAnnouncementsCount}
                </span>
              )}
            </Link>
          )} */}

          {/* Notifications - Only show if authenticated */}
          {token && (
            <Link
              to="/customer/notifications"
              className="relative bg-purple-100 p-1.5 md:p-2 rounded-full"
            >
              <Bell size={18} className="md:w-5 md:h-5 text-purple-600" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {unreadNotificationsCount}
                </span>
              )}
            </Link>
          )}

          {/* Profile Section - Show different content based on auth status */}
          {token ? (
            <div className="relative">
              {carybinUser?.profile?.profile_picture ? (
                <img
                  src={carybinUser?.profile?.profile_picture}
                  alt="User"
                  className="w-7 h-7 md:w-8 md:h-8 rounded-full cursor-pointer"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                />
              ) : (
                <div
                  role="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-7 h-7 md:w-8 md:h-8 cursor-pointer rounded-full bg-gray-300 flex items-center justify-center text-xs md:text-sm font-medium text-white"
                >
                  {carybinUser?.name?.charAt(0).toUpperCase() || "?"}
                </div>
              )}

              {/* Dropdown */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg z-50">
                  <ul className="py-2">
                    <Link
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      to="/customer/settings"
                    >
                      <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                        Settings
                      </li>
                    </Link>
                    <button
                      onClick={() => {
                        setIsAddModalOpen(true);
                        setIsDropdownOpen(!isDropdownOpen);
                      }}
                      className="px-4 py-2 hover:bg-gray-100 text-red-500 cursor-pointer w-full text-left"
                    >
                      Logout
                    </button>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            // Show login button for non-authenticated users
            <div className="flex items-center space-x-3">
              <Link
                to="/login"
                className="px-4 py-2 text-purple-600 hover:text-purple-700 font-medium transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Logout Modal - Only show if authenticated */}
      {token && isAddModalOpen && (
        <div
          className="fixed inset-0 flex justify-center items-center z-[10000] backdrop-blur-sm"
          onClick={() => {
            setIsAddModalOpen(false);
          }}
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Log out</h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                }}
                className="text-gray-500 cursor-pointer hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[80vh] overflow-y-auto px-1">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Are you sure you want to logout
              </label>
              <div className="flex justify-between mt-6 space-x-4">
                <button
                  onClick={() => {
                    setIsAddModalOpen(false);
                  }}
                  className="w-full cursor-pointer bg-purple-400 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleSignOut();
                  }}
                  className="w-full cursor-pointer bg-gradient text-white px-4 py-4 rounded-md text-sm font-medium"
                >
                  {"Logout"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
