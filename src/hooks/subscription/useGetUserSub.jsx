import { useQuery } from "@tanstack/react-query";
import AnalyticsService from "../../services/api/analytics";
import OrderService from "../../services/api/order";
import SubscriptionService from "../../services/api/subscription";

function useGetUserSubscription(params, role) {
  const { isLoading, isFetching, data, isError, refetch, isPending } = useQuery(
    {
      queryKey: ["get-user-subscription", params],
      queryFn: () => SubscriptionService.getUserSubscription(params, role),
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

export default useGetUserSubscription;
