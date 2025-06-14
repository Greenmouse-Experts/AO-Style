import LogisticsLayout from "../layouts/dashboard/logistics";
import LogisticsDashboard from "../modules/Pages/logisticsDashboard";
import OrderRequested from "../modules/Pages/logisticsDashboard/OrderRequested";
import Orders from "../modules/Pages/logisticsDashboard/Orders";
import TransactionPage from "../modules/Pages/logisticsDashboard/TransactionPage";
import NotificationPage from "../modules/Pages/logisticsDashboard/NotificationPage";
import InboxPage from "../modules/Pages/logisticsDashboard/Inbox";
import Settings from "../modules/Pages/logisticsDashboard/Settings";

export const logisticsRoutes = [
  {
    path: "/logistics",
    element: <LogisticsLayout />,
    children: [
      {
        index: true,
        element: <LogisticsDashboard />,
      },
      {
        path: "/logistics/orders",
        element: <Orders />,
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
        path: "/logistics/notifications",
        element: <NotificationPage />,
      },
      {
        path: "/logistics/settings",
        element: <Settings />,
      },
      // Add other logistics dashboard routes here
    ],
  },
];
