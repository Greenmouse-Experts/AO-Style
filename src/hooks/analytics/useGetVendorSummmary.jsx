import { useQuery } from "@tanstack/react-query";
import AnalyticsService from "../../services/api/analytics";

function useVendorSummaryStat() {
  const { isLoading, isFetching, data, isError, refetch, isPending } = useQuery(
    {
      queryKey: ["vendoranalytics-summary"],
      queryFn: async () => {
        console.log("🔍 Fetching vendor analytics summary...");
        const response = await AnalyticsService.getVendorAnalyticsSummary();
        console.log("📈 Vendor Analytics Response:", response);
        console.log("💵 Total Revenue:", response?.data?.data?.total_revenue);
        console.log("📊 Analytics Data:", response?.data?.data);
        return response;
      },
    },
  );

  console.log("📈 Vendor Summary Hook State:", {
    isLoading,
    isFetching,
    isPending,
    isError,
    hasData: !!data,
    totalRevenue: data?.data?.data?.total_revenue,
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

export default useVendorSummaryStat;
