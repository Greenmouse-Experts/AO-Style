import TailorLayout from "../layouts/dashboard/tailor";
import TailorDashboard from "../modules/Pages/tailorDashboard";


export const tailorRoutes = [
  {
    path: "/tailor",
    element: <TailorLayout />,
    children: [
      {
        index: true,
        element: <TailorDashboard />,
      },
    //   {
    //     path: '/sales/fabric-vendors',
    //     element: <FabricVendorPage />,
    //   },
      
      // Add other tailor dashboard routes here
    ],
  },
];
