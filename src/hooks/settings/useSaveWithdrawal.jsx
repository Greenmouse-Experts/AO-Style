import { useMutation, useQueryClient } from "@tanstack/react-query";
import SettingsService from "../../services/api/settings";
import useToast from "../useToast";

const useSaveWithdrawal = () => {
  const queryClient = useQueryClient();

  const { toastError, toastSuccess } = useToast();

  const { isPending, mutate: saveWithdrawalMutate } = useMutation({
    mutationFn: (payload) => SettingsService.saveWithdrawal(payload),
    mutationKey: ["save-withdrawal"],
    onSuccess(data) {
      toastSuccess(data?.data?.message);
      queryClient.invalidateQueries({
        queryKey: ["get-user-profile"],
      });
    },
    onError: (error) => {
      if (!navigator.onLine) {
        toastError("No internet connection. Please check your network.");
        return;
      }

      // @ts-ignore
      if (Array.isArray(error?.data?.message)) {
        toastError(error?.data?.message[0]);
      } else {
        toastError(error?.data?.message);
      }
    },
  });
  return { isPending, saveWithdrawalMutate };
};

export default useSaveWithdrawal;
