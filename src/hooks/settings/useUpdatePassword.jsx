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
  return { isPending, updatePasswordMutate };
};

export default useUpdatePassword;
