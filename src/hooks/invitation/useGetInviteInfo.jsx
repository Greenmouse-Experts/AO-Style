import { useQuery } from "@tanstack/react-query";
import CaryBinApi from "../../services/CarybinBaseUrl";

function useGetInviteInfo(token) {
  const { isLoading, isFetching, data, isError, refetch, isPending, error } =
    useQuery({
      queryKey: ["get-invite-info", token],
      queryFn: () => CaryBinApi.get(`/contact/invite/${token}`),
      enabled: !!token, // Only fetch if token exists
    });

  return {
    isLoading,
    isFetching,
    data: data?.data?.data,
    isError,
    isPending,
    refetch,
    error,
  };
}

export default useGetInviteInfo;

