import { useMutation, useQueryClient } from "@tanstack/react-query";
import WithdrawalService from "../../services/api/withdrawal";
import useToast from "../useToast";

const useRequestWithdrawal = () => {
  const queryClient = useQueryClient();

  const { toastError, toastSuccess } = useToast();

  const { isPending, mutate: requestWithdrawalMutate } = useMutation({
    mutationFn: (payload) => WithdrawalService.createWithdrawal(payload),
    mutationKey: ["request-withdrawal"],
    onSuccess(data) {
      toastSuccess(data?.data?.message);
      queryClient.invalidateQueries({
        queryKey: ["withdrawal-fetch"],
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
  return { isPending, requestWithdrawalMutate };
};

export default useRequestWithdrawal;
