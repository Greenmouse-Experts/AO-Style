import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import AuthService from "../../../services/api/auth";
import useToast from "../../../hooks/useToast";

const useSignIn = () => {
  const { toastError, toastSuccess } = useToast();
  const navigate = useNavigate();

  const { isPending, mutate: signinMutate } = useMutation({
    mutationFn: (payload) => AuthService.signinUser(payload),
    mutationKey: ["user-login"],
    onSuccess(data) {
      toastSuccess(data?.data?.message);
      // @ts-ignore
      Cookies.set("token", data?.data?.accessToken);

      if (data?.data?.data?.role === "owner-super-administrator") {
        navigate("/admin");
      }
    },
    onError: (error) => {
      toastError(error?.data?.message);
    },
  });
  return { isPending, signinMutate };
};

export default useSignIn;
