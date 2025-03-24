import TailorLayout from "../layouts/dashboard/tailor";
import TailorDashboard from "../modules/Pages/tailorDashboard";
import Cataloging from "../modules/Pages/tailorDashboard/Catalog";
import OrdersTable from "../modules/Pages/tailorDashboard/Orders";
import OrdersDetails from "../modules/Pages/tailorDashboard/OrdersDetails";
import NotificationPage from "../modules/Pages/tailorDashboard/NotificationPage";
import TransactionPage from "../modules/Pages/tailorDashboard/TransactionPage";
import Settings from "../modules/Pages/tailorDashboard/Settings";

export const tailorRoutes = [
  {
    path: "/tailor",
    element: <TailorLayout />,
    children: [
      {
        index: true,
        element: <TailorDashboard />,
      },
      {
        path: '/tailor/my-catalog',
        element: <Cataloging />,
      },
      {
        path: '/tailor/orders',
        element: <OrdersTable />,
      },
      {
        path: '/tailor/orders/orders-details',
        element: <OrdersDetails />,
      },
      {
        path: '/tailor/notifications',
        element: <NotificationPage />,
      },
      {
        path: '/tailor/transactions',
        element: <TransactionPage />,
      },
      {
        path: '/tailor/settings',
        element: <Settings />,
      },
      
      // Add other tailor dashboard routes here
    ],
  },
];
