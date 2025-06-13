import { NavLink, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaStore,
  FaSignOutAlt,
  FaShoppingCart,
  FaInbox,
  FaBell,
  FaCreditCard,
  FaCog,
} from "react-icons/fa";
import { useCarybinUserStore } from "../../../store/carybinUserStore";
import useToast from "../../../hooks/useToast";
import Cookies from "js-cookie";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const handleClick = () => {
    window.scrollTo(0, 0);
    if (window.innerWidth < 768) {
      toggleSidebar();
    }
  };

  const navigate = useNavigate();

  const { carybinUser, logOut } = useCarybinUserStore();

  const { toastSuccess } = useToast();

  const handleSignOut = () => {
    navigate("/login");
    toastSuccess("Logout Successfully");
    logOut();
    Cookies.remove("token");
  };

  return (
    <div className="relative">
      {/* Sidebar */}
      <div
        className={`fixed md:relative top-0 left-0 h-screen bg-gradient p-5 flex flex-col transition-transform duration-300 z-40 overflow-y-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:w-72 w-64`}
      >
        {/* Logo */}
        <div className="flex justify-center">
          <NavLink to="/" onClick={handleClick}>
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
          className="w-full p-3 rounded-md border border-white text-white mb-5 mt-3 outline-none"
        />

        {/* Sidebar Links */}
        <nav className="flex-1 space-y-2">
          <SidebarItem
            to="/customer"
            icon={<FaHome />}
            text="Dashboard"
            onClick={handleClick}
          />
          <SidebarItem
            to="/customer/shop-materials"
            icon={<FaStore />}
            text="Shop Materials"
            onClick={handleClick}
          />
          <SidebarItem
            to="/customer/orders"
            icon={<FaShoppingCart />}
            text="Orders"
            onClick={handleClick}
          />
          <SidebarItem
            to="/customer/inbox"
            icon={<FaInbox />}
            text="Inbox"
            onClick={handleClick}
          />
          <SidebarItem
            to="/customer/notifications"
            icon={<FaBell />}
            text="Notifications"
            onClick={handleClick}
          />
          <SidebarItem
            to="/customer/transactions"
            icon={<FaCreditCard />}
            text="Transactions"
            onClick={handleClick}
          />
          <SidebarItem
            to="/customer/settings"
            icon={<FaCog />}
            text="Settings"
            onClick={handleClick}
          />
        </nav>

        {/* User Profile */}
        <div className="mt-auto border-t border-white pt-5 flex items-center">
          <img
            src={carybinUser?.profile?.profile_picture ?? ""}
            alt="User"
            className="w-12 h-12 rounded-full mr-3"
          />
          <div>
            <p className="text-sm font-semibold leading-loose text-white">
              {carybinUser?.name}
            </p>
            <p className="text-xs text-white">Account settings</p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={() => {
            handleSignOut();
          }}
          className="mt-6 cursor-pointer bg-gradient text-white py-3 px-4 rounded-md w-full flex items-center justify-center"
        >
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

const SidebarItem = ({ to, icon, text, onClick }) => (
  <NavLink
    to={to}
    end
    onClick={onClick}
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
