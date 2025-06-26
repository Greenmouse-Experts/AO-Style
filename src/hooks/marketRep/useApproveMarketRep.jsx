import { useMutation, useQueryClient } from "@tanstack/react-query";
import useToast from "../useToast";
import MarketRepService from "../../services/api/marketrep";
import { useNavigate } from "react-router-dom";

const useApproveMarketRep = () => {
  const { toastError, toastSuccess } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { isPending, mutate: approveMarketRepMutate } = useMutation({
    mutationFn: (payload) => MarketRepService.approveMarketRep(payload),
    mutationKey: ["approve-market-rep"],
    onSuccess(data) {
      queryClient.invalidateQueries({
        queryKey: ["get-all-userby-role"],
      });

      toastSuccess(data?.data?.message);
      navigate("/admin/sales-rep");
    },
    onError: (error) => {
      if (!navigator.onLine) {
        toastError("No internet connection. Please check your network.");
        return;
      }

      toastError(error?.data?.message);
    },
  });
  return { isPending, approveMarketRepMutate };
};

export default useApproveMarketRep;
