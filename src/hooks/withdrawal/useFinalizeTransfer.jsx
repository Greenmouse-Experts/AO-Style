import { useMutation, useQueryClient } from "@tanstack/react-query";
import WithdrawalService from "../../services/api/withdrawal";
import { toast } from "react-toastify";

function useFinalizeTransfer(onFinalizeSuccess) {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, error, data, isSuccess } = useMutation({
    mutationFn: (payload) => {
      console.log("🔄 Finalizing transfer with payload:", payload);
      return WithdrawalService.finalizeTransfer(payload);
    },
    onSuccess: (response) => {
      console.log("✅ Transfer finalized successfully:", response);
      toast.success("Transfer finalized successfully");

      // Invalidate and refetch withdrawal data
      queryClient.invalidateQueries({ queryKey: ["withdrawal-fetch-all"] });
      queryClient.invalidateQueries({ queryKey: ["withdrawal-fetch"] });

      // Call the callback to trigger verify transfer
      if (onFinalizeSuccess && response?.data) {
        onFinalizeSuccess(response.data);
      }
    },
    onError: (error) => {
      console.error("❌ Failed to finalize transfer:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.data?.message ||
        "Failed to finalize transfer";
      toast.error(errorMessage);
    },
  });

  return {
    finalizeTransfer: mutate,
    isPending,
    isLoading: isPending,
    isError,
    error,
    data: data?.data,
    isSuccess,
  };
}

export default useFinalizeTransfer;
