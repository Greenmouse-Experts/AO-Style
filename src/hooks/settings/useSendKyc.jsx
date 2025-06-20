import { useMutation } from "@tanstack/react-query";
import useToast from "../useToast";
import SettingsService from "../../services/api/settings";

const useSendKyc = () => {
  const { toastError, toastSuccess } = useToast();

  const { isPending, mutate: sendKycMutate } = useMutation({
    mutationFn: (payload) => SettingsService.sendKyc(payload),
    mutationKey: ["send-kyc"],
    onSuccess(data) {
      toastSuccess(data?.data?.message);
    },
    onError: (error) => {
      if (Array.isArray(error?.data?.message)) {
        toastError(error?.data?.message[0]);
      } else {
        toastError(error?.data?.message);
      }
    },
  });
  return { isPending, sendKycMutate };
};

export default useSendKyc;
