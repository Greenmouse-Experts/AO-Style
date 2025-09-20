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
import MarketRepAnnouncements from "../modules/Pages/salesDashboard/Announcements";
import MyProducts from "../modules/Pages/salesDashboard/MyProducts";
import AddFabric from "../modules/Pages/salesDashboard/AddFabric";
import AddStyle from "../modules/Pages/salesDashboard/AddStyle";
import EditFabric from "../modules/Pages/salesDashboard/EditFabric";
import EditStyle from "../modules/Pages/salesDashboard/EditStyle";

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
      { path: "/sales/my-products", element: <MyProducts /> },
      {
        path: "/sales/add-fabric-vendors",
        element: <AddFabricVendorPage />,
      },
      {
        path: "/sales/add-fabric",
        element: <AddFabric />,
      },
      {
        path: "/sales/add-style",
        element: <AddStyle />,
      },
      { path: "/sales/edit-fabric/:id", element: <EditFabric /> },
      { path: "/sales/edit-style/:id", element: <EditStyle /> },
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
      {
        path: "/sales/announcements",
        element: <MarketRepAnnouncements />,
      },
    ],
  },
];
