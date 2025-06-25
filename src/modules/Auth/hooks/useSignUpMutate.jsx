import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import AuthService from "../../../services/api/auth";
import useToast from "../../../hooks/useToast";

const useRegister = (email) => {
  const { toastError, toastSuccess } = useToast();
  const navigate = useNavigate();

  const { isPending, mutate: registerMutate } = useMutation({
    mutationFn: (payload) => AuthService.registerUser(payload),
    mutationKey: ["register-user"],
    onSuccess(data) {
      toastSuccess(data?.data?.message);
      localStorage.setItem("verifyemail", email);
      navigate("/verify-account");
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
  return { isPending, registerMutate };
};

export default useRegister;
