import { useQuery } from "@tanstack/react-query";
import FabricService from "../../services/api/fabric";
import DeliveryService from "../../services/api/delivery";

function useGetDeliveryFee() {
  const { isLoading, isFetching, data, isError, refetch, isPending } = useQuery(
    {
      queryKey: ["get-deliveryfee"],
      queryFn: async () => {
        console.log("🚚 Fetching delivery fee from API...");
        try {
          const response = await DeliveryService.getDeliveryFee();
          console.log("🚚 Delivery Fee API Success:", response);
          console.log("🚚 Delivery Fee Raw Data:", response?.data);
          console.log(
            "🚚 Delivery Fee Amount:",
            response?.data?.data?.delivery_fee,
          );
          return response;
        } catch (error) {
          console.error("🚚 Delivery Fee API Error:", error);
          console.error(
            "🚚 Error Details:",
            error?.response?.data || error.message,
          );
          throw error;
        }
      },
    },
  );

  // Log state changes
  console.log("🚚 Delivery Hook State:", {
    isLoading,
    isFetching,
    isError,
    isPending,
    hasData: !!data,
    deliveryFee: data?.data?.data?.delivery_fee,
  });

  return {
    isLoading,
    isFetching,
    data: data,
    isError,
    isPending,
    refetch,
  };
}

export default useGetDeliveryFee;
