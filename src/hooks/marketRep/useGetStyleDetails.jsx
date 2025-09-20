import { useQuery } from "@tanstack/react-query";
import MarketRepService from "../../services/api/marketrep";

function useGetMarketRepStyleById(id) {
  const { isLoading, isFetching, data, isError, refetch, isPending } = useQuery(
    {
      queryKey: [id, "get-market-rep-style-by-id"],
      queryFn: () => MarketRepService.getMarketRepStyleById(id),
    },
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

export default useGetMarketRepStyleById;
