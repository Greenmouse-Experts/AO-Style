import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import AuthService from "../../../services/api/auth";
import useToast from "../../../hooks/useToast";
import sessionManager from "../../../services/SessionManager";
import { useCarybinUserStore } from "../../../store/carybinUserStore";
import useSessionManager from "../../../hooks/useSessionManager";

const useGoogleSignin = () => {
  const { toastError, toastSuccess } = useToast();
  const navigate = useNavigate();
  const { setCaryBinUser } = useCarybinUserStore();
  const { setAuthData } = useSessionManager();
  const queryClient = useQueryClient();

  // Helper function to handle role-based navigation
  const handleRoleBasedNavigation = (role, redirectPath, parsedProduct) => {
    console.log("🔀 Google Auth: Handling navigation for role:", role);

    const roleRoutes = {
      user: { route: "/customer", cookieValue: "customer" },
      "fabric-vendor": { route: "/fabric", cookieValue: "fabric" },
      "fashion-designer": { route: "/tailor", cookieValue: "tailor" },
      "logistics-agent": { route: "/logistics", cookieValue: "logistics" },
      "market-representative": { route: "/sales", cookieValue: "sales" },
    };

    const userRoute = roleRoutes[role];
    if (userRoute) {
      const finalPath = redirectPath ?? userRoute.route;
      console.log("✅ Google Auth: Navigating to:", finalPath);

      navigate(finalPath, {
        state: { info: parsedProduct },
        replace: true,
      });
      Cookies.set("currUserUrl", userRoute.cookieValue);
    } else {
      console.warn("⚠️ Google Auth: Unknown user role:", role);
      toastError("Unknown user role. Please contact support.");
    }
  };

  const { isPending, mutate: googleSigninMutate } = useMutation({
    mutationFn: (payload) => {
      console.log(
        "🚀 Google Auth: Starting authentication with payload:",
        payload,
      );
      return AuthService.googleSignin(payload);
    },
    mutationKey: ["googlesignin-user"],
    onSuccess(data) {
      console.log("✅ Google Auth: Success response:", data);

      try {
        // Validate response structure
        if (!data?.data?.accessToken) {
          throw new Error("Invalid response: Missing access token");
        }

        const responseData = data.data;
        const userData = responseData.data || responseData;

        console.log("📊 Google Auth: Response structure:", {
          hasAccessToken: !!responseData.accessToken,
          hasRefreshToken: !!responseData.refreshToken,
          userRole: userData.role,
          userId: userData.id,
          rawUserData: userData,
          roleType: typeof userData.role,
        });

        // Fix role object issue - ensure role is a string
        let userRole = userData.role;
        if (typeof userRole === "object" && userRole !== null) {
          console.warn(
            "⚠️ Google Auth: Role is an object, extracting string value:",
            userRole,
          );
          userRole =
            userRole.name ||
            userRole.value ||
            userRole.role ||
            String(userRole);
        }
        console.log(
          "🔧 Google Auth: Processed role:",
          userRole,
          typeof userRole,
        );

        // Use SessionManager for proper token management with user data
        setAuthData({
          accessToken: responseData.accessToken,
          refreshToken: responseData.refreshToken || null,
          refreshTokenExpiry: responseData.refreshTokenExpiry || null,
          user: userData, // Include full user data
          userType: userRole, // Include processed role as string
        });

        // Also set the main token cookie for backward compatibility
        Cookies.set("token", responseData.accessToken);

        // Set approvedByAdmin cookie for the user
        Cookies.set(
          "approvedByAdmin",
          userData?.profile?.approved_by_admin || "true",
        );

        // Populate the user store with the complete user data
        // Populate the user store with the complete user data
        const userStoreData = {
          data: {
            data: {
              ...userData,
              role: userRole, // Ensure role is a string
            },
          },
        };
        setCaryBinUser(userStoreData);

        console.log("✅ Google Auth: User data stored in store:", {
          userId: userData.id,
          userRole: userData.role,
          userName: userData.name,
          userEmail: userData.email,
        });

        // Trigger profile refetch to ensure user data is up to date
        console.log("🔄 Google Auth: Triggering profile refetch");
        queryClient.invalidateQueries(["get-user-profile"]);

        // Also refetch other user-related data
        queryClient.invalidateQueries(["kyc-status"]);
        queryClient.invalidateQueries(["get-cart"]);

        // Small delay to ensure token is properly set before navigation
        setTimeout(() => {
          // Get navigation data
          const pendingProduct = localStorage.getItem("pendingProduct");
          let parsedProduct = null;

          try {
            parsedProduct = pendingProduct ? JSON.parse(pendingProduct) : null;
          } catch (error) {
            console.warn(
              "⚠️ Google Auth: Invalid pending product data:",
              error,
            );
          }

          // Get redirect path from location state or session storage
          const redirectPath =
            sessionStorage.getItem("redirectAfterAuth") ||
            window.history.state?.from?.pathname;

          // Clear redirect path after use
          sessionStorage.removeItem("redirectAfterAuth");

          // Handle role-based navigation with processed role
          if (userRole) {
            console.log("🚀 Google Auth: Navigating with role:", userRole);
            handleRoleBasedNavigation(userRole, redirectPath, parsedProduct);
          } else {
            console.error("❌ Google Auth: No user role found in response");
            toastError("User role not found. Please contact support.");
          }
        }, 500); // 500ms delay

        // Show success message
        const message =
          responseData.message || "Successfully signed in with Google";
        toastSuccess(message);
      } catch (error) {
        console.error(
          "❌ Google Auth: Error processing success response:",
          error,
        );
        toastError(
          "Authentication succeeded but user data processing failed. Please try logging in manually.",
        );
      }
    },
    onError: (error) => {
      console.error("❌ Google Auth: Authentication failed:", error);

      // Network connectivity check
      if (!navigator.onLine) {
        toastError(
          "No internet connection. Please check your network and try again.",
        );
        return;
      }

      // Handle different error types
      let errorMessage = "Google authentication failed. Please try again.";

      if (error?.response?.status === 401) {
        errorMessage =
          "Google authentication failed. Please check your credentials.";
      } else if (error?.response?.status === 403) {
        errorMessage = "Access denied. Your account may not be authorized.";
      } else if (error?.response?.status >= 500) {
        errorMessage =
          "Server error during authentication. Please try again later.";
      } else if (error?.data?.message) {
        // Handle API error messages
        if (Array.isArray(error.data.message)) {
          errorMessage = error.data.message[0];
        } else {
          errorMessage = error.data.message;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toastError(errorMessage);

      // Log detailed error for debugging
      console.error("📊 Google Auth: Detailed error info:", {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        message: error?.message,
        stack: error?.stack,
      });
    },
  });

  return { isPending, googleSigninMutate };
};

export default useGoogleSignin;
