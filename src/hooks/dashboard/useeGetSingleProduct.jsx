import { useQuery } from "@tanstack/react-query";
import DashboardService from "../../services/api/dashboard";

function useSingleProductGeneral(type, id) {
  const { isLoading, isFetching, data, isError, refetch, isPending } = useQuery(
    {
      queryKey: ["get-single-product-general", id],
      queryFn: () => DashboardService.getSingleProduct(type, id),
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

export default useSingleProductGeneral;
