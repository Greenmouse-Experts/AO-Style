import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaStar,
  FaSignOutAlt,
  FaCommentDots,
  FaClipboardList,
  FaBell,
  FaCreditCard,
  FaCog,
  FaBullhorn,
} from "react-icons/fa";
import { useCarybinUserStore } from "../../../store/carybinUserStore";
import useToast from "../../../hooks/useToast";
import Cookies from "js-cookie";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const handleClick = () => {
    window.scrollTo(0, 0);
    if (window.innerWidth < 768) {
      toggleSidebar(); // Close sidebar only on mobile
    }
  };

  const navigate = useNavigate();

  const { toastSuccess } = useToast();

  const { carybinUser, logOut } = useCarybinUserStore();

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
            to="/tailor"
            icon={<FaHome />}
            text="Dashboard"
            onClick={handleClick}
          />
          <SidebarItem
            to="/tailor/catalog"
            icon={<FaStar />}
            text="My Catalog"
            onClick={handleClick}
          />
          <SidebarItem
            to="/tailor/coupons"
            icon={<FaClipboardList />}
            text="Coupon"
            onClick={handleClick}
          />
          <SidebarItem
            to="/tailor/orders"
            icon={<FaClipboardList />}
            text="Orders"
            onClick={handleClick}
          />
          <SidebarItem
            to="/tailor/inbox"
            icon={<FaCommentDots />}
            text="Inbox"
            onClick={handleClick}
          />
          <SidebarItem
            to="/tailor/announcements"
            icon={<FaBullhorn />}
            text="Announcements"
            onClick={handleClick}
          />
          <SidebarItem
            to="/tailor/notifications"
            icon={<FaBell />}
            text="Notifications"
            onClick={handleClick}
          />
          <SidebarItem
            to="/tailor/transactions"
            icon={<FaCreditCard />}
            text="Transactions"
            onClick={handleClick}
          />
          <SidebarItem
            to="/tailor/settings"
            icon={<FaCog />}
            text="Settings"
            onClick={handleClick}
          />
        </nav>

        {/* User Profile */}
        <Link
          to={"/tailor/settings"}
          className="mt-auto border-t border-white pt-5 flex items-center"
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
            <p className="text-sm font-semibold text-white leading-loose">
              {carybinUser?.name}
            </p>
            <p className="text-xs text-white">Account settings</p>
          </div>
        </Link>

        {/* Logout Button */}
        <button
          onClick={() => {
            handleSignOut();
          }}
          className="mt-6 bg-gradient text-white py-3 cursor-pointer px-4 rounded-md w-full flex items-center justify-center"
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
