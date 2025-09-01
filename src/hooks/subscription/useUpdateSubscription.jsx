import { useMutation, useQueryClient } from "@tanstack/react-query";
import useToast from "../useToast";
import FabricService from "../../services/api/fabric";
import AdminRoleService from "../../services/api/adminRole";
import AdminService from "../../services/api/admin";
import SubscriptionService from "../../services/api/subscription";

const useEditSubscription = (id) => {
  const queryClient = useQueryClient();

  const { toastError, toastSuccess } = useToast();

  const { isPending, mutate: editSubscriptionMutate } = useMutation({
    mutationFn: (payload) =>
      SubscriptionService.updateSubscription(payload, id),
    mutationKey: ["update-subscrption"],
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
  return { isPending, editSubscriptionMutate };
};

export default useEditSubscription;
