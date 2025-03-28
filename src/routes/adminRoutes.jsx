import AdminLayout from "../layouts/super-dashboard/admin";
import AdminDashboard from "../modules/Pages/adminDashboard";
import Customers from "../modules/Pages/adminDashboard/Customer";
import Tailors from "../modules/Pages/adminDashboard/Tailor";
import FabricVendor from "../modules/Pages/adminDashboard/Fabric";
import SalesRep from "../modules/Pages/adminDashboard/Sales";
import Logistics from "../modules/Pages/adminDashboard/Logistics";
import SubAdmin from "../modules/Pages/adminDashboard/SubAdmin";

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
      
      // Add other admin dashboard routes here
    ],
  },
];
