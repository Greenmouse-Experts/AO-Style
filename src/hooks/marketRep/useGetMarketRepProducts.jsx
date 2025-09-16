import { useQuery } from "@tanstack/react-query";
import MarketRepService from "../../services/api/marketrep";

const useGetMarketRepProducts = (params, options = {}) => {
  const {
    enabled = true,
    refetchInterval = false,
    staleTime = 5 * 60 * 1000, // 5 minutes
    ...queryOptions
  } = options;

  console.log("🔧 HOOK: useGetMarketRepProducts called with params:", params);
  console.log("🔧 HOOK: useGetMarketRepProducts options:", options);

  const { isLoading, isFetching, data, isError, refetch, isPending, error } =
    useQuery({
      queryKey: ["market-rep-products", params],
      queryFn: () => {
        console.log("🔧 HOOK: QueryFn executing for market rep products");
        return MarketRepService.getMarketRepProducts(params);
      },
      enabled: enabled && !!params?.vendor_id,
      refetchInterval,
      staleTime,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      onSuccess: (data) => {
        console.log("🔧 HOOK: Query successful, raw data received:", data);
        console.log("🔧 HOOK: Data structure analysis:");
        console.log("  - Data type:", typeof data);
        console.log("  - Is array:", Array.isArray(data));
        console.log("  - Data keys:", data ? Object.keys(data) : null);
        console.log(
          "🔧 HOOK: Full data object:",
          JSON.stringify(data, null, 2),
        );
      },
      onError: (error) => {
        console.error("🔧 HOOK: Query failed with error:", error);
        console.error("🔧 HOOK: Error details:", {
          message: error.message,
          response: error.response,
          status: error.response?.status,
          data: error.response?.data,
        });
      },
      ...queryOptions,
    });

  // Log processed data
  const products = data?.data?.data || [];
  const totalProducts = data?.data?.total || 0;
  const hasProducts = products.length > 0;

  console.log("🔧 HOOK: Processed data results:");
  console.log("  - Raw data:", data);
  console.log("  - Extracted products:", products);
  console.log("  - Total products:", totalProducts);
  console.log("  - Has products:", hasProducts);
  console.log("  - Products count:", products.length);
  console.log("  - Is loading:", isLoading);
  console.log("  - Is error:", isError);
  console.log("  - Error object:", error);

  return {
    isLoading,
    isFetching,
    data,
    isError,
    refetch,
    isPending,
    error,
    products,
    totalProducts,
    hasProducts,
  };
};

export default useGetMarketRepProducts;
