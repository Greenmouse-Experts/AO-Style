import { useMutation } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import AuthService from "../../../services/api/auth";
import useToast from "../../../hooks/useToast";

const useSignIn = () => {
  const { toastError, toastSuccess } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const { isPending, mutate: signinMutate } = useMutation({
    mutationFn: (payload) => AuthService.signinUser(payload),
    mutationKey: ["user-login"],
    onSuccess(data) {
      console.log(currentPath);

      console.log(data?.data?.data);

      if (
        data?.data?.data?.role === "owner-super-administrator" &&
        currentPath == "/admin/login"
      ) {
        toastSuccess(data?.data?.message);
        Cookies.set("token", data?.data?.accessToken);
        navigate("/admin");
      } else if (
        data?.data?.data?.role !== "owner-super-administrator" &&
        currentPath == "/admin/login"
      ) {
        navigate("/login");
      } else if (
        data?.data?.data?.role !== "owner-super-administrator" &&
        currentPath == "/login"
      ) {
        toastSuccess(data?.data?.message);
        Cookies.set("token", data?.data?.accessToken);
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
      } else {
        navigate("/admin/login");
      }

      // toastSuccess(data?.data?.message);
      // // @ts-ignore
      // Cookies.set("token", data?.data?.accessToken);
      // if (data?.data?.data?.role === "owner-super-administrator") {
      //   navigate("/admin");
      // }
      // if (data?.data?.data?.role === "fabric-vendor") {
      //   navigate("/fabric");
      // }
      // if (data?.data?.data?.role === "fashion-designer") {
      //   navigate("/tailor");
      // }
      // if (data?.data?.data?.role === "logistics-agent") {
      //   navigate("/logistics");
      // }
      // if (data?.data?.data?.role === "user") {
      //   navigate("/customer");
      // }
      // if (data?.data?.data?.role === "market-representative") {
      //   navigate("/sales");
      // }
    },
    onError: (error) => {
      toastError(error?.data?.message);
    },
  });
  return { isPending, signinMutate };
};

export default useSignIn;
