import { useMutation, useQueryClient } from "@tanstack/react-query";
import SettingsService from "../../services/api/settings";
import useToast from "../useToast";

const useResolveAccount = () => {
  const { toastError, toastSuccess } = useToast();

  const { isPending, mutate: resolveAccountMutate } = useMutation({
    mutationFn: (payload) => SettingsService.resolveAccount(payload),
    mutationKey: ["resolve-account"],
    onSuccess(data) {
      toastSuccess(data?.data?.message);
    },
    onError: (error) => {
      if (!navigator.onLine) {
        toastError("No internet connection. Please check your network.");
        return;
      }

      // @ts-ignore
      toastError(error?.data?.message);
    },
  });
  return { isPending, resolveAccountMutate };
};

export default useResolveAccount;
