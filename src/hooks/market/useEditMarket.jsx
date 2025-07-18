import { useMutation, useQueryClient } from "@tanstack/react-query";
import useToast from "../useToast";
import ProductService from "../../services/api/products";
import MarketService from "../../services/api/market";

const useEditMarket = () => {
  const queryClient = useQueryClient();

  const { toastError, toastSuccess } = useToast();

  const { isPending, mutate: editMarketMutate } = useMutation({
    mutationFn: (payload) => MarketService.editMarket(payload),
    mutationKey: ["edit-market"],
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
  return { isPending, editMarketMutate };
};

export default useEditMarket;
