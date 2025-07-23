import { useQuery } from "@tanstack/react-query";
import AnalyticsService from "../../services/api/analytics";

function useGetCustomerExpensesStat() {
  const { isLoading, isFetching, data, isError, refetch, isPending } = useQuery(
    {
      queryKey: ["customer-expenses-stats"],
      queryFn: () => AnalyticsService.getCustomerExpenses(),
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

export default useGetCustomerExpensesStat;
