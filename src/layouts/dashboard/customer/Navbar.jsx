import { useState, useEffect } from "react";
import { Bell, Menu, ShoppingCart } from "lucide-react";
import { FaBullhorn } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import useToast from "../../../hooks/useToast";
import Cookies from "js-cookie";
import { useCarybinUserStore } from "../../../store/carybinUserStore";
import useSessionManager from "../../../hooks/useSessionManager";
import useGetNotification from "../../../hooks/notification/useGetNotification";
import useGetCart from "../../../hooks/cart/useGetCart";
import useGetAnnouncementsWithProfile from "../../../hooks/announcement/useGetAnnouncementsWithProfile";

export default function Navbar({ toggleSidebar }) {
  const { toastSuccess } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const navigate = useNavigate();

  const { carybinUser, logOut } = useCarybinUserStore();
  const { clearAuthData } = useSessionManager();
  const { data: cartResponse, isPending: isCartPending } = useGetCart();

  // Get cart data from API response
  const cartData = cartResponse?.data;
  const items = cartData?.items || [];
  const cartCount = items.length;

  const { data: unreadAnnouncementsData, refetchAll } =
    useGetAnnouncementsWithProfile("user", "unread");

  // Refetch unread announcements every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof refetchAll === "function") {
        refetchAll();
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [refetchAll]);

  console.log("Unread Announcements Data:", unreadAnnouncementsData);
  // Extract unread announcements count
  let unreadAnnouncementsCount = 0;
  if (unreadAnnouncementsData) {
    let announcementsArray = [];
    if (Array.isArray(unreadAnnouncementsData)) {
      announcementsArray = unreadAnnouncementsData;
    } else if (
      unreadAnnouncementsData.data &&
      Array.isArray(unreadAnnouncementsData.data)
    ) {
      announcementsArray = unreadAnnouncementsData.data;
    } else if (
      unreadAnnouncementsData.data?.data &&
      Array.isArray(unreadAnnouncementsData.data.data)
    ) {
      announcementsArray = unreadAnnouncementsData.data.data;
    }
    if (announcementsArray.length > 0) {
      unreadAnnouncementsCount = announcementsArray.filter(
        (announcement) => !announcement.read,
      ).length;
    } else if (unreadAnnouncementsData.count) {
      unreadAnnouncementsCount = unreadAnnouncementsData.count;
    }
  }

  const handleSignOut = () => {
    toastSuccess("Logout Successfully");
    logOut();
    clearAuthData();
    localStorage.setItem("logout", Date.now().toString());
    window.location.replace("/login");
  };

  const { data, isPending } = useGetNotification({
    read: false,
  });

  const unreadNotificationsCount = data?.count || 0;

  return (
    <div>
      <nav className="bg-white shadow-md p-6 flex items-center justify-between">
        {/* Sidebar Toggle Button (Only on Mobile) */}
        <button
          className="md:block lg:hidden p-2 text-gray-600"
          onClick={toggleSidebar}
        >
          <Menu size={24} />
        </button>

        {/* Page Title */}
        <h1 className="text-base font-bold text-gray-700 lg:ml-4">
          Welcome to Your Customer Dashboard – Manage Orders, Track Deliveries,
          and View Notifications
        </h1>

        {/* Right: Cart, Announcements, Notifications & Profile */}
        <div className="flex items-center space-x-6">
          {/* Cart */}
          <Link
            to="/view-cart"
            className="relative bg-purple-100 p-2 rounded-full"
          >
            <ShoppingCart size={20} className="text-purple-600" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Announcements */}
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

          {/* Notifications */}
          <Link
            to="/customer/notifications"
            className="relative bg-purple-100 p-2 rounded-full"
          >
            <Bell size={20} className="text-purple-600" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {unreadNotificationsCount}
              </span>
            )}
          </Link>

          {/* Profile Section */}
          <div className="relative">
            {carybinUser?.profile?.profile_picture ? (
              <img
                src={carybinUser?.profile?.profile_picture}
                alt="User"
                className="w-8 h-8 rounded-full cursor-pointer"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              />
            ) : (
              <div
                role="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-8 h-8 cursor-pointer rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-white"
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
        </div>
      </nav>

      {/* Logout Modal */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 flex justify-center items-center z-[9999] backdrop-blur-sm"
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
