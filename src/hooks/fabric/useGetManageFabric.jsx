import { useQuery } from "@tanstack/react-query";
import UserService from "../../services/api/users";
import ProductService from "../../services/api/products";
import MarketService from "../../services/api/market";
import FabricService from "../../services/api/fabric";

function useGetAdminManageFabricProduct(params) {
  console.log("🔧 FABRIC HOOK INITIALIZED with params:", params);

  const { isLoading, isFetching, data, isError, refetch, isPending, error } =
    useQuery({
      queryKey: ["get-manage-fabric-product", params],
      queryFn: async () => {
        console.log("🔧 STARTING FABRIC API CALL with params:", params);
        try {
          const result = await FabricService.getManageFabricProduct(params);
          console.log("🔧 FABRIC API CALL SUCCESS:", result);
          return result;
        } catch (error) {
          console.error("🔧 FABRIC API CALL ERROR:", error);
          throw error;
        }
      },
      onSuccess: (data) => {
        console.log("🔧 ===== FABRIC SUCCESS CALLBACK =====");
        console.log("🔧 MANAGE FABRIC PRODUCT API RESPONSE:", data);
        console.log("🔧 Manage Fabric Product Data:", data?.data);
        console.log("🔧 Manage Fabric Product Params:", params);
        console.log("🔧 Manage Fabric Product Count:", data?.data?.length || 0);
        console.log(
          "🔧 Endpoint Called: /product-general/fetch with business_id=" +
            params?.id +
            " and type=FABRIC",
        );
        console.log("🔧 Business ID Used:", params?.id);
        console.log("🔧 Response Status:", data?.status);
        console.log("🔧 Response Headers:", data?.headers);
        console.log("🔧 ===== END FABRIC SUCCESS =====");
      },
      onError: (error) => {
        console.error("🔧 ===== FABRIC ERROR CALLBACK =====");
        console.error("❌ MANAGE FABRIC PRODUCT API ERROR:", error);
        console.error("❌ Manage Fabric Product Error Params:", params);
        console.error("❌ Error Status:", error?.response?.status);
        console.error("❌ Error Message:", error?.response?.data?.message);
        console.error("❌ Full Error Response:", error?.response);
        console.error("❌ Error Data:", error?.response?.data);
        console.error(
          "❌ Failed Endpoint: /product-general/fetch with business_id=" +
            params?.id +
            " and type=FABRIC",
        );
        console.error("❌ Network Error:", error?.code);
        console.error("🔧 ===== END FABRIC ERROR =====");
      },
    });

  // Continuous logging of hook state
  console.log("🔧 FABRIC HOOK STATE:", {
    isLoading,
    isFetching,
    isPending,
    isError,
    hasData: !!data,
    dataLength: data?.data?.data?.length || data?.data?.length || 0,
    params,
    error: error?.message,
  });

  // Also log the final processed data
  if (data?.data) {
    console.log(data);
    console.log("🔧 PROCESSED MANAGE FABRIC DATA:", data.data);
    console.log("🔧 FABRIC DATA TYPE:", typeof data.data);
    console.log("🔧 FABRIC DATA IS ARRAY:", Array.isArray(data.data));
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
