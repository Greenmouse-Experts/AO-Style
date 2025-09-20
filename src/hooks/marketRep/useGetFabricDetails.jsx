import { useQuery } from "@tanstack/react-query";
import MarketRepService from "../../services/api/marketrep";

function useGetMarketRepFabricById(id) {
  const { isLoading, isFetching, data, isError, refetch, isPending } = useQuery(
    {
      queryKey: [id, "get-market-rep-fabric-by-id"],
      queryFn: () => MarketRepService.getMarketRepFabricById(id),
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

export default useGetMarketRepFabricById;
