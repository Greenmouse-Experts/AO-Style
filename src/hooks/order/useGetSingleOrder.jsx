import { useQuery } from "@tanstack/react-query";
import AnalyticsService from "../../services/api/analytics";
import OrderService from "../../services/api/order";

function useGetAllOrder(params) {
  const { isLoading, isFetching, data, isError, refetch, isPending } = useQuery(
    {
      queryKey: ["get-all-order", params],
      queryFn: () => OrderService.getAllOrder(params),
    }
  );

  return {
    isLoading,
    isFetching,
    data: data?.data,
    isError,
    isPending,
    refetch,
  };
}

export default useGetAllOrder;
