import FabricLayout from "../layouts/dashboard/fabric";
import FabricDashboard from "../modules/Pages/fabricDashboard";
import MyProducts from "../modules/Pages/fabricDashboard/MyProducts";
import AddNewProduct from "../modules/Pages/fabricDashboard/AddNewProduct";
import Orders from "../modules/Pages/fabricDashboard/Orders";
import ShopMaterial from "../modules/Pages/fabricDashboard/ShopMaterial";
import OrdersDetails from "../modules/Pages/fabricDashboard/OrdersDetails";
import NotificationPage from "../modules/Pages/fabricDashboard/NotificationPage";
import TransactionPage from "../modules/Pages/fabricDashboard/TransactionPage";
import Settings from "../modules/Pages/fabricDashboard/Settings";
import InboxPage from "../modules/Pages/fabricDashboard/Inbox";
import NotificationPageUpdate from "../modules/Pages/adminDashboard/NotificationPage";
import Coupons from "../modules/Pages/Coupons";
import FabricAnnouncementsPage from "../modules/Pages/fabricDashboard/Announcements";
import ProtectedRoute from "../components/ProtectedRoute";
import Subscriptions from "../modules/Pages/tailorDashboard/Subscription";

export const fabricRoutes = [
  {
    path: "/fabric",
    element: (
      // <ProtectedRoute>
      <FabricLayout />
      // </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <FabricDashboard />,
      },
      {
        path: "/fabric/products",
        element: <MyProducts />,
      },
      {
        path: "/fabric/coupons",
        element: <Coupons />,
      },
      {
        path: "/fabric/subscription",
        element: <Subscriptions />,
      },
      {
        path: "/fabric/product/add-product",
        element: <AddNewProduct />,
      },
      {
        path: "/fabric/product/edit-product",
        element: <AddNewProduct />,
      },
      {
        path: "/fabric/orders",
        element: <Orders />,
      },
      {
        path: "/fabric/shop-materials",
        element: <ShopMaterial />,
      },
      {
        path: "/fabric/orders/orders-details",
        element: <OrdersDetails />,
      },
      {
        path: "/fabric/notifications",
        element: <NotificationPageUpdate />,
      },
      {
        path: "/fabric/inbox",
        element: <InboxPage />,
      },
      {
        path: "/fabric/announcements",
        element: <FabricAnnouncementsPage />,
      },
      {
        path: "/fabric/transactions",
        element: <TransactionPage />,
      },
      {
        path: "/fabric/settings",
        element: <Settings />,
      },

      // Add other fabric dashboard routes here
    ],
  },
];
