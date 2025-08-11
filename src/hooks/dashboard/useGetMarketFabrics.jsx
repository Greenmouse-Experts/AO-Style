import { useQuery } from "@tanstack/react-query";
import UserService from "../../services/api/users";
import ProductService from "../../services/api/products";
import MarketService from "../../services/api/market";
import DashboardService from "../../services/api/dashboard";

function useGetMarketFabric(params) {
  const { isLoading, isFetching, data, isError, refetch, isPending } = useQuery(
    {
      queryKey: ["get-marketplace-fabric", params],
      queryFn: () => DashboardService.getMarketPlaceFabric(params),
      onSuccess: (data) => {
        console.log("🏪 MARKETPLACE FABRIC API RESPONSE:", data);
        console.log("🏪 Marketplace Fabric Data:", data?.data);
        console.log("🏪 Marketplace Fabric Params:", params);
      },
      onError: (error) => {
        console.error("❌ MARKETPLACE FABRIC API ERROR:", error);
        console.error("❌ Marketplace Fabric Error Params:", params);
      },
    },
  );

  // Also log the final processed data
  if (data?.data) {
    console.log("🏪 PROCESSED MARKETPLACE FABRIC DATA:", data.data);
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

export default useGetMarketFabric;
