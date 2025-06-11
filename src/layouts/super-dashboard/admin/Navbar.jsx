import { useState } from "react";
import { Bell, Menu } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCarybinUserStore } from "../../../store/carybinUserStore";
import useToast from "../../../hooks/useToast";
import Cookies from "js-cookie";

export default function Navbar({ toggleSidebar }) {
  const { toastSuccess } = useToast();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const { logOut } = useCarybinUserStore();

  const handleSignOut = () => {
    navigate("/admin/login");
    toastSuccess("Logout Successfully");
    logOut();
    Cookies.remove("token");
  };

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
          <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
            6
          </span>
        </div>

        {/* Profile Avatar & Dropdown */}
        <div className="relative">
          <img
            src="https://randomuser.me/api/portraits/women/6.jpg"
            alt="User"
            className="w-8 h-8 rounded-full cursor-pointer"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          />

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 shadow-lg rounded-lg z-50">
              <ul className="py-2">
                <li className="px-4 py-2 hover:bg-gray-100">
                  <Link
                    to="/admin/settings"
                    className="block text-sm text-gray-700"
                  >
                    Settings
                  </Link>
                </li>
                <button
                  onClick={() => {
                    handleSignOut();
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
