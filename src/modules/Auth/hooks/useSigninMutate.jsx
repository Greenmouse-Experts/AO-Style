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
      if (data?.data?.data?.role === "fabric-vendor") {
        navigate("/fabric");
      }
      if (data?.data?.data?.role === "fashion-designer") {
        navigate("/tailor");
      }
      if (data?.data?.data?.role === "logistics-agent") {
        navigate("/logistics");
      }
      if (data?.data?.data?.role === "user") {
        navigate("/customer");
      }
      if (data?.data?.data?.role === "market-representative") {
        navigate("/sales");
      }
    },
    onError: (error) => {
      toastError(error?.data?.message);
    },
  });
  return { isPending, signinMutate };
};

export default useSignIn;
