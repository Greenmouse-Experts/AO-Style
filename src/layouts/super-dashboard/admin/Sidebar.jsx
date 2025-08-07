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
  FaQuestionCircle,
} from "react-icons/fa";
import { GiScissors } from "react-icons/gi";
import { Link } from "react-router-dom";
import { useCarybinAdminUserStore } from "../../../store/carybinAdminUserStore";
import { useEffect } from "react";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const handleClick = () => {
    window.scrollTo(0, 0);
    if (window.innerWidth < 768) {
      toggleSidebar();
    }
  };

  const { carybinAdminUser } = useCarybinAdminUserStore();

  const superAdmin =
    carybinAdminUser?.role?.role_id === "owner-super-administrator" ||
    carybinAdminUser?.role?.name === "super-admin" ||
    carybinAdminUser?.role === "super-admin";

  console.log("Admin User Data:", carybinAdminUser);
  console.log("Is Super Admin:", superAdmin);
  console.log("Role ID:", carybinAdminUser?.role?.role_id);
  console.log("Role Name:", carybinAdminUser?.role?.name);
  console.log("Role:", carybinAdminUser?.role);

  const hasFabricRole =
    carybinAdminUser?.admin_role?.role?.includes("fabric-vendor");
  const hasUserRole = carybinAdminUser?.admin_role?.role?.includes("user");
  const hasTailorRole =
    carybinAdminUser?.admin_role?.role?.includes("fashion-designer");
  const hasMarketrepRole = carybinAdminUser?.admin_role?.role?.includes(
    "market-representative",
  );
  const hasLogisticsRole =
    carybinAdminUser?.admin_role?.role?.includes("logistics-agent");
  // useEffect(() => {
  //   console.log(carybinAdminUser, carybinAdminUser, "admins");
  // }, []);
  return (
    <div className="relative">
      {/* Sidebar */}
      <div
        className={`fixed lg:relative top-0 left-0 h-screen bg-gradient p-5 flex flex-col transition-transform duration-300 z-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:w-72 w-64`}
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

          {superAdmin}

          {superAdmin || hasLogisticsRole ? (
            <SidebarItem
              to="/admin/logistics"
              icon={<FaTruck />}
              text="Logistics"
              onClick={handleClick}
            />
          ) : null}

          {superAdmin && (
            <SidebarItem
              to="/admin/sub-admins"
              icon={<FaUserShield />}
              text="Sub Admins"
              onClick={handleClick}
            />
          )}

          {/* Fallback: If no specific role detected but user is in admin panel, show basic user management */}
          {!superAdmin &&
            !hasUserRole &&
            !hasTailorRole &&
            !hasFabricRole &&
            !hasMarketrepRole &&
            !hasLogisticsRole && (
              <>
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
              </>
            )}

          {/* categories Section */}
          <div className="mb-4">
            <h3 className="text-xs text-white uppercase mb-2">Categories</h3>
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

          {/* products Section */}
          <div className="mb-4">
            <h3 className="text-xs text-white uppercase mb-2">Products</h3>
            <SidebarItem
              to="/admin/fabrics-products"
              icon={<FaTshirt />}
              text="Fabrics"
              onClick={handleClick}
            />
            <SidebarItem
              to="/admin/styles-products"
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
              to="/admin/coupon"
              icon={<FaStore />}
              text="Coupon"
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
              to="/admin/faq"
              icon={<FaQuestionCircle />}
              text="FAQ Management"
              onClick={handleClick}
            />
            <SidebarItem
              to="/admin/jobs"
              icon={<FaBriefcase />}
              text="Jobs Management"
              onClick={handleClick}
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
            {carybinAdminUser?.profile?.profile_picture ? (
              <img
                src={carybinAdminUser?.profile?.profile_picture ?? null}
                alt="Admin"
                className="w-12 h-12 mx-auto rounded-full mb-2"
              />
            ) : (
              <>
                {" "}
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-white">
                  {carybinAdminUser?.name?.charAt(0).toUpperCase() || "?"}
                </div>
              </>
            )}
            <p className="text-sm font-semibold">{carybinAdminUser?.name}</p>
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
