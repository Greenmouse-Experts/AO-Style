import { useMutation, useQueryClient } from "@tanstack/react-query";
import useToast from "../useToast";
import CartService from "../../services/api/cart";

const useApplyCoupon = () => {
  const queryClient = useQueryClient();
  const { toastError, toastSuccess } = useToast();

  const { isPending, mutate: applyCouponMutate } = useMutation({
    mutationFn: (payload) => CartService.applyCoupon(payload),
    mutationKey: ["apply-coupon"],
    onSuccess(data) {
      toastSuccess(data?.data?.message || "Coupon applied successfully");
      queryClient.invalidateQueries({
        queryKey: ["get-cart"],
      });
      queryClient.invalidateQueries({
        queryKey: ["get-cart-count"],
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
        toastError(error?.data?.message || "Failed to apply coupon");
      }
    },
  });

  return { isPending: isPending, applyCouponMutate };
};

export default useApplyCoupon;
