import { useQuery } from "@tanstack/react-query";
import AnalyticsService from "../../services/api/analytics";

function useGetCustomerUpcomingDeliveriesStat() {
  const { isLoading, isFetching, data, isError, refetch, isPending } = useQuery(
    {
      queryKey: ["customer-upcomingdeliveries-stats"],
      queryFn: () => AnalyticsService.getCustomerUpcomingDeliveries(),
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

export default useGetCustomerUpcomingDeliveriesStat;
