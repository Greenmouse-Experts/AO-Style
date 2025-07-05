import { useQuery } from "@tanstack/react-query";
import NotificationService from "../../services/api/notification";

function useGetNotification(params) {
  const { isLoading, isFetching, data, isError, refetch, isPending } = useQuery(
    {
      queryKey: ["get-notification", params],
      queryFn: () => NotificationService.getNotification(params),
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

export default useGetNotification;
