import { useMutation } from "@tanstack/react-query";
import CaryBinApi from "../../services/CarybinBaseUrl";
import useToast from "../useToast";

const useRenewSubscription = () => {
  const { toastSuccess, toastError } = useToast();

  const mutation = useMutation({
    mutationFn: async (payload) => {
      const response = await CaryBinApi.post("/subscription/renew", payload);
      return response.data;
    },
    onSuccess: (data) => {
      toastSuccess(data?.message || "Subscription renewal initiated successfully!");
    },
    onError: (error) => {
      toastError(
        error?.response?.data?.message || "Failed to renew subscription. Please try again."
      );
    },
  });

  return {
    isPending: mutation.isPending,
    renewSubscriptionMutate: mutation.mutate,
  };
};

export default useRenewSubscription;