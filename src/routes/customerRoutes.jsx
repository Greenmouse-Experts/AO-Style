import CustomerLayout from "../layouts/dashboard/customer";
import CustomerDashboard from "../modules/Pages/customerDashboard";
import ShopMaterial from "../modules/Pages/customerDashboard/ShopMaterial";
import HireTailor from "../modules/Pages/customerDashboard/HireTailor";
import NotificationPage from "../modules/Pages/customerDashboard/NotificationPage";
import TransactionPage from "../modules/Pages/customerDashboard/TransactionPage";
import Settings from "../modules/Pages/customerDashboard/Settings";
import Orders from "../modules/Pages/customerDashboard/Orders";
import OrdersDetails from "../modules/Pages/customerDashboard/OrdersDetails";
import InboxPage from "../modules/Pages/customerDashboard/Inbox";
import NotificationPageUpdate from "../modules/Pages/adminDashboard/NotificationPage";

export const customerRoutes = [
  {
    path: "/customer",
    element: <CustomerLayout />,
    children: [
      {
        index: true,
        element: <CustomerDashboard />,
      },
      {
        path: "/customer/shop-materials",
        element: <ShopMaterial />,
      },
      {
        path: "/customer/tailor-hiring",
        element: <HireTailor />,
      },
      {
        path: "/customer/orders",
        element: <Orders />,
      },
      {
        path: "/customer/orders/orders-details",
        element: <OrdersDetails />,
      },
      {
        path: "/customer/notifications",
        element: <NotificationPageUpdate />,
      },
      {
        path: "/customer/transactions",
        element: <TransactionPage />,
      },
      {
        path: "/customer/settings",
        element: <Settings />,
      },
      {
        path: "/customer/inbox",
        element: <InboxPage />,
      },
      // Add other customer dashboard routes here
    ],
  },
];
