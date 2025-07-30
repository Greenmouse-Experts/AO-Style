import { useMutation } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import AuthService from "../../../services/api/auth";
import useToast from "../../../hooks/useToast";
import useSessionManager from "../../../hooks/useSessionManager";

const useSignIn = (email, resendCodeMutate) => {
  const { toastError, toastSuccess } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const { setAuthData } = useSessionManager();

  const redirectPath = new URLSearchParams(location.search).get("redirect");

  const pendingProduct = localStorage.getItem("pendingProduct");

  const parsedProduct = JSON.parse(pendingProduct);

  const { isPending, mutate: signinMutate } = useMutation({
    mutationFn: (payload) => AuthService.signinUser(payload),
    mutationKey: ["user-login"],
    onSuccess(data) {
      if (
        (data?.data?.data?.role === "owner-super-administrator" ||
          data?.data?.data?.role === "owner-administrator") &&
        currentPath == "/admin/login"
      ) {
        toastSuccess(data?.data?.message);
        // Cookies.set("token", data?.data?.accessToken);
        Cookies.set("adminToken", data?.data?.accessToken);

        // Store auth data in session manager
        setAuthData({
          accessToken: data?.data?.accessToken,
          refreshToken: data?.data?.refreshToken,
          refreshTokenExpiry: data?.data?.refreshTokenExpiry,
        });

        navigate("/admin", { replace: true });
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

        // Store auth data in session manager
        setAuthData({
          accessToken: data?.data?.accessToken,
          refreshToken: data?.data?.refreshToken,
          refreshTokenExpiry: data?.data?.refreshTokenExpiry,
        });

        if (data?.data?.data?.role === "fabric-vendor") {
          navigate(redirectPath ?? "/fabric", {
            state: { info: parsedProduct },
            replace: true,
          });
          Cookies.set("currUserUrl", "fabric");
        }
        if (data?.data?.data?.role === "fashion-designer") {
          navigate(redirectPath ?? "/tailor", {
            state: { info: parsedProduct },
            replace: true,
          });
          Cookies.set("currUserUrl", "tailor");
        }
        if (data?.data?.data?.role === "logistics-agent") {
          navigate(redirectPath ?? "/logistics", {
            state: { info: parsedProduct },
            replace: true,
          });
          Cookies.set("currUserUrl", "logistics");
        }
        if (data?.data?.data?.role === "user") {
          navigate(redirectPath ?? "/customer", {
            state: { info: parsedProduct },
            replace: true,
          });
          Cookies.set("currUserUrl", "customer");
        }
        if (data?.data?.data?.role === "market-representative") {
          navigate(redirectPath ?? "/sales", {
            state: { info: parsedProduct },
            replace: true,
          });
          Cookies.set("currUserUrl", "sales");
        }
      } else {
        navigate("/admin/login");
      }
    },
    onError: (error) => {
      if (!navigator.onLine) {
        toastError("No internet connection. Please check your network.");
        return;
      }
      toastError(error?.data?.message);
      if (error?.data?.message === "Your email address has not been verified") {
        resendCodeMutate(
          {
            email: email,
            allowOtp: true,
          },
          {
            onSuccess: () => {
              localStorage.setItem("verifyemail", email);
              navigate("/verify-account");
            },
          },
        );
      }
    },
  });
  return { isPending, signinMutate };
};

export default useSignIn;
