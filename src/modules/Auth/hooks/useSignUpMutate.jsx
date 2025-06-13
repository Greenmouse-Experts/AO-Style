import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import AuthService from "../../../services/api/auth";
import useToast from "../../../hooks/useToast";

const useRegister = (email, role) => {
  const { toastError, toastSuccess } = useToast();
  const navigate = useNavigate();

  const { isPending, mutate: registerMutate } = useMutation({
    mutationFn: (payload) => AuthService.registerUser(payload),
    mutationKey: ["register-user"],
    onSuccess(data) {
      toastSuccess(data?.data?.message);
      localStorage.setItem("verifyemail", email);
      // if (role === "market-representative") {
      //   return;
      // }
      navigate("/verify-account");
    },
    onError: (error) => {
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
