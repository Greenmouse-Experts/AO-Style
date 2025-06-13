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
      navigate("/login");
    },
    onError: (error) => {
      toastError(error?.data?.message);
    },
  });
  return { isPending, verifyEmailMutate };
};

export default useVerifyEmail;
