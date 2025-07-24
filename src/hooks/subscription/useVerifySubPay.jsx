import { useMutation, useQueryClient } from "@tanstack/react-query";
import useToast from "../useToast";
import FabricService from "../../services/api/fabric";
import CartService from "../../services/api/cart";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import SubscriptionService from "../../services/api/subscription";

const useVerifySubPay = () => {
  const { toastError, toastSuccess } = useToast();

  const queryClient = useQueryClient();

  const { isPending, mutate: verifyPaymentMutate } = useMutation({
    mutationFn: (payload) => SubscriptionService.verifySubPayment(payload),
    mutationKey: ["verify-subpayment"],
    onSuccess(data) {
      toastSuccess(data?.data?.message);

      queryClient.invalidateQueries({
        queryKey: ["get-user-subscription"],
      });
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
  return { isPending, verifyPaymentMutate };
};

export default useVerifySubPay;
