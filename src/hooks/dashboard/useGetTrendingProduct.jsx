import { useQuery } from "@tanstack/react-query";
import UserService from "../../services/api/users";
import ProductService from "../../services/api/products";
import MarketService from "../../services/api/market";
import DashboardService from "../../services/api/dashboard";

function useGetTrendingProduct(params) {
  const { isLoading, isFetching, data, isError, refetch, isPending } = useQuery(
    {
      queryKey: ["trending-product", params],
      queryFn: () => DashboardService.getTrendingFabric(params),
      onSuccess: (data) => {
        console.log("🔥 TRENDING PRODUCTS API RESPONSE:", data);
        console.log("🔥 Trending Products Data:", data?.data);
        console.log("🔥 Trending Products Params:", params);
      },
      onError: (error) => {
        console.error("❌ TRENDING PRODUCTS API ERROR:", error);
        console.error("❌ Trending Products Error Params:", params);
      },
    },
  );

  // Also log the final processed data
  if (data?.data) {
    console.log("🔥 PROCESSED TRENDING PRODUCTS DATA:", data.data);
  }

  return {
    isLoading,
    isFetching,
    data: data?.data,
    isError,
    isPending,
    refetch,
  };
}

export default useGetTrendingProduct;
