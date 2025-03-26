import { NavLink } from "react-router-dom";
import {
  FaHome, FaStore, FaSignOutAlt, FaShoppingCart, FaInbox, FaBell, FaCreditCard, FaCog, FaUser
} from "react-icons/fa";
import { GiScissors } from "react-icons/gi";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <div className="relative">
      {/* Sidebar */}
      <div
        className={`fixed md:relative top-0 left-0 h-screen bg-white p-5 flex flex-col transition-transform duration-300 z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:w-72 w-64`}
      >
        {/* Logo */}
        <div className="flex justify-center">
          <NavLink to="/">
            <img
              src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1742964300/AoStyle/CARYBIN_TRANSPARENT_1_ujbdei.png"
              alt="Carybin Logo"
              className="h-20 w-auto"
            />
          </NavLink>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search for..."
          className="w-full p-3 rounded-md border border-gray-300 mb-5 mt-3 outline-none"
        />

        {/* Sidebar Links */}
        <nav className="flex-1 space-y-2">
          <SidebarItem to="/logistics" icon={<FaHome />} text="Dashboard" activeClass="text-[#9847FE] font-medium" />
          <SidebarItem to="/logistics/orders" icon={<FaShoppingCart />} text="Orders" />
          <SidebarItem to="/logistics/order-requests" icon={<FaStore />} text="Order Requests" />
          <SidebarItem to="/logistics/inbox" icon={<FaInbox />} text="Inbox" />
          <SidebarItem to="/logistics/notifications" icon={<FaBell />} text="Notifications" />
          <SidebarItem to="/logistics/transactions" icon={<FaCreditCard />} text="Transactions" />
          
          {/* Settings Section */}
          <p className="text-gray-500 text-xs font-semibold mt-3 mb-3">Settings</p>
          <SidebarItem to="/logistics/settings" icon={<FaCog />} text="Settings" />
        </nav>

        {/* User Profile */}
        <div className="mt-auto border-t border-gray-300 pt-5 flex items-center">
          <img
            src="https://randomuser.me/api/portraits/men/1.jpg"
            alt="User"
            className="w-10 h-10 rounded-full mr-3"
          />
          <div>
            <p className="text-sm font-semibold leading-loose">Chukka Uzo</p>
            <p className="text-xs text-gray-500">Account settings</p>
          </div>
        </div>

        {/* Logout Button */}
        <button className="mt-6 bg-gradient-to-r from-[#A056FE] to-[#E44ED8] text-white py-3 px-4 rounded-md w-full flex items-center justify-center">
          <FaSignOutAlt className="mr-2" /> Log Out
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 md:hidden z-30"
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  );
};

const SidebarItem = ({ to, icon, text }) => (
  <NavLink
    to={to}
    end
    className={({ isActive }) =>
      `flex items-center py-3 px-3 rounded-md cursor-pointer transition-colors ${
        isActive
          ? "text-[#9847FE] bg-[#f3e8ff] font-medium"
          : "text-[#B0AFAF] hover:bg-gray-200 hover:text-[#9847FE]"
      }`
    }
  >
    <span className="mr-3">{icon}</span> {text}
  </NavLink>
);

export default Sidebar;
