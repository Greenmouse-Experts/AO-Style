import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import useToast from "../../../hooks/useToast";
import AuthService from "../../../services/api/auth";

const useForgotPassword = () => {
  const { toastError, toastSuccess } = useToast();
  const navigate = useNavigate();

  const { isPending, mutate: forgotPasswordMutate } = useMutation({
    mutationFn: (payload) => AuthService.forgotPassword(payload),
    mutationKey: ["forgot-password"],
    onSuccess(data) {
      toastSuccess(data?.data?.message);

      // navigate("/auth/change-password");
    },
    onError: (error) => {
      if (!navigator.onLine) {
        toastError("No internet connection. Please check your network.");
        return;
      }

      if (Array.isArray(error?.data?.message)) {
        toastError(error?.data?.message[0]);
      } else {
        toastError(error?.data?.message);
      }
    },
  });
  return { isPending, forgotPasswordMutate };
};

export default useForgotPassword;
