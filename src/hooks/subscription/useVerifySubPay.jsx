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
      toastSuccess(data?.data?.message || "Payment verified successfully!");

      // Invalidate all subscription-related queries
      queryClient.invalidateQueries({
        queryKey: ["get-user-subscription"],
      });
      queryClient.invalidateQueries({
        queryKey: ["get-subscription"],
      });
      queryClient.invalidateQueries({
        queryKey: ["free-plan"],
      });
      queryClient.invalidateQueries({
        queryKey: ["user-profile"],
      });

      // Refetch queries to immediately update UI
      setTimeout(() => {
        queryClient.refetchQueries({
          queryKey: ["get-user-subscription"],
        });
        queryClient.refetchQueries({
          queryKey: ["free-plan"],
        });
      }, 500);
    },
    onError: (error) => {
      if (!navigator.onLine) {
        toastError("No internet connection. Please check your network.");
        return;
      }

      if (Array.isArray(error?.response?.data?.message)) {
        toastError(error?.response?.data?.message[0]);
      } else if (error?.response?.data?.message) {
        toastError(error?.response?.data?.message);
      } else if (error?.data?.message) {
        toastError(error?.data?.message);
      } else {
        toastError("Payment verification failed");
      }
    },
  });
  return { isPending, verifyPaymentMutate };
};

export default useVerifySubPay;
