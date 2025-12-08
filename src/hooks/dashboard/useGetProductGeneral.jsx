import { useQuery } from "@tanstack/react-query";
import DashboardService from "../../services/api/dashboard";

function useProductGeneral(params, type) {
  const { isLoading, isFetching, data, isError, refetch, isPending } = useQuery(
    {
      queryKey: ["get-product-general", params],
      queryFn: () => DashboardService.getProductGeneral(params, type),
      onSuccess: (data) => {
        console.log("👔 STYLE PRODUCT GENERAL API RESPONSE:", data);
        console.log("👔 Style Product Data:", data?.data);
        console.log("👔 Style Product Params:", params);
        console.log("👔 Style Product Type:", type);
      },
      onError: (error) => {
        console.error("❌ STYLE PRODUCT GENERAL API ERROR:", error);
        console.error("❌ Style Product Error Params:", params);
        console.error("❌ Style Product Error Type:", type);
      },
    },
  );

  // Also log the final processed data
  if (data?.data) {
    console.log("👔 PROCESSED STYLE PRODUCT DATA:", data.data);
  }

  return {
    isLoading,
    isFetching,
    data: { data: data?.data?.data, count: data?.data?.count },
    isError,
    isPending,
    refetch,
  };
}

export default useProductGeneral;
