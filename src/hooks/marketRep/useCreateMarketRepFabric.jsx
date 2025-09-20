import { useMutation, useQueryClient } from "@tanstack/react-query";
import MarketRepService from "../../services/api/marketrep";
import useToast from "../useToast";

const useCreateMarketRepFabric = () => {
  const { toastError, toastSuccess } = useToast();
  const queryClient = useQueryClient();

  const {
    isPending,
    mutate: createMarketRepFabricMutate,
    error,
  } = useMutation({
    mutationFn: (payload) => MarketRepService.createMarketRepFabric(payload),
    mutationKey: ["create-marketrep-fabric"],
    onSuccess(data) {
      toastSuccess(data?.data?.message || "Fabric created successfully!");
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
        "Failed to create fabric. Please try again.";
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

export default useCreateMarketRepFabric;
