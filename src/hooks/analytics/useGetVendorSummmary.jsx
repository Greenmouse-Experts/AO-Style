import { useQuery } from "@tanstack/react-query";
import AnalyticsService from "../../services/api/analytics";

function useVendorSummaryStat() {
  const { isLoading, isFetching, data, isError, refetch, isPending } = useQuery(
    {
      queryKey: ["vendoranalytics-summary"],
      queryFn: () => AnalyticsService.getVendorAnalyticsSummary(),
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

export default useVendorSummaryStat;
