import { useQuery } from "@tanstack/react-query";
import DashboardService from "../../services/api/dashboard";

function useProductGeneral(params, type) {
  const { isLoading, isFetching, data, isError, refetch, isPending } = useQuery(
    {
      queryKey: ["get-product-general", params],
      queryFn: () => DashboardService.getProductGeneral(params, type),
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

export default useProductGeneral;
