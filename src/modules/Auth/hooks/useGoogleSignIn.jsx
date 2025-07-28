import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import AuthService from "../../../services/api/auth";
import useToast from "../../../hooks/useToast";

const useGoogleSignin = () => {
  const { toastError, toastSuccess } = useToast();
  //   const navigate = useNavigate();

  const { isPending, mutate: googleSigninMutate } = useMutation({
    mutationFn: (payload) => AuthService.googleSignin(payload),
    mutationKey: ["googlesignin-user"],
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
  return { isPending, googleSigninMutate };
};

export default useGoogleSignin;
