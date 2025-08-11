import { useQuery } from "@tanstack/react-query";
import UserService from "../../services/api/users";
import ProductService from "../../services/api/products";
import MarketService from "../../services/api/market";
import FabricService from "../../services/api/fabric";

function useGetFabricProduct(params) {
  const { isLoading, isFetching, data, isError, refetch, isPending } = useQuery(
    {
      queryKey: ["get-fabric-product", params],
      queryFn: () => FabricService.getFabricProduct(params),
      onSuccess: (data) => {
        console.log("🧵 FABRIC PRODUCT API RESPONSE:", data);
        console.log("🧵 Fabric Product Data:", data?.data);
        console.log("🧵 Fabric Product Params:", params);
      },
      onError: (error) => {
        console.error("❌ FABRIC PRODUCT API ERROR:", error);
        console.error("❌ Fabric Product Error Params:", params);
      },
    },
  );

  // Also log the final processed data
  if (data?.data) {
    console.log("🧵 PROCESSED FABRIC DATA:", data.data);
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

export default useGetFabricProduct;
