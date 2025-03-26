import FabricLayout from "../layouts/dashboard/fabric";
import FabricDashboard from "../modules/Pages/fabricDashboard";
import MyProducts from "../modules/Pages/fabricDashboard/MyProducts";
import AddNewProduct from "../modules/Pages/fabricDashboard/AddNewProduct";
import Orders from "../modules/Pages/fabricDashboard/Orders";
import OrdersDetails from "../modules/Pages/fabricDashboard/OrdersDetails";
import NotificationPage from "../modules/Pages/fabricDashboard/NotificationPage";
import TransactionPage from "../modules/Pages/fabricDashboard/TransactionPage";
import Settings from "../modules/Pages/fabricDashboard/Settings";

export const fabricRoutes = [
  {
    path: "/fabric",
    element: <FabricLayout />,
    children: [
      {
        index: true,
        element: <FabricDashboard />,
      },
      {
        path: '/fabric/products',
        element: <MyProducts />,
      },
      {
        path: '/fabric/product/add-product',
        element: <AddNewProduct />,
      },
      {
        path: '/fabric/orders',
        element: <Orders />,
      },
      {
        path: '/fabric/orders/orders-details',
        element: <OrdersDetails />,
      },
      {
        path: '/fabric/notifications',
        element: <NotificationPage />,
      },
      {
        path: '/fabric/transactions',
        element: <TransactionPage />,
      },
      {
        path: '/fabric/settings',
        element: <Settings />,
      },
    
      // Add other fabric dashboard routes here
    ],
  },
];
