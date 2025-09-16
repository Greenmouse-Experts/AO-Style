import FabricLayout from "../layouts/dashboard/fabric";
import FabricDashboard from "../modules/Pages/fabricDashboard";
import MyProducts from "../modules/Pages/fabricDashboard/MyProducts";
import AddNewProduct from "../modules/Pages/fabricDashboard/AddNewProduct";
import AddNewStyle from "../modules/Pages/fabricDashboard/AddNewStyle";
import Orders from "../modules/Pages/fabricDashboard/Orders";
import ShopMaterial from "../modules/Pages/fabricDashboard/ShopMaterial";
import OrdersDetails from "../modules/Pages/fabricDashboard/OrdersDetails";
import NotificationPage from "../modules/Pages/fabricDashboard/NotificationPage";
import TransactionPage from "../modules/Pages/fabricDashboard/TransactionPage";
import Settings from "../modules/Pages/fabricDashboard/Settings";
import InboxPage from "../modules/Pages/fabricDashboard/Inbox";
import NotificationPageUpdate from "../modules/Pages/adminDashboard/NotificationPageUpdate";
import Coupons from "../modules/Pages/Coupons";
import FabricAnnouncementsPage from "../modules/Pages/fabricDashboard/Announcements";
import ProtectedRoute from "../components/ProtectedRoute";
import Subscriptions from "../modules/Pages/tailorDashboard/Subscription";
import ViewFabricProduct from "../modules/Pages/fabricDashboard/ViewProduct";
import NotificationsSinglePage from "../components/notifications/NotificationsSingle";
import ViewTransactionDetail from "../components/ViewTransactionDetails";

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
        path: "/fabric/product/view-product",
        element: <ViewFabricProduct />,
      },
      {
        path: "/fabric/subscription",
        element: <Subscriptions />,
      },
      {
        path: "/fabric/add-fabric",
        element: <AddNewProduct />,
      },
      {
        path: "/fabric/edit-fabric",
        element: <AddNewProduct />,
      },
      {
        path: "/fabric/add-style",
        element: <AddNewStyle />,
      },
      {
        path: "/fabric/edit-style",
        element: <AddNewStyle />,
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
        path: "/fabric/orders/orders-details/:id",
        element: <OrdersDetails />,
      },
      {
        path: "/fabric/notifications",
        element: <NotificationPageUpdate />,
      },
      {
        path: "/fabric/notification/:id",
        element: <NotificationsSinglePage />,
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
        path: "/fabric/transactions/:id",
        element: <ViewTransactionDetail />,
      },
      {
        path: "/fabric/settings",
        element: <Settings />,
      },

      // Add other fabric dashboard routes here
    ],
  },
];
