import { useMutation } from "@tanstack/react-query";
import SettingsService from "../../services/api/settings";
import useToast from "../useToast";

const useUpdatePassword = () => {
  const { toastError, toastSuccess } = useToast();

  const { isPending, mutate: updatePasswordMutate } = useMutation({
    mutationFn: (payload) => SettingsService.updatePassword(payload),
    mutationKey: ["update-password"],
    onSuccess(data) {
      toastSuccess(data?.data?.message);
    },
    onError: (error) => {
      toastError(error?.data?.message);
    },
  });
  return { isPending, updatePasswordMutate };
};

export default useUpdatePassword;
