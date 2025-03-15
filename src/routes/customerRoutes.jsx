import CustomerLayout from "../layouts/dashboard/customer";
import CustomerDashboard from "../modules/Pages/customerDashboard";
import ShopMaterial from "../modules/Pages/customerDashboard/ShopMaterial";
import HireTailor from "../modules/Pages/customerDashboard/HireTailor";
import NotificationPage from "../modules/Pages/customerDashboard/NotificationPage";
import TransactionPage from "../modules/Pages/customerDashboard/TransactionPage";
import Settings from "../modules/Pages/customerDashboard/Settings";

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
        path: '/customer/shop-materials',
        element: <ShopMaterial />,
      },
      {
        path: '/customer/tailor-hiring',
        element: <HireTailor />,
      },
      {
        path: '/customer/notifications',
        element: <NotificationPage />,
      },
      {
        path: '/customer/transactions',
        element: <TransactionPage />,
      },
      {
        path: '/customer/settings',
        element: <Settings />,
      },
      // Add other customer dashboard routes here
    ],
  },
];
