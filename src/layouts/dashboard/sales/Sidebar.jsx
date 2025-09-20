import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaStore,
  FaSignOutAlt,
  FaCommentDots,
  FaBell,
  FaCreditCard,
  FaCog,
  FaBullhorn,
  FaBoxOpen,
} from "react-icons/fa";
import { GiScissors } from "react-icons/gi";
import { useCarybinUserStore } from "../../../store/carybinUserStore";
import useToast from "../../../hooks/useToast";
import Cookies from "js-cookie";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AuthService from "../../../services/api/auth";
import sessionManager from "../../../services/SessionManager";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { carybinUser, logOut } = useCarybinUserStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { toastSuccess } = useToast();

  // Get auth data to determine if user is logged in
  const authData = sessionManager.getAuthData();
  const isLoggedIn = !!authData;

  // Helper function to check if user is admin using currUserUrl cookie
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  };

  const isAdminUser = () => {
    const userTypeUrl = getCookie("currUserUrl");
    return userTypeUrl === "admin" || userTypeUrl === "super-admin";
  };

  // Query to fetch KYC status from API
  const {
    data: kycData,
    isLoading: kycLoading,
    error: kycError,
  } = useQuery({
    queryKey: ["kyc-status"],
    queryFn: () => AuthService.getKycStatus(),
    enabled: isLoggedIn && !isAdminUser(),
    refetchInterval: 30000,
    retry: 3,
    staleTime: 10000,
  });

  const handleSignOut = () => {
    toastSuccess("Logout Successfully");
    logOut();
    Cookies.remove("token");
    window.location.replace("/login");
  };

  // Determine if sidebar should be disabled based on KYC approval status
  // Admin users should never have disabled sidebar
  const isApproved = kycData?.data?.data?.is_approved === true;
  const shouldDisableSidebar =
    !isAdminUser() && !kycLoading && !kycError && !isApproved;

  return (
    <div
      className="relative"
      style={
        shouldDisableSidebar ? { pointerEvents: "none", opacity: 0.6 } : {}
      }
    >
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
            to="/sales"
            icon={<FaHome />}
            text="Dashboard"
            toggleSidebar={toggleSidebar}
          />
          <SidebarItem
            to="/sales/my-products"
            icon={<FaBoxOpen />}
            text="View/Add Products"
            toggleSidebar={toggleSidebar}
          />
          <SidebarItem
            to="/sales/fabric-vendors"
            icon={<FaStore />}
            text="Fabric Vendors"
            toggleSidebar={toggleSidebar}
          />
          <SidebarItem
            to="/sales/fashion-designers"
            icon={<GiScissors />}
            text="Fashion Designers"
            toggleSidebar={toggleSidebar}
          />
          <SidebarItem
            to="/sales/my-products"
            icon={<FaBoxOpen />}
            text="View/Add Products"
            toggleSidebar={toggleSidebar}
          />
          <SidebarItem
            to="/sales/inbox"
            icon={<FaCommentDots />}
            text="Inbox"
            toggleSidebar={toggleSidebar}
          />
          <SidebarItem
            to="/sales/announcements"
            icon={<FaBullhorn />}
            text="Announcements"
            toggleSidebar={toggleSidebar}
          />
          <SidebarItem
            to="/sales/notifications"
            icon={<FaBell />}
            text="Notifications"
            toggleSidebar={toggleSidebar}
          />
          <SidebarItem
            to="/sales/transactions"
            icon={<FaCreditCard />}
            text="Transactions"
            toggleSidebar={toggleSidebar}
          />
          <SidebarItem
            to="/sales/settings"
            icon={<FaCog />}
            text="Settings"
            toggleSidebar={toggleSidebar}
          />
        </nav>

        {/* User Profile */}
        <Link
          to="/sales/settings"
          className="mt-auto border-t border-gray-300 pt-5 flex items-center"
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
          )}{" "}
          <div>
            <p className="text-sm text-white font-semibold leading-loose">
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
          className="mt-6 bg-gradient text-white py-3 px-4 rounded-md w-full flex items-center justify-center"
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
    onClick={() => {
      window.scrollTo(0, 0);
      toggleSidebar();
    }}
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
