import AdminLayout from "../layouts/super-dashboard/admin";
import AdminDashboard from "../modules/Pages/adminDashboard";
// CUSTOMER COMPONENTS
import Customers from "../modules/Pages/adminDashboard/customer/Customer";
import ViewCustomer from "../modules/Pages/adminDashboard/customer/ViewCustomer";
// TAILOR COMPONENTS
import Tailors from "../modules/Pages/adminDashboard/tailor/Tailor";
import AddTailor from "../modules/Pages/adminDashboard/tailor/AddTailor";
import ViewTailor from "../modules/Pages/adminDashboard/tailor/ViewTailor";
// FABRIC COMPONENTS
import FabricVendor from "../modules/Pages/adminDashboard/fabric/Fabric";
import AddFabric from "../modules/Pages/adminDashboard/fabric/AddFabric";
import AddFabricVendor from "../modules/Pages/adminDashboard/fabric/AddFabricVendor";
// ANALTICS COMPONENTS
import AnalyticsPage from "../modules/Pages/adminDashboard/reports/Analytics";
// MESSAGE COMPONENTS
import InboxPage from "../modules/Pages/adminDashboard/messages/Inbox";
import SalesRep from "../modules/Pages/adminDashboard/Sales";
import Logistics from "../modules/Pages/adminDashboard/Logistics";
import SubAdmin from "../modules/Pages/adminDashboard/SubAdmin";
import Market from "../modules/Pages/adminDashboard/market/Market";
import FabricCategory from "../modules/Pages/adminDashboard/FabricCategory";
import StyleCategories from "../modules/Pages/adminDashboard/StyleCategories";
import Orders from "../modules/Pages/adminDashboard/Orders";
import PaymentTransaction from "../modules/Pages/adminDashboard/Transactions";
import NotificationPage from "../modules/Pages/adminDashboard/NotificationPage";
import Settings from "../modules/Pages/adminDashboard/Settings";

export const adminRoutes = [
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
      // Customer Routes
      {
        path: '/admin/customers',
        element: <Customers />,
      },
      {
        path: '/admin/view-customers',
        element: <ViewCustomer />,
      },
      // Tailor Routes
      {
        path: '/admin/tailors',
        element: <Tailors />,
      },
      {
        path: '/admin/tailor/add-tailor',
        element: <AddTailor />,
      },
      {
        path: '/admin/tailor/view-tailor',
        element: <ViewTailor />,
      },
      // Fabric Routes
      {
        path: '/admin/fabric-vendor',
        element: <FabricVendor />,
      },

      // Message Routes
      {
        path: '/admin/messages',
        element: <InboxPage />,
      },

      // Analytics Routes
      {
        path: '/admin/analytics',
        element: <AnalyticsPage />,
    },
      // Add More Routes Here

      {
        path: '/admin/fabric/add-fabric-vendor',
        element: <AddFabricVendor />,
      },
      {
        path: '/admin/fabric/add-fabric',
        element: <AddFabric />,
      },
      {
        path: '/admin/sales-rep',
        element: <SalesRep />,
      },
      {
        path: '/admin/logistics',
        element: <Logistics />,
      },
      {
        path: '/admin/sub-admins',
        element: <SubAdmin />,
      },
      {
        path: '/admin/markets',
        element: <Market />,
      },
      {
        path: '/admin/fabrics',
        element: <FabricCategory />,
      },
      {
        path: '/admin/styles',
        element: <StyleCategories />,
      },
      {
        path: '/admin/orders',
        element: <Orders />,
      },
      {
        path: '/admin/transactions',
        element: <PaymentTransaction />,
      },
      {
        path: '/admin/notifications',
        element: <NotificationPage />,
      },
      {
        path: '/admin/settings',
        element: <Settings />,
      },
      
      
      // Add other admin dashboard routes here
    ],
  },
];
