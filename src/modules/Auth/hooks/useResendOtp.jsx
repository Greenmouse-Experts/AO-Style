import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import AuthService from "../../../services/api/auth";
import useToast from "../../../hooks/useToast";

const useResendCode = () => {
  const { toastError, toastSuccess } = useToast();

  const { isPending, mutate: resendCodeMutate } = useMutation({
    mutationFn: (payload) => AuthService.resendCode(payload),
    mutationKey: ["resend-code"],
    onSuccess(data) {
      toastSuccess(data?.data?.message);
    },
    onError: (error) => {
      toastError(error?.data?.message);
    },
  });
  return { isPending, resendCodeMutate };
};

export default useResendCode;
