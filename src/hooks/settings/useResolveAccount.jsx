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
      // @ts-ignore
      toastError(error?.data?.message);
    },
  });
  return { isPending, resolveAccountMutate };
};

export default useResolveAccount;
