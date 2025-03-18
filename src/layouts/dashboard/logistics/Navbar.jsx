import { useState } from "react";
import { Bell, Menu } from "lucide-react";

export default function Navbar({ toggleSidebar }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md p-6 flex items-center justify-between">
      {/* Sidebar Toggle Button (Only on Mobile) */}
      <button className="lg:hidden p-2 text-gray-600" onClick={toggleSidebar}>
        <Menu size={24} />
      </button>

      {/* Page Title */}
      <h1 className="text-base font-normal text-[#7A7979] lg:ml-4">
      Logistics Dashboard
      </h1>

      {/* Right: Notification & Profile */}
      <div className="flex items-center space-x-6">
        <div className="relative bg-purple-100 p-2 rounded-full">
          <Bell size={20} className="text-purple-600" />
          <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full">
            6
          </span>
        </div>

        {/* Profile Section */}
        <div className="relative">
          <img
            src="https://randomuser.me/api/portraits/women/2.jpg"
            alt="User"
            className="w-8 h-8 rounded-full cursor-pointer"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          />

          {/* Dropdown */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg z-50">
              <ul className="py-2">
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  Profile
                </li>
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  Settings
                </li>
                <li className="px-4 py-2 text-red-500 hover:bg-gray-100 cursor-pointer">
                  Logout
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
