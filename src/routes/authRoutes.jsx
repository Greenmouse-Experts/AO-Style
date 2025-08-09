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
import MarketRepInvite from "../modules/Auth/MarketRepInvite";
import AuthErrorBoundary from "../components/AuthErrorBoundary";
export const authRoutes = [
  {
    path: "/login",
    element: (
      <AuthErrorBoundary>
        <Login />
      </AuthErrorBoundary>
    ),
  },
  {
    path: "/sign-up",
    element: (
      <AuthErrorBoundary>
        <SignUp />
      </AuthErrorBoundary>
    ),
  },
  {
    path: "/sign-in-as-customer",
    element: (
      <AuthErrorBoundary>
        <SignInCustomer />
      </AuthErrorBoundary>
    ),
  },
  {
    path: "/sign-in-as-market-rep",
    element: (
      <AuthErrorBoundary>
        <SigInMarketRep />
      </AuthErrorBoundary>
    ),
  },
  {
    path: "/invitation/join",
    element: (
      <AuthErrorBoundary>
        <MarketRepInvite />
      </AuthErrorBoundary>
    ),
  },

  {
    path: "/sign-in-as-tailor-designer",
    element: (
      <AuthErrorBoundary>
        <SignInTailorDesigner />
      </AuthErrorBoundary>
    ),
  },
  {
    path: "/sign-in-as-fabric-vendor",
    element: (
      <AuthErrorBoundary>
        <SignInAsFabricVendor />
      </AuthErrorBoundary>
    ),
  },
  {
    path: "/sign-in-as-logistics",
    element: (
      <AuthErrorBoundary>
        <SignInLogistics />
      </AuthErrorBoundary>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <AuthErrorBoundary>
        <Forgot />
      </AuthErrorBoundary>
    ),
  },
  {
    path: "/auth/change-password",
    element: (
      <AuthErrorBoundary>
        <ChangePassword />
      </AuthErrorBoundary>
    ),
  },

  {
    path: "/verify-account",
    element: (
      <AuthErrorBoundary>
        <VerifyEmail />
      </AuthErrorBoundary>
    ),
  },
  {
    path: "/admin/login",
    element: (
      <AuthErrorBoundary>
        <AdminLogin />
      </AuthErrorBoundary>
    ),
  },
];
