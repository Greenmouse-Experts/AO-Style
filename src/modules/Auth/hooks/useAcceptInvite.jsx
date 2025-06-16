import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import AuthService from "../../../services/api/auth";
import useToast from "../../../hooks/useToast";

const useAcceptInvite = () => {
  const { toastError, toastSuccess } = useToast();
  const navigate = useNavigate();

  const { isPending, mutate: acceptInviteMutate } = useMutation({
    mutationFn: (payload) => AuthService.acceptInvite(payload),
    mutationKey: ["accept-invite"],
    onSuccess(data) {
      toastSuccess(data?.data?.message);
      // if (role === "market-representative") {
      //   return;
      // }
      navigate("/login");
    },
    onError: (error) => {
      if (Array.isArray(error?.data?.message)) {
        toastError(error?.data?.message[0]);
      } else {
        toastError(error?.data?.message);
      }
    },
  });
  return { isPending, acceptInviteMutate };
};

export default useAcceptInvite;
