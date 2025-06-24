import { useState } from "react";
import { Bell, Menu } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCarybinUserStore } from "../../../store/carybinUserStore";
import useToast from "../../../hooks/useToast";
import Cookies from "js-cookie";
import useGetNotification from "../../../hooks/notification/useGetNotification";

export default function Navbar({ toggleSidebar }) {
  const { toastSuccess } = useToast();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { carybinUser } = useCarybinUserStore();

  const navigate = useNavigate();

  const { logOut } = useCarybinUserStore();

  const handleSignOut = () => {
    navigate("/admin/login");
    toastSuccess("Logout Successfully");
    logOut();
    Cookies.remove("token");
  };

  const { data, isPending } = useGetNotification({
    read: false,
  });

  const unreadNotificationsCount = data?.count || 0;

  return (
    <nav className="bg-white px-4 py-6 flex items-center justify-between sticky top-0 z-40 w-full">
      <button
        className="lg:hidden p-2 text-gray-600"
        onClick={toggleSidebar}
        aria-label="Toggle Sidebar"
      >
        <Menu size={24} />
      </button>

      {/* Page Title */}
      <h1 className="text-base font-medium text-gray-700 lg:ml-4">
        Super Admin Dashboard
      </h1>

      {/* Notification & Profile */}
      <div className="flex items-center space-x-5 relative">
        {/* Notification Bell */}
        <div className="relative">
          <div className="bg-purple-100 p-2 rounded-full">
            <Bell size={20} className="text-purple-600" />
          </div>
          {unreadNotificationsCount > 0 ? (
            <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full">
              {unreadNotificationsCount}
            </span>
          ) : (
            <></>
          )}
        </div>

        {/* Profile Avatar & Dropdown */}
        <div className="relative">
          {carybinUser?.profile?.profile_picture ? (
            <img
              src={carybinUser?.profile?.profile_picture ?? null}
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

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 shadow-lg rounded-lg z-50">
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
                    handleSignOut();
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
  );
}
