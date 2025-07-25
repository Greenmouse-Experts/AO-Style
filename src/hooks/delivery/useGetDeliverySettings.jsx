import { useQuery } from "@tanstack/react-query";
import FabricService from "../../services/api/fabric";
import DeliveryService from "../../services/api/delivery";

function useGetDelivery() {
  const { isLoading, isFetching, data, isError, refetch, isPending } = useQuery(
    {
      queryKey: ["get-delivery"],
      queryFn: () => DeliveryService.getDeliverySettings(),
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

export default useGetDelivery;
