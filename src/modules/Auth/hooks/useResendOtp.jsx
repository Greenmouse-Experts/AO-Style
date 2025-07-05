import { useMutation } from "@tanstack/react-query";
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
  return { isPending, resendCodeMutate };
};

export default useResendCode;
