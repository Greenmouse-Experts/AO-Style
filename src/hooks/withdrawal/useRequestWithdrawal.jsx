import { useMutation, useQueryClient } from "@tanstack/react-query";
import WithdrawalService from "../../services/api/withdrawal";
import useToast from "../useToast";

const useRequestWithdrawal = (options = {}) => {
  const queryClient = useQueryClient();

  const { toastError, toastSuccess } = useToast();

  const { isPending, mutate: requestWithdrawalMutate } = useMutation({
    mutationFn: async (payload) => {
      console.log("💸 Submitting withdrawal request with payload:", payload);
      const response = await WithdrawalService.createWithdrawal(payload);
      console.log("✅ Withdrawal Request Response:", response);
      console.log("📝 Response Message:", response?.data?.message);
      return response;
    },
    mutationKey: ["request-withdrawal"],
    onSuccess(data) {
      console.log("🎉 Withdrawal request successful:", data);
      toastSuccess(data?.data?.message);
      console.log("🔄 Invalidating queries for data refresh...");
      queryClient.invalidateQueries({
        queryKey: ["withdrawal-fetch"],
      });
      queryClient.invalidateQueries({
        queryKey: ["get-business-details"],
      });
      if (options.onSuccess) {
        console.log("📞 Calling custom success callback...");
        options.onSuccess(data);
      }
    },
    onError: (error) => {
      console.error("❌ Withdrawal request failed:", error);
      console.error("🔍 Error details:", {
        message: error?.data?.message,
        status: error?.status,
        data: error?.data,
      });

      if (!navigator.onLine) {
        console.warn("🌐 No internet connection detected");
        toastError("No internet connection. Please check your network.");
        return;
      }

      if (Array.isArray(error?.data?.message)) {
        console.error("📋 Multiple error messages:", error?.data?.message);
        toastError(error?.data?.message[0]);
      } else {
        console.error("📝 Single error message:", error?.data?.message);
        toastError(error?.data?.message);
      }
    },
  });
  console.log("🎯 Request Withdrawal Hook State:", {
    isPending,
    isOnline: navigator.onLine,
  });

  return { isPending, requestWithdrawalMutate };
};

export default useRequestWithdrawal;
