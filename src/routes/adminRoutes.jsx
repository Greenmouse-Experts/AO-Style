import AdminLayout from "../layouts/super-dashboard/admin";
import AdminDashboard from "../modules/Pages/adminDashboard";
import Customers from "../modules/Pages/adminDashboard/Customer";
import Tailors from "../modules/Pages/adminDashboard/Tailor";
import FabricVendor from "../modules/Pages/adminDashboard/Fabric";
import SalesRep from "../modules/Pages/adminDashboard/Sales";
import Logistics from "../modules/Pages/adminDashboard/Logistics";
import SubAdmin from "../modules/Pages/adminDashboard/SubAdmin";
import Market from "../modules/Pages/adminDashboard/Market";
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
      {
        path: '/admin/customers',
        element: <Customers />,
      },
      {
        path: '/admin/tailors',
        element: <Tailors />,
      },
      {
        path: '/admin/fabric-vendor',
        element: <FabricVendor />,
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
