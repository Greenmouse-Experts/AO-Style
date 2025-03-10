// import Login from "../modules/Auth/login";
import SignUp from "../modules/Auth/GetStarted";
import SignInCustomer from "../modules/Auth/SignInCustomer";
import SignInTailorDesigner from "../modules/Auth/SignInTailor";
import SignInAsFabricVendor from "../modules/Auth/SigInFabric";
// import VerifyEmail from "../modules/Auth/verifyEmail";
// import AdminLogin from "../modules/SuperAdmin";

export const authRoutes = [
    // {
    //     path: '/login',
    //     element: <Login />,
    // },
    {
        path: '/sign-up',
        element: <SignUp />,
    },
    {
        path: '/sign-in-as-customer',
        element: <SignInCustomer />,
    },
    {
        path: '/sign-in-as-tailor-designer',
        element: <SignInTailorDesigner />,
    },
    {
        path: '/sign-in-as-fabric-vendor',
        element: <SignInAsFabricVendor />,
    },
    // {
    //     path: '/verify-account',
    //     element: <VerifyEmail />
    // },
    // {
    //     path: "auth/admin/login",
    //     element: <AdminLogin />
    // },
];
