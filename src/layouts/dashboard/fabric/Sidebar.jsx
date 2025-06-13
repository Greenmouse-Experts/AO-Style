import { NavLink, useNavigate } from "react-router-dom";
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

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { carybinUser, logOut } = useCarybinUserStore();

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
        className={`fixed md:relative top-0 left-0 h-screen bg-gradient p-5 flex flex-col transition-transform duration-300 z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:w-72 w-64`}
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

        {/* Search */}
        <input
          type="text"
          placeholder="Search for..."
          className="w-full p-3 rounded-md text-white border border-white mb-5 mt-3 outline-none"
        />

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
        <div className="mt-auto border-t border-white text-white pt-5 flex items-center">
          <img
            src={carybinUser?.profile?.profile_picture ?? ""}
            alt="User"
            className="w-12 h-12 rounded-full mr-3"
          />
          <div>
            <p className="text-sm font-semibold leading-loose">
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
