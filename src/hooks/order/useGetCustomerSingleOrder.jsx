import { useQuery } from "@tanstack/react-query";
import OrderService from "../../services/api/order";

function useGetCustomerSingleOrder(id) {
  const {
    isLoading,
    isFetching,
    data,
    isError,
    refetch,
    isPending,
    error,
  } = useQuery({
    queryKey: ["get-customer-single-order", id],
    queryFn: async () => {
      console.log("🚀 FETCHING CUSTOMER ORDER DETAILS - Order ID:", id);

      if (!id) {
        throw new Error("Order ID is required");
      }

      try {
        const response = await OrderService.getCustomerSingleOrder(id);
        console.log("📡 CUSTOMER ORDER RAW API RESPONSE - Full Response:", response);
        console.log("📡 CUSTOMER ORDER RAW API RESPONSE - Response Data:", response?.data);
        console.log("📡 CUSTOMER ORDER RAW API RESPONSE - Status Code:", response?.status);
        console.log("📡 CUSTOMER ORDER RAW API RESPONSE - Headers:", response?.headers);

        // Check if response is successful
        if (response?.status !== 200) {
          throw new Error(`API returned status ${response?.status}`);
        }

        // Check if data exists
        if (!response?.data) {
          throw new Error("No data received from API");
        }

        return response;
      } catch (apiError) {
        console.error("❌ API ERROR in useGetCustomerSingleOrder:", apiError);
        console.error("❌ Error details:", {
          message: apiError?.message,
          response: apiError?.response,
          status: apiError?.response?.status,
          data: apiError?.response?.data,
        });
        throw apiError;
      }
    },
    enabled: !!id,
    retry: (failureCount, error) => {
      console.log(
        `🔄 Customer order retry attempt ${failureCount} for order ${id}:`,
        error?.message,
      );
      return failureCount < 2; // Retry up to 2 times
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  console.log("🔍 CUSTOMER HOOK STATE - isLoading:", isLoading);
  console.log("🔍 CUSTOMER HOOK STATE - isFetching:", isFetching);
  console.log("🔍 CUSTOMER HOOK STATE - isPending:", isPending);
  console.log("🔍 CUSTOMER HOOK STATE - isError:", isError);
  console.log("🔍 CUSTOMER HOOK STATE - error:", error);
  console.log("🔍 CUSTOMER HOOK STATE - data:", data);
  console.log("🔍 CUSTOMER HOOK STATE - processed data:", data?.data);

  // Additional validation logging
  if (data?.data?.data) {
    console.log("✅ Customer order data successfully loaded:", {
      orderId: data.data.data.id,
      status: data.data.data.status,
      hasPayment: !!data.data.data.payment,
      hasItems: !!data.data.data.payment?.purchase?.items?.length,
      itemCount: data.data.data.payment?.purchase?.items?.length || 0,
    });
  }

  if (isError && error) {
    console.error("❌ useGetCustomerSingleOrder hook error:", {
      message: error?.message,
      cause: error?.cause,
      orderId: id,
    });
  }

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

export default useGetCustomerSingleOrder;
