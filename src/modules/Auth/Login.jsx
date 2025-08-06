import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import useSignIn from "./hooks/useSigninMutate";
import { useFormik } from "formik";
import useResendCode from "./hooks/useResendOtp";
import { GoogleLogin } from "@react-oauth/google";
import useToast from "../../hooks/useToast";
import useGoogleSignin from "./hooks/useGoogleSignIn";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const initialValues = {
  email: "",
  password: "",
};

export default function SignInCustomer() {
  useEffect(() => {
    // Push a dummy state so that user can't go back
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      // Block back/forward navigation
      window.history.pushState(null, "", window.location.href);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const [showPassword, setShowPassword] = useState(false);
  const redirectPath = new URLSearchParams(location.search).get("redirect");

  const { isPending: resendCodeIsPending, resendCodeMutate } = useResendCode();
  const { toastError } = useToast();

  const {
    handleSubmit,
    touched,
    errors,
    values,
    handleChange,
    // setFieldError,
  } = useFormik({
    initialValues: initialValues,
    validateOnChange: false,
    validateOnBlur: false,
    enableReinitialize: true,
    onSubmit: (val) => {
      if (!navigator.onLine) {
        toastError("No internet connection. Please check your network.");
        return;
      }
      signinMutate(val);
    },
  });

  const navigate = useNavigate();

  const { isPending, signinMutate } = useSignIn(values.email, resendCodeMutate);

  const { isPending: googleIsPending, googleSigninMutate } = useGoogleSignin();

  const pendingProduct = localStorage.getItem("pendingProduct");

  const parsedProduct = JSON.parse(pendingProduct);

  const googleSigninHandler = (cred) => {
    console.log(
      "🔐 Login: Google signin initiated",
      cred?.credential ? "Token received" : "No token",
    );

    if (!cred?.credential) {
      toastError("Google authentication failed. No credential received.");
      return;
    }

    // Store redirect path for the hook to use
    if (redirectPath) {
      sessionStorage.setItem("redirectAfterAuth", redirectPath);
    }

    const payload = {
      token: cred?.credential,
      provider: "google",
      action_type: "SIGNIN",
    };

    // The improved hook now handles all success/error logic
    googleSigninMutate(payload);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient">
      <div className="max-w-lg w-full bg-white rounded-lg p-8">
        <div className="flex justify-center mb-6">
          <Link to="/">
            <img
              src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1742964300/AoStyle/CARYBIN_TRANSPARENT_1_ujbdei.png"
              alt="OAStyles Logo"
              className="h-20"
            />
          </Link>
        </div>
        <h2 className="text-2xl font-medium text-black mb-4">Login</h2>
        <p className="text-gray-500 text-sm mb-6">
          Enter your credentials to access your account
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-gray-700">Email Address</label>
          <input
            type="email"
            name={"email"}
            required
            value={values.email}
            onChange={handleChange}
            placeholder="Enter your email address"
            className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
          />

          <label className="block text-gray-700">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={values.password}
              required
              onChange={handleChange}
              name={"password"}
              placeholder="Enter your password"
              className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg pr-10"
            />
            <button
              type="button"
              className="absolute right-3 top-5 text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          <div className="flex justify-between text-sm text-purple-600">
            <Link to="/forgot-password" className="hover:underline">
              Forgot Password?
            </Link>
          </div>

          <button
            disabled={isPending || resendCodeIsPending}
            type="submit"
            className="w-full cursor-pointer bg-purple-600 text-white py-3 rounded-lg font-semibold"
          >
            {isPending || resendCodeIsPending ? "Please wait..." : "Login"}
          </button>

          <div className="text-center text-sm text-gray-600">
            Don’t have an account?{" "}
            <Link to="/sign-up" className="text-[#DB6DC0] hover:underline">
              Register Now
            </Link>
          </div>

          <div className="flex items-center justify-between my-4">
            <div className="border-b border-[#CCCCCC] w-full"></div>
            <span className="px-3 text-gray-500">Or</span>
            <div className="border-b border-[#CCCCCC] w-full"></div>
          </div>
        </form>

        <div
          role="button"
          className="flex items-center justify-center rounded-lg "
        >
          {googleIsPending ? (
            <div className="flex items-center justify-center w-full py-3 px-4 border border-gray-300 rounded-lg bg-gray-50">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 mr-3"></div>
              <span className="text-gray-600">Signing in with Google...</span>
            </div>
          ) : (
            <GoogleLogin
              size="large"
              text="signin_with"
              theme="outlined"
              onSuccess={(credentialResponse) => {
                googleSigninHandler(credentialResponse);
              }}
              onError={(error) => {
                console.error("❌ Login: Google OAuth error:", error);
                toastError(
                  "Google sign-in was cancelled or failed. Please try again.",
                );
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
