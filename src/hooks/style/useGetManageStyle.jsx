import { useQuery } from "@tanstack/react-query";
import StyleService from "../../services/api/style";

function useGetAdminManageStyleProduct(params) {
  console.log("🎨 STYLE HOOK INITIALIZED with params:", params);

  const { isLoading, isFetching, data, isError, refetch, isPending, error } =
    useQuery({
      queryKey: ["get-manage-style-product", params],
      queryFn: async () => {
        console.log("🎨 STARTING STYLE API CALL with params:", params);
        try {
          const result = await StyleService.getManageStyleProduct(params);
          console.log("🎨 STYLE API CALL SUCCESS:", result);
          return result;
        } catch (error) {
          console.error("🎨 STYLE API CALL ERROR:", error);
          throw error;
        }
      },
      onSuccess: (data) => {
        console.log("🎨 ===== STYLE SUCCESS CALLBACK =====");
        console.log("🎨 MANAGE STYLE PRODUCT API RESPONSE:", data);
        console.log("🎨 Manage Style Product Data:", data?.data);
        console.log("🎨 Manage Style Product Params:", params);
        console.log("🎨 Manage Style Product Count:", data?.data?.length || 0);
        console.log("🎨 Endpoint Called: /manage-style");
        console.log("🎨 Business ID Used:", params?.id);
        console.log("🎨 Response Status:", data?.status);
        console.log("🎨 Response Headers:", data?.headers);
        console.log("🎨 ===== END STYLE SUCCESS =====");
      },
      onError: (error) => {
        console.error("🎨 ===== STYLE ERROR CALLBACK =====");
        console.error("❌ MANAGE STYLE PRODUCT API ERROR:", error);
        console.error("❌ Manage Style Product Error Params:", params);
        console.error("❌ Error Status:", error?.response?.status);
        console.error("❌ Error Message:", error?.response?.data?.message);
        console.error("❌ Full Error Response:", error?.response);
        console.error("❌ Error Data:", error?.response?.data);
        console.error("❌ Failed Endpoint: /manage-style");
        console.error("❌ Network Error:", error?.code);
        console.error("🎨 ===== END STYLE ERROR =====");
      },
    });

  // Continuous logging of hook state
  console.log("🎨 STYLE HOOK STATE:", {
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
    console.log("🎨 PROCESSED MANAGE STYLE DATA:", data.data);
    console.log("🎨 STYLE DATA TYPE:", typeof data.data);
    console.log("🎨 STYLE DATA IS ARRAY:", Array.isArray(data.data));
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

export default useGetAdminManageStyleProduct;
