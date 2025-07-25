import { useMutation } from "@tanstack/react-query";
import useToast from "../../../hooks/useToast";
import AuthService from "../../../services/api/auth";
import { useNavigate } from "react-router-dom";

const useChangePassword = () => {
  const { toastError, toastSuccess } = useToast();
  const navigate = useNavigate();

  const { isPending, mutate: changePasswordMutate } = useMutation({
    mutationFn: (payload) => AuthService.changePassword(payload),
    mutationKey: ["change-password"],
    onSuccess(data) {
      toastSuccess(data?.data?.message);
      navigate("/login");
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
  return { isPending, changePasswordMutate };
};

export default useChangePassword;
