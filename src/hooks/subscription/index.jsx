import { useMutation, useQueryClient } from "@tanstack/react-query";
import useToast from "../useToast";
import FabricService from "../../services/api/fabric";
import SubscriptionService from "../../services/api/subscription";

const useCreateSubscription = (business_id) => {
  const queryClient = useQueryClient();

  const { toastError, toastSuccess } = useToast();

  const { isPending, mutate: createSubscriptionMutate } = useMutation({
    mutationFn: (payload) =>
      SubscriptionService.createSubscriptionProduct(payload, business_id),
    mutationKey: ["create-subscription"],
    onSuccess(data) {
      toastSuccess(data?.data?.message);
      queryClient.invalidateQueries({
        queryKey: ["get-subscription"],
      });
      // Also invalidate any queries with params
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === "get-subscription",
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
  return { isPending, createSubscriptionMutate };
};

export default useCreateSubscription;
export { default as useUpgradeSubscription } from "./useUpgradeSubscription";
