import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaStore,
  FaSignOutAlt,
  FaShoppingCart,
  FaInbox,
  FaBell,
  FaCreditCard,
  FaCog,
  FaBullhorn,
} from "react-icons/fa";
import { useCarybinUserStore } from "../../../store/carybinUserStore";
import useToast from "../../../hooks/useToast";
import Cookies from "js-cookie";
import { useState } from "react";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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
    logOut();
    Cookies.remove("token");
    toastSuccess("Logout Successfully");
    window.location.replace("/login");
  };

  return (
    <div className="relative">
      {/* Sidebar */}
      <div
        className={`fixed lg:relative top-0 left-0 h-screen bg-gradient p-5 flex flex-col transition-transform duration-300 z-40 overflow-y-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:w-72 w-64`}
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
            text="Buy Fabrics"
            onClick={handleClick}
          />
          <SidebarItem
            to="/customer/shop-styles"
            icon={<FaStore />}
            text="Select Styles"
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
            to="/customer/announcements"
            icon={<FaBullhorn />}
            text="Announcements"
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
        <Link
          to={"/customer/settings"}
          className="mt-auto border-t border-white pt-5 flex items-center"
        >
          {carybinUser?.profile?.profile_picture ? (
            <img
              src={carybinUser?.profile?.profile_picture}
              alt="User"
              className="w-12 h-12 rounded-full mr-3"
            />
          ) : (
            <>
              <div className="w-12 h-12 mr-3 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-white">
                {carybinUser?.name?.charAt(0).toUpperCase() || "?"}
              </div>
            </>
          )}
          <div>
            <p className="text-sm font-semibold leading-loose text-white">
              {carybinUser?.name}
            </p>
            <p className="text-xs text-white">Account settings</p>
          </div>
        </Link>

        {/* Logout Button */}
        <button
          onClick={() => {
            setIsAddModalOpen(true);
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
