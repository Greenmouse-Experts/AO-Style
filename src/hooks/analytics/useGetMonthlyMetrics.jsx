import { useQuery } from "@tanstack/react-query";
import AnalyticsService from "../../services/api/analytics";

function useVendorMonthlyMetrics() {
  const { isLoading, isFetching, data, isError, refetch, isPending } = useQuery(
    {
      queryKey: ["vendormetrics-summary"],
      queryFn: () => AnalyticsService.getVendorMetrics(),
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

export default useVendorMonthlyMetrics;
