import { useQuery } from "@tanstack/react-query";
import AnalyticsService from "../../services/api/analytics";
import OrderService from "../../services/api/order";
import SubscriptionService from "../../services/api/subscription";

function useGetSubscription(params, id) {
  const { isLoading, isFetching, data, isError, refetch, isPending } = useQuery(
    {
      queryKey: ["get-subscription", params],
      queryFn: () => SubscriptionService.getSubscription(params, id),
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

export default useGetSubscription;
