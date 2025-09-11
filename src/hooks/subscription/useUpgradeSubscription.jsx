import { useMutation, useQueryClient } from "@tanstack/react-query";
import useToast from "../useToast";
import SubscriptionService from "../../services/api/subscription";

const useUpgradeSubscription = () => {
  const queryClient = useQueryClient();
  const { toastError, toastSuccess } = useToast();

  const { isPending, mutate: upgradeSubscriptionMutate } = useMutation({
    mutationFn: (payload) => {
      console.log("🔄 Initiating subscription upgrade:", payload);
      return SubscriptionService.switchSubscriptionPlan(payload);
    },
    mutationKey: ["upgrade-subscription"],
    onSuccess(data) {
      console.log("✅ Upgrade initiated successfully:", data);

      // Don't show success message yet - wait for payment
      // The success callback will be handled in the component
    },
    onError: (error) => {
      console.error("❌ Upgrade initiation failed:", error);
      if (!navigator.onLine) {
        toastError("No internet connection. Please check your network.");
        return;
      }
      if (Array.isArray(error?.response?.data?.message)) {
        toastError(error?.response?.data?.message[0]);
      } else if (error?.response?.data?.message) {
        toastError(error?.response?.data?.message);
      } else if (error?.message) {
        toastError(error?.message);
      } else {
        toastError("Failed to initiate subscription upgrade");
      }
    },
  });

  return {
    isPending,
    upgradeSubscriptionMutate,
  };
};

export default useUpgradeSubscription;
