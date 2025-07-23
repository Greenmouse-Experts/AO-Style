import { useQuery } from "@tanstack/react-query";
import AnalyticsService from "../../services/api/analytics";

function useGetCustomerRecentOrdersStat() {
  const { isLoading, isFetching, data, isError, refetch, isPending } = useQuery(
    {
      queryKey: ["customer-recentorders-stats"],
      queryFn: () => AnalyticsService.getCustomerRecentOrders(),
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

export default useGetCustomerRecentOrdersStat;
