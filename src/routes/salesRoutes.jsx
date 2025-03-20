import SalesLayout from "../layouts/dashboard/sales";
import SalesDashboard from "../modules/Pages/salesDashboard";
import FabricVendorPage from "../modules/Pages/salesDashboard/FabricVendorPage";
import AddFabricVendorPage from "../modules/Pages/salesDashboard/AddFabricVendorPage";
import FashionDesigners from "../modules/Pages/salesDashboard/FashionDesigners";
import AddTailorDesigners from "../modules/Pages/salesDashboard/AddTailor";
import TransactionPages from "../modules/Pages/salesDashboard/TransactionPage";
import NotificationPages from "../modules/Pages/salesDashboard/NotificationPage";
import SettingPages from "../modules/Pages/salesDashboard/Settings";

export const salesRoutes = [
  {
    path: "/sales",
    element: <SalesLayout />,
    children: [
      {
        index: true,
        element: <SalesDashboard />,
      },
      {
        path: '/sales/fabric-vendors',
        element: <FabricVendorPage />,
      },
      {
        path: '/sales/add-fabric-vendors',
        element: <AddFabricVendorPage />,
      },
      {
        path: '/sales/fashion-designers',
        element: <FashionDesigners />,
      },
      {
        path: '/sales/add-fashion-designers',
        element: <AddTailorDesigners />,
      },
      {
        path: '/sales/transactions',
        element: <TransactionPages />,
      },
      {
        path: '/sales/notifications',
        element: <NotificationPages />,
      },
      {
        path: '/sales/settings',
        element: <SettingPages />,
      },
      // Add other customer dashboard routes here
    ],
  },
];
