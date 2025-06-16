import { useQuery } from "@tanstack/react-query";
import MarketRepService from "../../services/api/marketrep";

function useGetInviteInfo(token) {
  const { isLoading, isFetching, data, isError, refetch, isPending, error } =
    useQuery({
      queryKey: ["get-invite-info", token],
      queryFn: () => MarketRepService.getInviteInfo(token),
    });

  return {
    isLoading,
    isFetching,
    data: data?.data,
    isError,
    isPending,
    refetch,
    error,
  };
}

export default useGetInviteInfo;
