import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaStore,
  FaBox,
  FaBriefcase,
  FaTruck,
  FaUserShield,
  FaTshirt,
  FaPalette,
  FaShoppingCart,
  FaCreditCard,
  FaBell,
  FaEnvelope,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import { GiScissors } from "react-icons/gi";
import { Link } from "react-router-dom";
import { useCarybinUserStore } from "../../../store/carybinUserStore";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const handleClick = () => {
    window.scrollTo(0, 0);
    if (window.innerWidth < 768) {
      toggleSidebar();
    }
  };

  const { carybinUser } = useCarybinUserStore();

  return (
    <div className="relative">
      {/* Sidebar */}
      <div
        className={`fixed md:relative top-0 left-0 h-screen bg-gradient p-5 flex flex-col transition-transform duration-300 z-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:w-72 w-64`}
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {/* Logo */}
        <div className="flex justify-center mb-3">
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
            to="/admin"
            icon={<FaHome />}
            text="Dashboard"
            onClick={handleClick}
          />
          <h3 className="text-xs text-white uppercase mt-4 mb-2">
            User Management
          </h3>
          <SidebarItem
            to="/admin/customers"
            icon={<FaUsers />}
            text="Customers"
            onClick={handleClick}
          />
          <SidebarItem
            to="/admin/tailors"
            icon={<GiScissors />}
            text="Tailors / Designers"
            onClick={handleClick}
          />
          <SidebarItem
            to="/admin/fabric-vendor"
            icon={<FaBox />}
            text="Fabric Vendor"
            onClick={handleClick}
          />
          <SidebarItem
            to="/admin/sales-rep"
            icon={<FaBriefcase />}
            text="Market Rep"
            onClick={handleClick}
          />
          <SidebarItem
            to="/admin/logistics"
            icon={<FaTruck />}
            text="Logistics"
            onClick={handleClick}
          />
          <SidebarItem
            to="/admin/sub-admins"
            icon={<FaUserShield />}
            text="Admins"
            onClick={handleClick}
          />

          {/* Products Section */}
          <div className="mb-4">
            <h3 className="text-xs text-white uppercase mb-2">Products</h3>
            <SidebarItem
              to="/admin/markets"
              icon={<FaStore />}
              text="Markets"
              onClick={handleClick}
            />
            <SidebarItem
              to="/admin/fabrics"
              icon={<FaTshirt />}
              text="Fabrics"
              onClick={handleClick}
            />
            <SidebarItem
              to="/admin/styles"
              icon={<FaPalette />}
              text="Styles"
              onClick={handleClick}
            />
          </div>

          {/* More Section */}
          <div className="mb-4">
            <h3 className="text-xs text-white uppercase mb-2">More</h3>
            <SidebarItem
              to="/admin/orders"
              icon={<FaShoppingCart />}
              text="Orders"
              onClick={handleClick}
            />
            <SidebarItem
              to="/admin/subscription"
              icon={<FaStore />}
              text="Subscription"
              onClick={handleClick}
            />
            <SidebarItem
              to="/admin/transactions"
              icon={<FaCreditCard />}
              text="Payments & Transactions"
              onClick={handleClick}
            />
            <SidebarItem
              to="/admin/notifications"
              icon={<FaBell />}
              text="Notifications"
              onClick={handleClick}
            />
            <SidebarItem
              to="/admin/messages"
              icon={<FaEnvelope />}
              text="Messages"
            />
            <SidebarItem
              to="/admin/announcements"
              icon={<FaBell />}
              text="Announcements"
              onClick={handleClick}
            />
            <SidebarItem
              to="/admin/analytics"
              icon={<FaChartBar />}
              text="Reports & Analytics"
            />
            <SidebarItem
              to="/admin/settings"
              icon={<FaCog />}
              text="Settings & Configuration"
              onClick={handleClick}
            />
          </div>

          {/* Profile Section */}
          <div className="mt-auto bg-gray-100 p-4 rounded-lg text-center">
            {carybinUser?.profile?.profile_picture ? (
              <img
                src={carybinUser?.profile?.profile_picture ?? null}
                alt="Admin"
                className="w-12 h-12 mx-auto rounded-full mb-2"
              />
            ) : (
              <>
                {" "}
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-white">
                  {carybinUser?.name?.charAt(0).toUpperCase() || "?"}
                </div>
              </>
            )}
            <p className="text-sm font-semibold">{carybinUser?.name}</p>
            <p className="text-xs text-gray-500">Super Admin Dashboard</p>
            <Link to="/admin/settings">
              <button className="mt-2 text-xs bg-[#172B4D] text-white px-3 py-2 cursor-pointer rounded-md">
                Go to Profile
              </button>
            </Link>
          </div>
        </nav>
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
