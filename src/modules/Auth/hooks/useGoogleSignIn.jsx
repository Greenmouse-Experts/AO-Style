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
      console.log("🚀 Making Google auth API call");
      return AuthService.googleSignin(payload);
    },
    mutationKey: ["googlesignin-user"],
    onSuccess(data) {
      console.log("🎉 Google auth API successful");

      // Handle both nested (data.data) and flat response structures
      const responseData = data?.data || data;
      const message = data?.message || responseData?.message;

      toastSuccess(message || "Authentication successful");
    },
    onError: (error) => {
      console.log(
        "💥 Google auth API error:",
        error?.data?.message || error?.message,
      );

      if (!navigator.onLine) {
        toastError("No internet connection. Please check your network.");
        return;
      }

      let errorMessage = "Google authentication failed";
      if (Array.isArray(error?.data?.message)) {
        errorMessage = error?.data?.message[0];
      } else if (error?.data?.message) {
        errorMessage = error?.data?.message;
      } else if (error?.message) {
        errorMessage = error?.message;
      }

      toastError(errorMessage);
    },
  });
  return { isPending, googleSigninMutate };
};

export default useGoogleSignin;
