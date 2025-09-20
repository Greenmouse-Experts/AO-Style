import { useQuery } from "@tanstack/react-query";
import MarketService from "../services/api/market";

const useGetMarkets = (options = {}) => {
  const {
    enabled = true,
    refetchInterval = false,
    staleTime = 10 * 60 * 1000, // 10 minutes
    ...queryOptions
  } = options;

  const { isLoading, isFetching, data, isError, refetch, isPending, error } =
    useQuery({
      queryKey: ["markets"],
      queryFn: () => {
        console.log("🔧 MARKETS: Fetching markets from API");
        return MarketService.getAllMarket()
          .then((response) => {
            console.log("🔧 MARKETS: API Response received");
            console.log("🔧 MARKETS: Response status:", response.status);
            console.log(
              "🔧 MARKETS: Response data:",
              JSON.stringify(response.data, null, 2),
            );
            return response;
          })
          .catch((error) => {
            console.error("🔧 MARKETS: API Error:", error);
            console.error("🔧 MARKETS: Error response:", error.response);
            throw error;
          });
      },
      enabled,
      refetchInterval,
      staleTime,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      ...queryOptions,
    });

  const markets = data?.data?.data || [];
  const hasMarkets = markets.length > 0;

  console.log("🔧 MARKETS HOOK: Processed results:");
  console.log("  - Markets:", markets);
  console.log("  - Markets count:", markets.length);
  console.log("  - Has markets:", hasMarkets);
  console.log("  - Is loading:", isLoading);
  console.log("  - Is error:", isError);

  return {
    isLoading,
    isFetching,
    data,
    isError,
    refetch,
    isPending,
    error,
    markets,
    hasMarkets,
    totalMarkets: markets.length,
  };
};

export default useGetMarkets;
