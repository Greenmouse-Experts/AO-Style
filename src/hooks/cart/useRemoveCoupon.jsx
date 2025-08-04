import { useMutation, useQueryClient } from "@tanstack/react-query";
import useToast from "../useToast";
import CartService from "../../services/api/cart";

const useRemoveCoupon = () => {
  const queryClient = useQueryClient();
  const { toastError, toastSuccess } = useToast();

  const { isPending, mutate: removeCouponMutate } = useMutation({
    mutationFn: () => CartService.removeCoupon(),
    mutationKey: ["remove-coupon"],
    onSuccess(data) {
      toastSuccess(data?.data?.message || "Coupon removed successfully");
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
        toastError(error?.data?.message || "Failed to remove coupon");
      }
    },
  });

  return { isPending, removeCouponMutate };
};

export default useRemoveCoupon;
