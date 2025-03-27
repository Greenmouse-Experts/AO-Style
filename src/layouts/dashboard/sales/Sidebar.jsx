import { NavLink } from "react-router-dom";
import {
  FaHome, FaStore, FaSignOutAlt , FaShoppingCart, FaInbox, FaBell, FaCreditCard, FaCog
} from "react-icons/fa";
import { GiScissors } from "react-icons/gi";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <div className="relative">
      {/* Sidebar */}
      <div
        className={`fixed md:relative top-0 left-0 h-screen bg-[#280C70] p-5 flex flex-col transition-transform duration-300 z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:w-72 w-64`}
      >
        {/* Logo */}
        <div className="flex justify-center">
          <NavLink to="/">
            <img
              src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1743094475/AoStyle/CARYBIN_TRANSPARENT_crm6rl.png"
              alt="Carybin Logo"
              className="h-28 w-auto"
            />
          </NavLink>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search for..."
          className="w-full p-3 rounded-md border text-white border-[#fff] mb-5 mt-3 outline-none"
        />

        {/* Sidebar Links */}
        <nav className="flex-1 space-y-2">
          <SidebarItem to="/sales" icon={<FaHome />} text="Dashboard" />
          <SidebarItem to="/sales/fabric-vendors" icon={<FaStore />} text="Fabric Vendors" />
          <SidebarItem to="/sales/fashion-designers" icon={<GiScissors />} text="Fashion Designers" />
          <SidebarItem to="/sales/notifications" icon={<FaBell />} text="Notifications" />
          <SidebarItem to="/sales/transactions" icon={<FaCreditCard />} text="Transactions" />
          <SidebarItem to="/sales/settings" icon={<FaCog />} text="Settings" />
        </nav>
        {/* User Profile */}
        <div className="mt-auto border-t border-gray-300 pt-5 flex items-center">
          <img
            src="https://randomuser.me/api/portraits/men/1.jpg"
            alt="User"
            className="w-12 h-12 rounded-full mr-3"
          />
          <div>
            <p className="text-sm text-white font-semibold leading-loose">Chukka Uzo</p>
            <p className="text-xs text-white">Account settings</p>
          </div>
        </div>

        {/* Logout Button */}
        <button className="mt-6 bg-gradient text-white py-3 px-4 rounded-md w-full flex items-center justify-center">
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
          ? "text-[#9847FE] bg-[#f3e8ff] font-normal"
          : "text-white hover:bg-gray-200 hover:text-[#9847FE]"
      }`
    }
    
  >
    <span className="mr-3">{icon}</span> {text}
  </NavLink>
);


export default Sidebar;
