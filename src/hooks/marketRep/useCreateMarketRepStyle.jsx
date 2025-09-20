import { useMutation, useQueryClient } from "@tanstack/react-query";
import MarketRepService from "../../services/api/marketrep";
import useToast from "../useToast";

const useCreateMarketRepStyle = () => {
  const { toastError, toastSuccess } = useToast();
  const queryClient = useQueryClient();

  const {
    isPending,
    mutate: createMarketRepStyleMutate,
    error,
  } = useMutation({
    mutationFn: (payload) => MarketRepService.createMarketRepStyle(payload),
    mutationKey: ["create-marketrep-style"],
    onSuccess(data) {
      toastSuccess(data?.data?.message || "Style created successfully!");
      queryClient.invalidateQueries({
        queryKey: ["market-rep-products"],
      });
      queryClient.invalidateQueries({
        queryKey: ["get-market-rep-vendor"],
      });
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.data?.message ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create style. Please try again.";
      toastError(errorMessage);
    },
  });

  return {
    isPending,
    createMarketRepStyleMutate,
    error,
    isLoading: isPending,
  };
};

export default useCreateMarketRepStyle;
