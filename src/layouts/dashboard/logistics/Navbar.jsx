import { useState, useEffect } from "react";
import { Bell, Menu } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import useToast from "../../../hooks/useToast";
import { useCarybinUserStore } from "../../../store/carybinUserStore";
import Cookies from "js-cookie";
import useGetNotification from "../../../hooks/notification/useGetNotification";
import useGetKyc from "../../../hooks/settings/useGetKyc";
import useGetAnnouncementsWithProfile from "../../../hooks/announcement/useGetAnnouncementsWithProfile";
import { FaBullhorn } from "react-icons/fa";

export default function Navbar({ toggleSidebar }) {
  const { toastSuccess } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { data: kycinfo, isPending: kycIsPending } = useGetKyc();

  const navigate = useNavigate();

  const { carybinUser, logOut } = useCarybinUserStore();
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
    Cookies.remove("token");
    window.location.replace("/login");
  };

  const { data, isPending } = useGetNotification({
    read: false,
  });

  const unreadNotificationsCount = data?.count || 0;

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
          <h1 className="text-xs md:text-sm lg:text-2xl font-bold text-gray-700 lg:ml-4 flex-1 min-w-0 truncate">
            <span className="hidden md:inline truncate">
              Logistics Dashboard - Manage Your Orders & Deliveries
            </span>
            <span className="inline md:hidden">Logistics Dashboard</span>
          </h1>
        </div>

        {/* Right: Notification & Profile */}
        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          <Link
            to="/logistics/notifications"
            className="relative bg-purple-100 p-1.5 md:p-2 rounded-full"
          >
            <Bell size={18} className="md:w-5 md:h-5 text-purple-600" />
            {unreadNotificationsCount > 0 ? (
              <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {unreadNotificationsCount}
              </span>
            ) : (
              <></>
            )}
          </Link>
          {/* Announcement button commented out for space */}
          {/* <Link
            to="/logistics/announcements"
            className="relative bg-purple-100 p-2 rounded-full"
          >
            <FaBullhorn size={20} className="text-purple-600" />
            {unreadAnnouncementsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {unreadAnnouncementsCount}
              </span>
            )}
          </Link> */}
          {/* Profile Section */}
          <div className="relative">
            {carybinUser?.profile?.profile_picture ? (
              <img
                src={carybinUser?.profile?.profile_picture ?? null}
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

            {/* VERIFIED Badge - Positioned below profile icon */}
            {!kycIsPending && (
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                {kycinfo?.data?.is_approved ? (
                  <span className="px-1.5 py-0.5 text-[9px] md:text-[10px] rounded-full bg-green-100 text-green-700 whitespace-nowrap">
                    VERIFIED
                  </span>
                ) : (
                  <Link to="/logistics/settings?q=kyc">
                    <span className="px-1.5 py-0.5 text-[9px] md:text-[10px] rounded-full bg-red-100 text-red-700 underline cursor-pointer whitespace-nowrap">
                      UNVERIFIED
                    </span>
                  </Link>
                )}
              </div>
            )}

            {/* Dropdown */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg z-50">
                <ul className="py-2">
                  <Link
                    onClick={() => {
                      setIsDropdownOpen(!isDropdownOpen);
                    }}
                    to="/logistics/settings"
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
                    className="px-4 py-2 hover:bg-gray-100 text-red-500 cursor-pointer"
                  >
                    Logout
                  </button>
                </ul>
              </div>
            )}
          </div>
        </div>
      </nav>

      {isAddModalOpen && (
        <div
          className="fixed inset-0 flex justify-center items-center z-[999] backdrop-blur-sm"
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
              {" "}
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
