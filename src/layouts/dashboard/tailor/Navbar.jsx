import { useState } from "react";
import { Bell, Menu } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import useToast from "../../../hooks/useToast";
import { useCarybinUserStore } from "../../../store/carybinUserStore";
import Cookies from "js-cookie";
import useGetNotification from "../../../hooks/notification/useGetNotification";

export default function Navbar({ toggleSidebar }) {
  const { toastSuccess } = useToast();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const navigate = useNavigate();

  const { carybinUser, logOut } = useCarybinUserStore();

  const handleSignOut = () => {
    navigate("/login");
    toastSuccess("Logout Successfully");
    logOut();
    Cookies.remove("token");
  };

  const { data, isPending } = useGetNotification({
    read: false,
  });

  const unreadNotificationsCount = data?.count || 0;

  return (
    <nav className="bg-white shadow-md p-6 flex items-center justify-between">
      {/* Sidebar Toggle Button (Only on Mobile) */}
      <button className="lg:hidden p-2 text-gray-600" onClick={toggleSidebar}>
        <Menu size={24} />
      </button>

      {/* Page Title */}
      <h1 className="text-base font-normal text-[#7A7979] lg:ml-4">
        Tailor/Designer Dashboard
      </h1>

      {/* Right: Notification & Profile */}
      <div className="flex items-center space-x-6">
        <div className="relative bg-purple-100 p-2 rounded-full">
          <Bell size={20} className="text-purple-600" />
          {unreadNotificationsCount > 0 ? (
            <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full">
              {unreadNotificationsCount}
            </span>
          ) : (
            <></>
          )}
        </div>

        {/* Profile Section */}
        <div className="relative">
          {carybinUser?.profile?.profile_picture ? (
            <img
              src={carybinUser?.profile?.profile_picture ?? null}
              alt="User"
              className="w-8 h-8 rounded-full cursor-pointer"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            />
          ) : (
            <>
              {" "}
              <div
                role="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-8 h-8 cursor-pointer rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-white"
              >
                {carybinUser?.name?.charAt(0).toUpperCase() || "?"}
              </div>
            </>
          )}

          {/* Dropdown */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg z-50">
              <ul className="py-2">
                {/* <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  Profile
                </li> */}
                <Link
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  to="/tailor/settings"
                >
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    Settings
                  </li>
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsDropdownOpen(!isDropdownOpen);
                  }}
                  className="px-4 py-2 hover:bg-gray-100 text-red-500  cursor-pointer"
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
