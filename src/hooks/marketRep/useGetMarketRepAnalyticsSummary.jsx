import { useQuery } from "@tanstack/react-query";
import MarketRepService from "../../services/api/marketrep";

const useGetMarketRepAnalyticsSummary = () => {
  const {
    data: summaryData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["market-rep-analytics-summary"],
    queryFn: async () => {
      console.log("🔧 MARKET REP ANALYTICS: Starting API call");
      const response = await MarketRepService.getMarketRepAnalyticsSummary();
      console.log(
        "🔧 MARKET REP ANALYTICS: Full API Response received",
        response,
      );
      console.log(
        "🔧 MARKET REP ANALYTICS: Response data structure",
        response.data,
      );
      console.log("🔧 MARKET REP ANALYTICS: Data properties", {
        total_vendors: response.data?.data?.total_vendors,
        total_fashion_designers: response.data?.data?.total_fashion_designers,
        total_fabric_vendors: response.data?.data?.total_fabric_vendors,
        total_commission: response.data?.data?.total_commission,
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error) => {
      console.error("🔧 MARKET REP ANALYTICS ERROR:", error);
    },
  });

  return {
    summaryData,
    isLoading,
    isError,
    error,
    refetch,
  };
};

export default useGetMarketRepAnalyticsSummary;
