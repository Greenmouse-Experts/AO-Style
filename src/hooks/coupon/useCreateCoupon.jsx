import { useMutation, useQueryClient } from "@tanstack/react-query";
import useToast from "../useToast";
import FabricService from "../../services/api/fabric";
import CouponService from "../../services/api/coupon";

const useCreateCoupon = (business_id) => {
  const queryClient = useQueryClient();

  const { toastError, toastSuccess } = useToast();

  const { isPending, mutate: createCouponMutate } = useMutation({
    mutationFn: (payload) => CouponService.createCoupon(payload, business_id),
    mutationKey: ["create-coupon"],
    onSuccess(data) {
      toastSuccess(data?.data?.message);
      queryClient.invalidateQueries({
        queryKey: ["get-coupon"],
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
  return { isPending, createCouponMutate };
};

export default useCreateCoupon;
