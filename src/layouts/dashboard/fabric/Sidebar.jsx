import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaSignOutAlt,
  FaCommentDots,
  FaClipboardList,
  FaBell,
  FaCreditCard,
  FaCog,
} from "react-icons/fa";
import { MdProductionQuantityLimits } from "react-icons/md";
import { useCarybinUserStore } from "../../../store/carybinUserStore";
import useToast from "../../../hooks/useToast";
import Cookies from "js-cookie";
import { useState } from "react";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { carybinUser, logOut } = useCarybinUserStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const navigate = useNavigate();
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
        className={`fixed lg:relative top-0 left-0 h-screen bg-gradient p-5 flex flex-col transition-transform duration-300 z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:w-72 w-64`}
      >
        {/* Logo */}
        <div className="flex justify-center">
          <NavLink
            to="/"
            onClick={() => {
              window.scrollTo(0, 0);
              toggleSidebar();
            }}
          >
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
            to="/fabric"
            icon={<FaHome />}
            text="Dashboard"
            toggleSidebar={toggleSidebar}
          />
          <SidebarItem
            to="/fabric/products"
            icon={<MdProductionQuantityLimits />}
            text="Products"
            toggleSidebar={toggleSidebar}
          />
          <SidebarItem
            to="/fabric/coupons"
            icon={<MdProductionQuantityLimits />}
            text="Coupon"
            toggleSidebar={toggleSidebar}
          />

          <SidebarItem
            to="/fabric/orders"
            icon={<FaClipboardList />}
            text="Orders"
            toggleSidebar={toggleSidebar}
          />
          <SidebarItem
            to="/fabric/inbox"
            icon={<FaCommentDots />}
            text="Inbox"
            toggleSidebar={toggleSidebar}
          />
          <SidebarItem
            to="/fabric/notifications"
            icon={<FaBell />}
            text="Notifications"
            toggleSidebar={toggleSidebar}
          />
          <SidebarItem
            to="/fabric/transactions"
            icon={<FaCreditCard />}
            text="Transactions"
            toggleSidebar={toggleSidebar}
          />
          <SidebarItem
            to="/fabric/settings"
            icon={<FaCog />}
            text="Settings"
            toggleSidebar={toggleSidebar}
          />
        </nav>

        {/* User Profile */}
        <Link
          to="/fabric/settings"
          className="mt-auto border-t border-white text-white pt-5 flex items-center"
        >
          {carybinUser?.profile?.profile_picture ? (
            <img
              src={carybinUser?.profile?.profile_picture ?? null}
              alt="User"
              className="w-12 h-12 rounded-full mr-3"
            />
          ) : (
            <>
              {" "}
              <div className="w-12 h-12 mr-3 cursor-pointer rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-white">
                {carybinUser?.name?.charAt(0).toUpperCase() || "?"}
              </div>
            </>
          )}
          <div>
            <p className="text-sm font-semibold leading-loose">
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
          className="mt-6 bg-gradient cursor-pointer text-white py-3 px-4 rounded-md w-full flex items-center justify-center"
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

const SidebarItem = ({ to, icon, text, toggleSidebar }) => (
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
    onClick={() => {
      window.scrollTo(0, 0);
      toggleSidebar();
    }}
  >
    <span className="mr-3">{icon}</span> {text}
  </NavLink>
);

export default Sidebar;
