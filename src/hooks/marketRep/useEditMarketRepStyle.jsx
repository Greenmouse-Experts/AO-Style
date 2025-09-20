import { useMutation, useQueryClient } from "@tanstack/react-query";
import MarketRepService from "../../services/api/marketrep";
import useToast from "../useToast";

const useEditMarketRepStyle = () => {
  const { toastError, toastSuccess } = useToast();
  const queryClient = useQueryClient();

  const {
    isPending,
    mutate: editMarketRepStyleMutate,
    error,
  } = useMutation({
    mutationFn: ({ id, payload, vendorId }) =>
      MarketRepService.updateMarketRepStyle(id, payload, vendorId),
    mutationKey: ["edit-marketrep-style"],
    onSuccess(data) {
      toastSuccess(data?.data?.message || "Style updated successfully!");
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
        "Failed to edit style. Please try again.";
      toastError(errorMessage);
    },
  });

  return {
    isPending,
    editMarketRepStyleMutate,
    error,
    isLoading: isPending,
  };
};

export default useEditMarketRepStyle;
