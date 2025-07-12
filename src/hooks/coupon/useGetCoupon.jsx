import { useQuery } from "@tanstack/react-query";
import FabricService from "../../services/api/fabric";
import CouponService from "../../services/api/coupon";

function useGetCoupon(params) {
  const { isLoading, isFetching, data, isError, refetch, isPending, error } =
    useQuery({
      queryKey: ["get-coupon", params],
      queryFn: () => CouponService.getAllCoupon(params),
    });

  return {
    isLoading,
    isFetching,
    data: data?.data,
    isError,
    isPending,
    refetch,
    error,
  };
}

export default useGetCoupon;
