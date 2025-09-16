import { useQuery } from "@tanstack/react-query";
import MarketRepService from "../../services/api/marketrep";

function useGetAllMarketRepVendor(params, role) {
  console.log(
    "🔧 useGetAllMarketRepVendor: Starting query with params:",
    params,
    "role:",
    role,
  );

  const { isLoading, isFetching, data, isError, refetch, isPending } = useQuery(
    {
      queryKey: ["get-market-rep-vendor", params, role],
      queryFn: () => {
        console.log("🔧 useGetAllMarketRepVendor: Executing query function");
        return MarketRepService.GetMarketRepVendor(params, role)
          .then((response) => {
            console.log(
              "🔧 useGetAllMarketRepVendor: Raw API response:",
              response,
            );
            console.log(
              "🔧 useGetAllMarketRepVendor: Response data structure:",
              {
                status: response?.status,
                data: response?.data,
                hasNestedData: !!response?.data?.data,
                dataLength: response?.data?.data?.length || 0,
              },
            );
            return response;
          })
          .catch((error) => {
            console.error("🔧 useGetAllMarketRepVendor: API error:", error);
            throw error;
          });
      },
    },
  );

  console.log("🔧 useGetAllMarketRepVendor: Hook return values:");
  console.log("  - params:", params);
  console.log("  - role:", role);
  console.log("  - rawData:", data);
  console.log("  - processed data:", data?.data);
  console.log("  - data count:", data?.data?.length || 0);
  console.log("  - isLoading:", isLoading);
  console.log("  - isError:", isError);

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
