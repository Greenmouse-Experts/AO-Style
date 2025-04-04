import { NavLink } from "react-router-dom";
import {
  FaHome, FaUsers, FaStore, FaBox, FaBriefcase, FaTruck, FaUserShield,
  FaTshirt, FaPalette, FaShoppingCart, FaCreditCard, FaBell, FaEnvelope,
  FaChartBar, FaCog, FaSignOutAlt
} from "react-icons/fa";
import { GiScissors } from "react-icons/gi";
import { Link } from "react-router-dom";


const Sidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <div className="relative">
      {/* Sidebar */}
      <div
        className={`fixed md:relative top-0 left-0 h-screen bg-gradient p-5 flex flex-col transition-transform duration-300 z-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 ${isOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 md:w-72 w-64`}
      >
        {/* Logo */}
        <div className="flex justify-center mb-3">
          <NavLink to="/">
            <img
              src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1743094475/AoStyle/CARYBIN_TRANSPARENT_crm6rl.png"
              alt="Carybin Logo"
              className="h-28 w-auto"
            />
          </NavLink>
        </div>

        {/* Sidebar Links */}
        <nav className="flex-1 space-y-2">
          <SidebarItem to="/admin" icon={<FaHome />} text="Dashboard" />
          <h3 className="text-xs text-white uppercase  mt-4 mb-2">User Management</h3>
          <SidebarItem to="/admin/customers" icon={<FaUsers />} text="Customers" />
          <SidebarItem to="/admin/tailors" icon={<GiScissors />} text="Tailors / Designers" />
          <SidebarItem to="/admin/fabric-vendor" icon={<FaBox />} text="Fabric Vendor" />
          <SidebarItem to="/admin/sales-rep" icon={<FaBriefcase />} text="Market Rep" />
          <SidebarItem to="/admin/logistics" icon={<FaTruck />} text="Logistics" />
          <SidebarItem to="/admin/sub-admins" icon={<FaUserShield />} text="Admins" />
          {/* Products Section */}
          <div className="mb-4">
            <h3 className="text-xs text-white uppercase mb-2">Products</h3>
            <SidebarItem to="/admin/markets" icon={<FaStore />} text="Markets" />
            <SidebarItem to="/admin/fabrics" icon={<FaTshirt />} text="Fabrics" />
            <SidebarItem to="/admin/styles" icon={<FaPalette />} text="Styles" />
          </div>
          {/* More Section */}
          <div className="mb-4">
            <h3 className="text-xs text-white uppercase mb-2">More</h3>
            <SidebarItem to="/admin/orders" icon={<FaShoppingCart />} text="Orders" />
            <SidebarItem to="/admin/transactions" icon={<FaCreditCard />} text="Payments & Transactions" />
            <SidebarItem to="/admin/notifications" icon={<FaBell />} text="Notifications" />
            {/* <SidebarItem to="/admin/messages" icon={<FaEnvelope />} text="Messages" />
            <SidebarItem to="/admin/analytics" icon={<FaChartBar />} text="Reports & Analytics" /> */}
            <SidebarItem to="/admin/settings" icon={<FaCog />} text="Settings & Configuration" />
          </div>
          {/* Profile Section */}
          <div className="mt-auto bg-gray-100 p-4 rounded-lg text-center">
            <img src="https://randomuser.me/api/portraits/men/10.jpg" alt="Admin" className="w-12 h-12 mx-auto rounded-full mb-2" />
            <p className="text-sm font-semibold">OA Styles</p>
            <p className="text-xs text-gray-500">Super Admin Dashboard</p>
            <Link to="/admin/settings"><button className="mt-2 text-xs bg-[#172B4D] text-white px-3 py-2 cursor-pointer rounded-md">Go to Profile</button></Link>
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

const SidebarItem = ({ to, icon, text }) => (
  <NavLink
    to={to}
    end
    className={({ isActive }) =>
      `flex items-center py-3 px-3 rounded-md cursor-pointer transition-colors ${isActive
        ? "text-[#9847FE] bg-[#f3e8ff] font-normal"
        : "text-white hover:bg-gray-200 hover:text-[#9847FE]"
      }`
    }

  >
    <span className="mr-3">{icon}</span> {text}
  </NavLink>
);


export default Sidebar;
