import Login from "../modules/Auth/Login";
import SignUp from "../modules/Auth/GetStarted";
import SignInCustomer from "../modules/Auth/SignInCustomer";
import SigInMarketRep from "../modules/Auth/SigInMarketRep";
import SignInTailorDesigner from "../modules/Auth/SignInTailor";
import SignInAsFabricVendor from "../modules/Auth/SigInFabric";
import SignInLogistics from "../modules/Auth/SignInLogistics";
import Forgot from "../modules/Auth/Forgot";
import VerifyEmail from "../modules/Auth/VerifyEmail";
import AdminLogin from "../modules/Auth/AdminLogin";
import ChangePassword from "../modules/Auth/ChangePassword";
export const authRoutes = [
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/sign-up",
    element: <SignUp />,
  },
  {
    path: "/sign-in-as-customer",
    element: <SignInCustomer />,
  },
  {
    path: "/sign-in-as-market-rep",
    element: <SigInMarketRep />,
  },
  {
    path: "/sign-in-as-tailor-designer",
    element: <SignInTailorDesigner />,
  },
  {
    path: "/sign-in-as-fabric-vendor",
    element: <SignInAsFabricVendor />,
  },
  {
    path: "/sign-in-as-logistics",
    element: <SignInLogistics />,
  },
  {
    path: "/forgot-password",
    element: <Forgot />,
  },
  {
    path: "/auth/change-password",
    element: <ChangePassword />,
  },

  {
    path: "/verify-account",
    element: <VerifyEmail />,
  },
  {
    path: "/admin/login",
    element: <AdminLogin />,
  },
];
