import { useMutation, useQueryClient } from "@tanstack/react-query";
import ProductService from "../../services/api/products";
import useToast from "../useToast";
import MarketService from "../../services/api/market";

const useDeleteMarket = () => {
  const queryClient = useQueryClient();

  const { toastError, toastSuccess } = useToast();

  const { isPending, mutate: deleteMarketMutate } = useMutation({
    mutationFn: (payload) => MarketService.deleteMarket(payload),
    mutationKey: ["delete-market"],
    onSuccess(data) {
      toastSuccess(data?.data?.message);
      queryClient.invalidateQueries({
        queryKey: ["get-market"],
      });
    },
    onError: (error) => {
      if (!navigator.onLine) {
        toastError("No internet connection. Please check your network.");
        return;
      }

      if (Array.isArray(error?.data?.message)) {
        toastError(error?.data?.message[0]);
      } else {
        toastError(error?.data?.message);
      }
    },
  });
  return { isPending, deleteMarketMutate };
};

export default useDeleteMarket;
