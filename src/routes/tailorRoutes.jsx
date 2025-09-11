import TailorLayout from "../layouts/dashboard/tailor";
import TailorDashboard from "../modules/Pages/tailorDashboard";
import Cataloging from "../modules/Pages/tailorDashboard/Catalog";
import AddStyle from "../modules/Pages/tailorDashboard/AddStyle";
import OrdersTable from "../modules/Pages/tailorDashboard/Orders";
import OrdersDetails from "../modules/Pages/tailorDashboard/OrdersDetails";
import NotificationPage from "../modules/Pages/tailorDashboard/NotificationPage";
import Settings from "../modules/Pages/tailorDashboard/Settings";
import InboxPage from "../modules/Pages/tailorDashboard/Inbox";
import NotificationPageUpdate from "../modules/Pages/adminDashboard/NotificationPageUpdate";
import Coupons from "../modules/Pages/Coupons";
import Subscriptions from "../modules/Pages/tailorDashboard/Subscription";
import TailorAnnouncementsPage from "../modules/Pages/tailorDashboard/Announcements";
import TransactionPage from "../modules/Pages/tailorDashboard/TransactionPage";

// import TransactionPage from "../modules/Pages/fabricDashboard/TransactionPage";
import ViewTailorStyle from "../modules/Pages/tailorDashboard/ViewStyle";
import ViewTransactionDetail from "../components/ViewTransactionDetails";

export const tailorRoute = [
  {
    path: "/tailor",
    element: <TailorLayout />,
    children: [
      {
        index: true,
        element: <TailorDashboard />,
      },
      {
        path: "/tailor/catalog",
        element: <Cataloging />,
      },
      {
        path: "/tailor/catalog-add-style",
        element: <AddStyle />,
      },
      {
        path: "/tailor/catalog-view-style/:id",
        element: <ViewTailorStyle />,
      },
      {
        path: "/tailor/coupons",
        element: <Coupons />,
      },

      {
        path: "/tailor/subscription",
        element: <Subscriptions />,
      },

      {
        path: "/tailor/catalog-edit-style",
        element: <AddStyle />,
      },
      {
        path: "/tailor/orders",
        element: <OrdersTable />,
      },
      {
        path: "/tailor/orders/orders-details/:id",
        element: <OrdersDetails />,
      },
      {
        path: "/tailor/inbox",
        element: <InboxPage />,
      },
      {
        path: "/tailor/announcements",
        element: <TailorAnnouncementsPage />,
      },
      {
        path: "/tailor/notifications",
        element: <NotificationPageUpdate />,
      },
      {
        path: "/tailor/transactions",
        element: <TransactionPage />,
      },
      {
        path: "/tailor/transactions/:id",
        element: <ViewTransactionDetail />,
      },
      {
        path: "/tailor/settings",
        element: <Settings />,
      },
      // Add other tailor dashboard routes here
    ],
  },
];
