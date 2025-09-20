import { useMutation, useQueryClient } from "@tanstack/react-query";
import MarketRepService from "../../services/api/marketrep";
import useToast from "../useToast";

const useEditMarketRepFabric = () => {
  const { toastError, toastSuccess } = useToast();
  const queryClient = useQueryClient();

  const {
    isPending,
    mutate: createMarketRepFabricMutate,
    error,
  } = useMutation({
    mutationFn: ({ id, payload, vendorId }) =>
      MarketRepService.updateMarketRepFabric(id, payload, vendorId),
    mutationKey: ["edit-marketrep-fabric"],
    onSuccess(data) {
      toastSuccess(data?.data?.message || "Fabric updated successfully!");
      queryClient.invalidateQueries({
        queryKey: ["market-rep-products"],
      });
      queryClient.invalidateQueries({
        queryKey: ["get-market-rep-vendor"],
      });
    },
    onError: (error) => {
      const errorMessage =
        error?.data?.message ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to edit fabric. Please try again.";
      toastError(errorMessage);
    },
  });

  return {
    isPending,
    createMarketRepFabricMutate,
    error,
    isLoading: isPending,
  };
};

export default useEditMarketRepFabric;
