import { useQuery } from "@tanstack/react-query";
import MarketRepService from "../../services/api/marketrep";

const useGetMarketRepPayments = (params = {}) => {
  const {
    data: paymentsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["market-rep-payments", params],
    queryFn: async () => {
      console.log("🔧 MARKET REP PAYMENTS: Starting API call with params:", params);
      const response = await MarketRepService.getMarketRepPayments(params);
      console.log("🔧 MARKET REP PAYMENTS: Full API Response received", response);
      console.log("🔧 MARKET REP PAYMENTS: Response data structure", {
        statusCode: response.data?.statusCode,
        dataLength: response.data?.data?.length || 0,
        count: response.data?.count,
        firstTransaction: response.data?.data?.[0],
      });
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error) => {
      console.error("🔧 MARKET REP PAYMENTS ERROR:", error);
      console.error("🔧 MARKET REP PAYMENTS ERROR Response:", error.response);
    },
  });

  return {
    paymentsData,
    isLoading,
    isError,
    error,
    refetch,
  };
};

export default useGetMarketRepPayments;
