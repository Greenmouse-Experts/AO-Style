import { useMutation, useQueryClient } from "@tanstack/react-query";
import MarketRepService from "../../services/api/marketrep";
import useToast from "../useToast";

const useAddMarketRep = () => {
  const { toastError, toastSuccess } = useToast();

  const queryClient = useQueryClient();

  const { isPending, mutate: addMarketRepMutate } = useMutation({
    mutationFn: (payload) => MarketRepService.addMarketRep(payload),
    mutationKey: ["add-market-rep"],
    onSuccess(data) {
      toastSuccess(data?.data?.message);
      queryClient.invalidateQueries({
        queryKey: ["get-market-rep"],
      });
    },
    onError: (error) => {
      toastError(error?.data?.message);
    },
  });
  return { isPending, addMarketRepMutate };
};

export default useAddMarketRep;
