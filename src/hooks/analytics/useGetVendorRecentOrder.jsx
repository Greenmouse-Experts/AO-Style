import { useQuery } from "@tanstack/react-query";
import AnalyticsService from "../../services/api/analytics";

function useGetVendorRecentOrder() {
  const { isLoading, isFetching, data, isError, refetch, isPending } = useQuery(
    {
      queryKey: ["vendoranalytics-recentorder"],
      queryFn: () => AnalyticsService.getVendorRecentOrders(),
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

export default useGetVendorRecentOrder;
