import { useQuery } from "@tanstack/react-query";
import AnalyticsService from "../../services/api/analytics";

function useGetDashboardStat() {
  const { isLoading, isFetching, data, isError, refetch, isPending } = useQuery(
    {
      queryKey: ["dashboard-stats"],
      queryFn: () => AnalyticsService.getDashboardStat(),
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

export default useGetDashboardStat;
