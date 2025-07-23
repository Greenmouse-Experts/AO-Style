import { useMutation, useQueryClient } from "@tanstack/react-query";
import FabricService from "../../services/api/fabric";
import useToast from "../useToast";
import SubscriptionService from "../../services/api/subscription";

const useDeleteSubscription = () => {
  const queryClient = useQueryClient();

  const { toastError, toastSuccess } = useToast();

  const { isPending, mutate: deleteSubscriptionMutate } = useMutation({
    mutationFn: (payload) => SubscriptionService.deleteSubscription(payload),
    mutationKey: ["delete-subscrption"],
    onSuccess(data) {
      toastSuccess(data?.data?.message);
      queryClient.invalidateQueries({
        queryKey: ["get-subscription"],
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
  return { isPending, deleteSubscriptionMutate };
};

export default useDeleteSubscription;
