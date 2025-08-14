import { useQuery } from "@tanstack/react-query";
import AnalyticsService from "../../services/api/analytics";
import OrderService from "../../services/api/order";

function useGetSingleOrder(id) {
  const { isLoading, isFetching, data, isError, refetch, isPending } = useQuery(
    {
      queryKey: ["get-single-order", id],
      queryFn: async () => {
        console.log("🚀 FETCHING ORDER DETAILS - Order ID:", id);
        const response = await OrderService.getSingleOrder(id);
        console.log("📡 RAW API RESPONSE - Full Response:", response);
        console.log("📡 RAW API RESPONSE - Response Data:", response?.data);
        console.log("📡 RAW API RESPONSE - Status Code:", response?.status);
        console.log("📡 RAW API RESPONSE - Headers:", response?.headers);
        return response;
      },
      enabled: !!id,
    },
  );

  console.log("🔍 HOOK STATE - isLoading:", isLoading);
  console.log("🔍 HOOK STATE - isFetching:", isFetching);
  console.log("🔍 HOOK STATE - isPending:", isPending);
  console.log("🔍 HOOK STATE - isError:", isError);
  console.log("🔍 HOOK STATE - data:", data);
  console.log("🔍 HOOK STATE - processed data:", data?.data);

  return {
    isLoading,
    isFetching,
    data: data?.data,
    isError,
    isPending,
    refetch,
  };
}

export default useGetSingleOrder;
