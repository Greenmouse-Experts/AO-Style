import { useQuery } from "@tanstack/react-query";
import MarketRepService from "../../services/api/marketrep";

function useGetAllMarketRep(params) {
  const { isLoading, isFetching, data, isError, refetch, isPending } = useQuery(
    {
      queryKey: ["get-market-rep", params],
      queryFn: () => MarketRepService.GetMarketRep(params),
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

export default useGetAllMarketRep;
