import { useQuery } from "@tanstack/react-query";
import DashboardService from "../../services/api/dashboard";

function useProductCategoryGeneral(params) {
  const { isLoading, isFetching, data, isError, refetch, isPending } = useQuery(
    {
      queryKey: ["get-product-category-general", params],
      queryFn: () => DashboardService.getProductCategory(params),
      onSuccess: (data) => {
        console.log("📂 STYLE PRODUCT CATEGORY API RESPONSE:", data);
        console.log("📂 Style Product Category Data:", data?.data);
        console.log("📂 Style Product Category Params:", params);
      },
      onError: (error) => {
        console.error("❌ STYLE PRODUCT CATEGORY API ERROR:", error);
        console.error("❌ Style Product Category Error Params:", params);
      },
    },
  );

  // Also log the final processed data
  if (data?.data) {
    console.log("📂 PROCESSED STYLE PRODUCT CATEGORY DATA:", data.data);
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

export default useProductCategoryGeneral;
