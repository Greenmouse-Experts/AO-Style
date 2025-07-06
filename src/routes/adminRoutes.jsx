import AdminLayout from "../layouts/super-dashboard/admin";
import AdminDashboard from "../modules/Pages/adminDashboard";
// CUSTOMER COMPONENTS
import Customers from "../modules/Pages/adminDashboard/customer/Customer";
import ViewCustomer from "../modules/Pages/adminDashboard/customer/ViewCustomer";
// TAILOR COMPONENTS
import Tailors from "../modules/Pages/adminDashboard/tailor/Tailor";
import AddTailor from "../modules/Pages/adminDashboard/tailor/AddTailor";
import ViewTailor from "../modules/Pages/adminDashboard/tailor/ViewTailor";
// FABRIC COMPONENTS
import FabricVendor from "../modules/Pages/adminDashboard/fabric/Fabric";
import AddFabric from "../modules/Pages/adminDashboard/fabric/AddFabric";
import AddFabricVendor from "../modules/Pages/adminDashboard/fabric/AddFabricVendor";
// ANALTICS COMPONENTS
import AnalyticsPage from "../modules/Pages/adminDashboard/reports/Analytics";
// MESSAGE COMPONENTS
import InboxPage from "../modules/Pages/adminDashboard/messages/Inbox";
import SalesRep from "../modules/Pages/adminDashboard/Sales";
import ViewSales from "../modules/Pages/adminDashboard/sales-rep/ViewSales";

import Logistics from "../modules/Pages/adminDashboard/Logistics";
import SubAdmin from "../modules/Pages/adminDashboard/SubAdmin";
import AdminRole from "../modules/Pages/adminDashboard/AdminRole";
import Market from "../modules/Pages/adminDashboard/market/Market";
import FabricCategory from "../modules/Pages/adminDashboard/FabricCategory";
import StyleCategories from "../modules/Pages/adminDashboard/StyleCategories";
// ORDERS COMPONENTS
import Orders from "../modules/Pages/adminDashboard/order/Orders";
import OrderDetailsPage from "../modules/Pages/adminDashboard/order/OrderDetails";
// Subscriptions COMPONENTS
import Subscriptionpage from "../modules/Pages/adminDashboard/subscription/Subscriptions";
import PaymentTransaction from "../modules/Pages/adminDashboard/Transactions";
import Announcements from "../modules/Pages/adminDashboard/Announcements";
import NotificationPage from "../modules/Pages/adminDashboard/NotificationPage";
import Settings from "../modules/Pages/adminDashboard/Settings";
import ViewTailorDetails from "../modules/Pages/adminDashboard/tailor/ViewTailorDetails";
import ViewMarketDetails from "../modules/Pages/adminDashboard/sales-rep/ViewMarketRep";
import ViewFabricDetails from "../modules/Pages/adminDashboard/fabric/ViewFabricDetails";
import NotificationPageUpdate from "../modules/Pages/adminDashboard/NotificationPage";
import MyProducts from "../modules/Pages/fabricDashboard/MyProducts";
import AddNewProduct from "../modules/Pages/fabricDashboard/AddNewProduct";

export const adminRoutes = [
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
      // Customer Routes
      {
        path: "/admin/customers",
        element: <Customers />,
      },
      {
        path: "/admin/view-customers/:id",
        element: <ViewCustomer />,
      },
      // Tailor Routes
      {
        path: "/admin/tailors",
        element: <Tailors />,
      },
      {
        path: "/admin/tailors/add-tailor",
        element: <AddTailor />,
      },
      {
        path: "/admin/tailors/view",
        element: <ViewTailorDetails />,
      },

      {
        path: "/admin/tailors/view-tailor/:tailorId",
        element: <ViewTailor />,
      },
      // Fabric Routes
      {
        path: "/admin/fabric-vendor",
        element: <FabricVendor />,
      },

      // Message Routes
      {
        path: "/admin/messages",
        element: <InboxPage />,
      },

      // Analytics Routes
      {
        path: "/admin/analytics",
        element: <AnalyticsPage />,
      },
      // Add More Routes Here

      {
        path: "/admin/fabric/add-fabric-vendor",
        element: <AddFabricVendor />,
      },
      {
        path: "/admin/fabric/add-fabric",
        element: <AddFabric />,
      },
      {
        path: "/admin/fabric-vendor/view",
        element: <ViewFabricDetails />,
      },
      //
      {
        path: `/admin/sales-rep`,
        element: <SalesRep />,
      },
      {
        path: "/admin/sales-rep/view-sales/:salesId",
        element: <ViewSales />,
      },

      {
        path: "/admin/sales-rep/view",
        element: <ViewMarketDetails />,
      },
      {
        path: "/admin/logistics",
        element: <Logistics />,
      },
      {
        path: "/admin/logistics/view",
        element: <ViewFabricDetails />,
      },
      {
        path: "/admin/sub-admins",
        element: <SubAdmin />,
      },
      {
        path: "/admin/markets",
        element: <Market />,
      },
      {
        path: "/admin/fabrics",
        element: <FabricCategory />,
      },
      {
        path: "/admin/fabrics-products",
        element: <MyProducts />,
      },
      {
        path: "/admin/fabric/add-product",
        element: <AddNewProduct />,
      },

      {
        path: "/admin/styles",
        element: <StyleCategories />,
      },
      // Orders Routes
      {
        path: "/admin/orders",
        element: <Orders />,
      },
      {
        path: "/admin/orders-details",
        element: <OrderDetailsPage />,
      },
      {
        path: "/admin/orders-details",
        element: <OrderDetailsPage />,
      },
      // Subscription Routes
      {
        path: "/admin/subscription",
        element: <Subscriptionpage />,
      },
      {
        path: "/admin/transactions",
        element: <PaymentTransaction />,
      },
      {
        path: "/admin/notifications",
        element: <NotificationPageUpdate />,
      },
      {
        path: "/admin/announcements",
        element: <Announcements />,
      },
      {
        path: "/admin/settings",
        element: <Settings />,
      },
      {
        path: "/admin/roles",
        element: <AdminRole />,
      },

      // Add other admin dashboard routes here
    ],
  },
];
