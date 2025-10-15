import { useQuery } from "@tanstack/react-query";
import MarketRepService from "../../services/api/marketrep";

const useGetPaymentDetails = (paymentId, enabled = false) => {
  const {
    data: paymentDetails,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["payment-details", paymentId],
    queryFn: async () => {
      console.log("🔧 PAYMENT DETAILS: Starting API call for ID:", paymentId);
      const response = await MarketRepService.getPaymentDetails(paymentId);
      console.log("🔧 PAYMENT DETAILS: Full API Response received", response);
      console.log("🔧 PAYMENT DETAILS: Response data structure", {
        statusCode: response.data?.statusCode,
        message: response.data?.message,
        hasData: !!response.data?.data,
        hasUser: !!response.data?.data?.user,
        userName: response.data?.data?.user?.name,
        userEmail: response.data?.data?.user?.email,
      });
      return response.data;
    },
    enabled: !!paymentId && enabled, // Only fetch when ID is provided and enabled
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error) => {
      console.error("🔧 PAYMENT DETAILS ERROR:", error);
      console.error("🔧 PAYMENT DETAILS ERROR Response:", error.response);
    },
  });

  return {
    paymentDetails,
    isLoading,
    isError,
    error,
    refetch,
  };
};

export default useGetPaymentDetails;
