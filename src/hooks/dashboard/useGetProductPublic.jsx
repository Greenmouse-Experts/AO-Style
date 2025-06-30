import { useQuery } from "@tanstack/react-query";
import DashboardService from "../../services/api/dashboard";

function useProductCategoryGeneral(params) {
  const { isLoading, isFetching, data, isError, refetch, isPending } = useQuery(
    {
      queryKey: ["get-product-category-general", params],
      queryFn: () => DashboardService.getProductCategory(params),
    }
  );

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
