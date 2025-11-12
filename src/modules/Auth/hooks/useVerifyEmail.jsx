import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import AuthService from "../../../services/api/auth";
import useToast from "../../../hooks/useToast";

const useVerifyEmail = () => {
  const { toastError, toastSuccess } = useToast();
  const navigate = useNavigate();

  const { isPending, mutate: verifyEmailMutate } = useMutation({
    mutationFn: (payload) => AuthService.verifyEmail(payload),
    mutationKey: ["verify-email"],
    onSuccess(data) {
      toastSuccess(data?.data?.message);
      localStorage.removeItem("verifyemail");

      // Set a flag to indicate user just completed signup verification
      // This will be used by the login flow to check for cart data
      localStorage.setItem("just_verified", "true");

      navigate("/login");
    },
    onError: (error) => {
      if (!navigator.onLine) {
        toastError("No internet connection. Please check your network.");
        return;
      }

      toastError(error?.data?.message);
    },
  });
  return { isPending, verifyEmailMutate };
};

export default useVerifyEmail;
