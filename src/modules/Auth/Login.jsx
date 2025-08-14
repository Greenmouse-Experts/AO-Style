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
import { useQueryClient } from "@tanstack/react-query";
import useSessionManager from "../../hooks/useSessionManager";
import { useCarybinUserStore } from "../../store/carybinUserStore";

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
  const queryClient = useQueryClient();
  const { setAuthData } = useSessionManager();
  const { setCaryBinUser } = useCarybinUserStore();

  const { isPending, signinMutate } = useSignIn(values.email, resendCodeMutate);

  const { isPending: googleIsPending, googleSigninMutate } = useGoogleSignin();

  const pendingProduct = localStorage.getItem("pendingProduct");

  let parsedProduct = null;
  try {
    parsedProduct = pendingProduct ? JSON.parse(pendingProduct) : null;
  } catch (error) {
    console.log("⚠️ Invalid pending product data:", error);
    parsedProduct = null;
  }

  // Debug utilities for testing
  const clearGoogleAuthData = () => {
    console.log("🧹 Clearing all Google auth data");
    sessionStorage.removeItem("googleToken");
    sessionStorage.removeItem("googleProvider");
    Cookies.remove("token");
    Cookies.remove("currUserUrl");
    console.log("✅ Google auth data cleared");
  };

  // Debug utilities for testing
  const checkAllCookies = () => {
    console.log("🍪🍪🍪 COOKIE DEBUG REPORT 🍪🍪🍪");
    console.log("token:", Cookies.get("token"));
    console.log("currUserUrl:", Cookies.get("currUserUrl"));
    console.log("approvedByAdmin:", Cookies.get("approvedByAdmin"));
    console.log("adminToken:", Cookies.get("adminToken"));
    console.log("All cookies:", document.cookie);
    console.log("🍪🍪🍪 END COOKIE REPORT 🍪🍪🍪");
  };

  const checkSessionManager = () => {
    console.log("📦📦📦 SESSION MANAGER DEBUG 📦📦📦");
    const sessionData = sessionStorage.getItem("authData");
    console.log("Session storage authData:", sessionData);
    try {
      const parsed = JSON.parse(sessionData || "{}");
      console.log("Parsed session data:", parsed);
    } catch (e) {
      console.log("Session data parse error:", e);
    }
    console.log("📦📦📦 END SESSION REPORT 📦📦📦");
  };

  // Expose debug functions to window for testing
  if (typeof window !== "undefined") {
    window.clearGoogleAuth = clearGoogleAuthData;
    window.checkCookies = checkAllCookies;
    window.checkSession = checkSessionManager;
    window.debugAuth = () => {
      checkAllCookies();
      checkSessionManager();
    };
  }

  const googleSigninHandler = (cred) => {
    console.log("🔓 Google login initiated");

    const payload = {
      token: cred?.credential,
      provider: "google",
      role: "user",
      action_type: "SIGNIN", // API requires both role and action_type
    };

    console.log("📤 Sending Google login request");

    googleSigninMutate(payload, {
      onSuccess: (data) => {
        console.log("✅ Google login successful");

        // Handle both nested (data.data) and flat response structures
        const responseData = data?.data || data;
        const statusCode = data?.statusCode || responseData?.statusCode;
        const message = data?.message || responseData?.message;
        const accessToken = data?.accessToken || responseData?.accessToken;
        const userData = responseData?.data || responseData;
        const userRole = userData?.role;

        // Check if user already exists (login successful)
        if (
          accessToken &&
          (message === "Login successful" || statusCode === 200)
        ) {
          console.log("🔑 Setting authentication tokens");

          // Set token cookie (like normal signin)
          Cookies.set("token", accessToken);

          // Set approvedByAdmin cookie (like normal signin)
          Cookies.set(
            "approvedByAdmin",
            userData?.profile?.approved_by_admin || "true",
          );

          // Store auth data in session manager (like normal signin)
          // For Google SSO, set a long expiry since no refresh token
          const googleSSOExpiry = new Date();
          googleSSOExpiry.setDate(googleSSOExpiry.getDate() + 7); // 7 days from now

          setAuthData({
            accessToken: accessToken,
            refreshToken: responseData?.refreshToken || null,
            refreshTokenExpiry:
              responseData?.refreshTokenExpiry || googleSSOExpiry.toISOString(),
            user: userData, // Include user data
            userType: userRole, // Include role
          });

          // Update user store immediately for components like CartPage
          console.log("🔄 Google Auth: Updating user store with:", userData);
          setCaryBinUser(userData);

          // Refresh user profile query to ensure fresh data
          queryClient.invalidateQueries(["get-user-profile"]);

          // Add small delay to ensure cookies are set before navigation
          setTimeout(() => {
            console.log("🔄 Redirecting to customer dashboard");
            const targetPath = redirectPath ?? "/customer";

            navigate(targetPath, {
              state: { info: parsedProduct },
              replace: true,
            });
            Cookies.set("currUserUrl", "customer");
            console.log("✅ Login complete");
          }, 1000);
        }
        // Handle signup success (user doesn't exist, need to register)
        else if (
          message &&
          (message.toLowerCase().includes("user") ||
            message.toLowerCase().includes("not found")) &&
          statusCode === 200
        ) {
          console.log("🆕 New user detected - redirecting to signup");

          // Store Google token for signup process
          sessionStorage.setItem("googleToken", cred?.credential);
          sessionStorage.setItem("googleProvider", "google");

          // Redirect to signup page
          const signupUrl = `/auth/register${redirectPath ? `?redirect=${redirectPath}` : ""}`;
          navigate(signupUrl, { replace: true });
        }
      },
      onError: (error) => {
        console.log("❌ Google login error:", error?.data?.message);
      },
    });
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
              onError={() => {
                console.log("Login Failed");
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
