import { useState } from "react";
import { Bell, Menu } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import useToast from "../../../hooks/useToast";
import Cookies from "js-cookie";
import useGetNotification from "../../../hooks/notification/useGetNotification";
import { useCarybinAdminUserStore } from "../../../store/carybinAdminUserStore";

export default function Navbar({ toggleSidebar }) {
  const { toastSuccess } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { carybinAdminUser } = useCarybinAdminUserStore();

  const navigate = useNavigate();

  const { logOut } = useCarybinAdminUserStore();

  const handleSignOut = () => {
    Cookies.remove("adminToken");

    toastSuccess("Logout Successfully");
    logOut();
    window.location.href = "/admin/login";
  };

  const { data, isPending } = useGetNotification({
    read: false,
  });

  const unreadNotificationsCount = data?.count || 0;

  return (
    <div>
      {" "}
      <nav className="bg-white shadow-md p-4 md:p-6 flex items-center justify-between gap-3 md:gap-4">
        {/* Left: Sidebar Toggle & Title */}
        <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
          <button
            className="md:block lg:hidden p-2 text-gray-600 flex-shrink-0"
            onClick={toggleSidebar}
            aria-label="Toggle Sidebar"
          >
            <Menu size={20} className="md:w-6 md:h-6" />
          </button>

          {/* Page Title */}
          <h1 className="text-xs md:text-sm lg:text-base font-bold lg:ml-4 flex-1 min-w-0 truncate">
            Super Admin Dashboard
          </h1>
        </div>

        {/* Right: Notification & Profile */}
        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          {/* Notification Bell */}
          <Link
            to="/admin/notifications"
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

          {/* Profile Avatar & Dropdown */}
          <div className="relative">
            {carybinAdminUser?.profile?.profile_picture ? (
              <img
                src={carybinAdminUser?.profile?.profile_picture ?? null}
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
                {carybinAdminUser?.name?.charAt(0).toUpperCase() || "?"}
              </div>
            )}

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 shadow-lg rounded-lg z-[9999]">
                <ul className="py-2">
                  <li className="px-4 py-2 hover:bg-gray-100">
                    <Link
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      to="/admin/settings"
                      className="block text-sm text-gray-700"
                    >
                      Settings
                    </Link>
                  </li>
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
          className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm"
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
