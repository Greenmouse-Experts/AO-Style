import { useQuery } from "@tanstack/react-query";
import OrderService from "../../services/api/order";

function useFetchVendorOrders(params) {
  const { isLoading, isFetching, data, isError, refetch, isPending } = useQuery(
    {
      queryKey: ["fetch-vendor-orders", params],
      queryFn: () => OrderService.getFetchVendorOrder(params),
      keepPreviousData: true,
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

export default useFetchVendorOrders;
