import LogisticsLayout from "../layouts/dashboard/logistics";
import LogisticsDashboard from "../modules/Pages/logisticsDashboard";
import ViewOrdersLogistics from "../modules/Pages/logisticsDashboard/view-order";
import OrderRequested from "../modules/Pages/logisticsDashboard/OrderRequested";
// import Orders from "../modules/Pages/logisticsDashboard/Orders";
import NotificationPage from "../modules/Pages/logisticsDashboard/NotificationPage";
import InboxPage from "../modules/Pages/logisticsDashboard/Inbox";
import Settings from "../modules/Pages/logisticsDashboard/Settings";
import LogisticsAnnouncementsPage from "../modules/Pages/logisticsDashboard/Announcements";
import NotificationPageUpdate from "../modules/Pages/adminDashboard/NotificationPageUpdate";
import TransactionPage from "../modules/Pages/fabricDashboard/TransactionPage";

export const logisticsRoutes = [
  {
    path: "/logistics",
    element: <LogisticsLayout />,
    children: [
      {
        index: true,
        element: <LogisticsDashboard />,
      },
      // {
      //   path: "/logistics/orders",
      //   element: <Orders />,
      // },
      {
        path: "/logistics/orders/:id",
        element: <ViewOrdersLogistics />,
      },
      {
        path: "/logistics/order-requests",
        element: <OrderRequested />,
      },
      {
        path: "/logistics/transactions",
        element: <TransactionPage />,
      },
      {
        path: "/logistics/inbox",
        element: <InboxPage />,
      },
      {
        path: "/logistics/announcements",
        element: <LogisticsAnnouncementsPage />,
      },
      {
        path: "/logistics/notifications",
        element: <NotificationPageUpdate />,
      },
      {
        path: "/logistics/settings",
        element: <Settings />,
      },
      // Add other logistics dashboard routes here
    ],
  },
];
