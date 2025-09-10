import { useMutation, useQueryClient } from "@tanstack/react-query";
import WithdrawalService from "../../services/api/withdrawal";
import { toast } from "react-toastify";

function useVerifyTransfer() {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, error, data, isSuccess } = useMutation({
    mutationFn: (payload) => {
      console.log("🔍 Verifying transfer with payload:", payload);
      return WithdrawalService.verifyTransfer(payload);
    },
    onSuccess: (response) => {
      console.log("✅ Transfer verified successfully:", response);
      toast.success("Transfer verified successfully");

      // Invalidate and refetch withdrawal data
      queryClient.invalidateQueries({ queryKey: ["withdrawal-fetch-all"] });
      queryClient.invalidateQueries({ queryKey: ["withdrawal-fetch"] });
    },
    onError: (error) => {
      console.error("❌ Failed to verify transfer:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to verify transfer";
      toast.error(errorMessage);
    },
  });

  return {
    verifyTransfer: mutate,
    isPending,
    isLoading: isPending,
    isError,
    error,
    data: data?.data,
    isSuccess,
  };
}

export default useVerifyTransfer;
