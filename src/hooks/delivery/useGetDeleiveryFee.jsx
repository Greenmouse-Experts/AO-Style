import { useQuery } from "@tanstack/react-query";
import FabricService from "../../services/api/fabric";
import DeliveryService from "../../services/api/delivery";

function useGetDeliveryFee() {
  const { isLoading, isFetching, data, isError, refetch, isPending } = useQuery(
    {
      queryKey: ["get-deliveryfee"],
      queryFn: () => DeliveryService.getDeliveryFee(),
    }
  );

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
