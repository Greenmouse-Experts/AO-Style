import { useQuery } from "@tanstack/react-query";
import AnalyticsService from "../../services/api/analytics";

function useVendorTopProduct() {
  const { isLoading, isFetching, data, isError, refetch, isPending } = useQuery(
    {
      queryKey: ["vendortop-product"],
      queryFn: () => AnalyticsService.getVendorTopProduct(),
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

export default useVendorTopProduct;
