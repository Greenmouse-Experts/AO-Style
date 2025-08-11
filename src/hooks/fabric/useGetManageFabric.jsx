import { useQuery } from "@tanstack/react-query";
import UserService from "../../services/api/users";
import ProductService from "../../services/api/products";
import MarketService from "../../services/api/market";
import FabricService from "../../services/api/fabric";

function useGetAdminManageFabricProduct(params) {
  const { isLoading, isFetching, data, isError, refetch, isPending } = useQuery(
    {
      queryKey: ["get-manage-fabric-product", params],
      queryFn: () => FabricService.getManageFabricProduct(params),
      onSuccess: (data) => {
        console.log("🔧 MANAGE FABRIC PRODUCT API RESPONSE:", data);
        console.log("🔧 Manage Fabric Product Data:", data?.data);
        console.log("🔧 Manage Fabric Product Params:", params);
      },
      onError: (error) => {
        console.error("❌ MANAGE FABRIC PRODUCT API ERROR:", error);
        console.error("❌ Manage Fabric Product Error Params:", params);
      },
    },
  );

  // Also log the final processed data
  if (data?.data) {
    console.log("🔧 PROCESSED MANAGE FABRIC DATA:", data.data);
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

export default useGetAdminManageFabricProduct;
