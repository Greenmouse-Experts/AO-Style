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
      // Invalidate all user management related queries
      queryClient.invalidateQueries({
        queryKey: ["get-all-userby-role"],
      });
      // Invalidate specific user type queries
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          // Check if queryKey array contains "tailors", "fabric-vendors", or "logistics-agents"
          return queryKey.some(key => 
            key === "tailors" || 
            key === "fabric-vendors" || 
            key === "logistics-agents"
          );
        }
      });

      toastSuccess(data?.data?.message);
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
  return { isPending, approveMarketRepMutate };
};

export default useApproveMarketRep;
