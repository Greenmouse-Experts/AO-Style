import { useMutation, useQueryClient } from "@tanstack/react-query";
import useToast from "../useToast";
import CouponService from "../../services/api/coupon";

const useDeleteCoupon = () => {
  const queryClient = useQueryClient();

  const { toastError, toastSuccess } = useToast();

  const { isPending, mutate: deleteCouponMutate } = useMutation({
    mutationFn: (payload) => CouponService.deleteCoupon(payload),
    mutationKey: ["delete-coupon"],
    onSuccess(data) {
      toastSuccess(data?.data?.message);
      queryClient.invalidateQueries({
        queryKey: ["get-coupon"],
      });
      queryClient.invalidateQueries({
        queryKey: ["get-allcoupon"],
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
  return { isPending, deleteCouponMutate };
};

export default useDeleteCoupon;
