import { useMutation, useQueryClient } from "@tanstack/react-query";
import useToast from "../useToast";
import MarketRepService from "../../services/api/marketrep";

const useApproveMarketRep = () => {
  const { toastError, toastSuccess } = useToast();
  const queryClient = useQueryClient();

  const { isPending, mutate: approveMarketRepMutate } = useMutation({
    mutationFn: (payload) => MarketRepService.approveMarketRep(payload),
    mutationKey: ["approve-market-rep"],
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
  return { isPending, approveMarketRepMutate };
};

export default useApproveMarketRep;
