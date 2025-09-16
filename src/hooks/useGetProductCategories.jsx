import { useQuery } from "@tanstack/react-query";
import CaryBinApi from "../services/CarybinBaseUrl";

const useGetProductCategories = (options = {}) => {
  const {
    enabled = true,
    refetchInterval = false,
    staleTime = 10 * 60 * 1000, // 10 minutes
    ...queryOptions
  } = options;

  const { isLoading, isFetching, data, isError, refetch, isPending, error } = useQuery({
    queryKey: ["product-categories"],
    queryFn: () => {
      console.log("🔧 CATEGORIES: Fetching product categories from API");
      return CaryBinApi.get(`/product-category`)
        .then((response) => {
          console.log("🔧 CATEGORIES: API Response received");
          console.log("🔧 CATEGORIES: Response status:", response.status);
          console.log("🔧 CATEGORIES: Response data:", JSON.stringify(response.data, null, 2));
          return response;
        })
        .catch((error) => {
          console.error("🔧 CATEGORIES: API Error:", error);
          console.error("🔧 CATEGORIES: Error response:", error.response);
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

  const categories = data?.data?.data || [];
  const hasCategories = categories.length > 0;

  console.log("🔧 CATEGORIES HOOK: Processed results:");
  console.log("  - Categories:", categories);
  console.log("  - Categories count:", categories.length);
  console.log("  - Has categories:", hasCategories);
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
    categories,
    hasCategories,
    totalCategories: categories.length,
  };
};

export default useGetProductCategories;
