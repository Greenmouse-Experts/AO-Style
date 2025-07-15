import { useMutation, useQueryClient } from "@tanstack/react-query";
import useToast from "../useToast";
import FabricService from "../../services/api/fabric";
import CartService from "../../services/api/cart";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const useVerifyPayment = () => {
  const { toastError, toastSuccess } = useToast();

  const queryClient = useQueryClient();

  const { isPending, mutate: verifyPaymentMutate } = useMutation({
    mutationFn: (payload) => CartService.verifyPayment(payload),
    mutationKey: ["verify-payment"],
    onSuccess(data) {
      toastSuccess(data?.data?.message);

      queryClient.invalidateQueries({
        queryKey: ["get-cart"],
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

export default useVerifyPayment;
