import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import useToast from "../useToast";
import ProductService from "../../services/api/products";
import CouponService from "../../services/api/coupon";

const useEditCoupon = () => {
  const queryClient = useQueryClient();

  const { toastError, toastSuccess } = useToast();

  const { isPending, mutate: editCouponMutate } = useMutation({
    mutationFn: (payload) => CouponService.updateCouponProduct(payload),
    mutationKey: ["edit-coupon"],
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
  return { isPending, editCouponMutate };
};

export default useEditCoupon;
