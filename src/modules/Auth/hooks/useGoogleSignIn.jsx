import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import AuthService from "../../../services/api/auth";
import useToast from "../../../hooks/useToast";

const useGoogleSignin = () => {
  const { toastError, toastSuccess } = useToast();
  //   const navigate = useNavigate();

  const { isPending, mutate: googleSigninMutate } = useMutation({
    mutationFn: (payload) => {
      console.log("🚀🚀🚀 GOOGLE AUTH HOOK: Making API call 🚀🚀🚀");
      console.log("Payload being sent to API:", payload);
      console.log("API endpoint: AuthService.googleSignin");
      return AuthService.googleSignin(payload);
    },
    mutationKey: ["googlesignin-user"],
    onSuccess(data) {
      console.log("🎉🎉🎉 GOOGLE AUTH HOOK: API SUCCESS 🎉🎉🎉");
      console.log("Raw API response:", JSON.stringify(data, null, 2));

      // Handle both nested (data.data) and flat response structures
      const responseData = data?.data || data;
      const statusCode = data?.statusCode || responseData?.statusCode;
      const message = data?.message || responseData?.message;
      const accessToken = data?.accessToken || responseData?.accessToken;
      const userData = data?.data || responseData?.data;
      const userRole = userData?.role;

      console.log("Response status:", statusCode);
      console.log("Response message:", message);
      console.log("Access token present:", !!accessToken);
      console.log("User data present:", !!userData);
      console.log("User role:", userRole);
      console.log("Response data structure:");
      console.log("- data exists:", !!data);
      console.log("- statusCode:", statusCode);
      console.log("- message:", message);
      console.log("- accessToken exists:", !!accessToken);
      console.log("- userData.role exists:", !!userRole);

      toastSuccess(message || "Authentication successful");
    },
    onError: (error) => {
      console.log("💥💥💥 GOOGLE AUTH HOOK: API ERROR 💥💥💥");
      console.log("Full error object:", error);
      console.log("Error response:", error?.response);
      console.log("Error data:", error?.data);
      console.log("Error message:", error?.message);
      console.log("Error status:", error?.response?.status);
      console.log("Error status text:", error?.response?.statusText);
      console.log("Network online:", navigator.onLine);

      if (!navigator.onLine) {
        console.log("❌ Network offline detected");
        toastError("No internet connection. Please check your network.");
        return;
      }

      let errorMessage = "Google authentication failed";
      if (Array.isArray(error?.data?.message)) {
        errorMessage = error?.data?.message[0];
        console.log("❌ Array error message:", errorMessage);
      } else if (error?.data?.message) {
        errorMessage = error?.data?.message;
        console.log("❌ String error message:", errorMessage);
      } else if (error?.message) {
        errorMessage = error?.message;
        console.log("❌ General error message:", errorMessage);
      }

      console.log("❌ Final error message shown to user:", errorMessage);
      toastError(errorMessage);
    },
  });
  return { isPending, googleSigninMutate };
};

export default useGoogleSignin;
