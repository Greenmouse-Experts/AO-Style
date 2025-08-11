import { useQuery } from "@tanstack/react-query";
import UserService from "../../services/api/users";
import ProductService from "../../services/api/products";
import MarketService from "../../services/api/market";
import FabricService from "../../services/api/fabric";

function useGetAdminFabricProduct(params) {
  const { isLoading, isFetching, data, isError, refetch, isPending } = useQuery(
    {
      queryKey: ["get-adminfabric-product", params],
      queryFn: () => FabricService.getAdminFabricProduct(params),
      keepPreviousData: true,
      onSuccess: (data) => {
        console.log("🏢 ADMIN FABRIC PRODUCT API RESPONSE:", data);
        console.log("🏢 Admin Fabric Product Data:", data?.data);
        console.log("🏢 Admin Fabric Product Params:", params);
      },
      onError: (error) => {
        console.error("❌ ADMIN FABRIC PRODUCT API ERROR:", error);
        console.error("❌ Admin Fabric Product Error Params:", params);
      },
    },
  );

  // Also log the final processed data
  if (data?.data) {
    console.log("🏢 PROCESSED ADMIN FABRIC DATA:", data.data);
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

export default useGetAdminFabricProduct;
