import SalesLayout from "../layouts/dashboard/sales";
import SalesDashboard from "../modules/Pages/salesDashboard";
import FabricVendorPage from "../modules/Pages/salesDashboard/FabricVendorPage";
import AddFabricVendorPage from "../modules/Pages/salesDashboard/AddFabricVendorPage";
import FashionDesigners from "../modules/Pages/salesDashboard/FashionDesigners";
import AddTailorDesigners from "../modules/Pages/salesDashboard/AddTailor";
import TransactionPages from "../modules/Pages/salesDashboard/TransactionPage";
import NotificationPages from "../modules/Pages/salesDashboard/NotificationPage";
import SettingPages from "../modules/Pages/salesDashboard/Settings";
import InboxPage from "../modules/Pages/salesDashboard/Inbox";
import NotificationPageUpdate from "../modules/Pages/adminDashboard/NotificationPageUpdate";
import ViewVendorDetails from "../modules/Pages/salesDashboard/ViewVendorDetails";
import ViewTransactionDetail from "../components/ViewTransactionDetails";

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
        path: "/sales/view-vendor/:id",
        element: <ViewVendorDetails />,
      },
      {
        path: "/sales/fabric-vendors",
        element: <FabricVendorPage />,
      },
      {
        path: "/sales/add-fabric-vendors",
        element: <AddFabricVendorPage />,
      },
      {
        path: "/sales/fashion-designers",
        element: <FashionDesigners />,
      },
      {
        path: "/sales/inbox",
        element: <InboxPage />,
      },
      {
        path: "/sales/add-fashion-designers",
        element: <AddFabricVendorPage />,
      },
      {
        path: "/sales/transactions",
        element: <TransactionPages />,
      },
      {
        path: "/sales/transactions/:id",
        element: <ViewTransactionDetail />,
      },
      {
        path: "/sales/notifications",
        element: <NotificationPageUpdate />,
      },
      {
        path: "/sales/settings",
        element: <SettingPages />,
      },
      // Add other sales dashboard routes here
    ],
  },
];
