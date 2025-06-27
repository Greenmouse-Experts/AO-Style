import { useQuery } from "@tanstack/react-query";
import MarketRepService from "../../services/api/marketrep";

function useGetAllMarketRepVendor(params) {
  const { isLoading, isFetching, data, isError, refetch, isPending } = useQuery(
    {
      queryKey: ["get-market-rep-vendor", params],
      queryFn: () => MarketRepService.GetMarketRepVendor(params),
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

export default useGetAllMarketRepVendor;
