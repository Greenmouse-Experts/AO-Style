import { useQuery } from "@tanstack/react-query";
import CaryBinApi from "../../services/CarybinBaseUrl";
/**
 * API Helper to fetch all orders.
 * This uses the pattern shown in the image: 
 * getAllOrder = (params) => CaryBinApi.get('/orders', { params })
 */
const getAllOrder = (params) => {
  return CaryBinApi.get("/orders/fetch", { params });
};

/**
 * React query hook for getting all orders with query params.
 * Usage:
 *   const { data, isLoading, ... } = useGetOrder({ user_id: "abc", status: "DELIVERED" })
 * This hook will pass the object as query params (?user_id=abc&status=DELIVERED)
 */
function useGetOrder(params = {}) {
  const { isLoading, isFetching, data, isError, refetch, isPending } = useQuery({
    queryKey: ["get-all-order", params],
    queryFn: () => getAllOrder(params).then(res => res.data),
  });

  return {
    isLoading,
    isFetching,
    data: data?.data,
    isError,
    isPending,
    refetch,
  };
}

export default useGetOrder;