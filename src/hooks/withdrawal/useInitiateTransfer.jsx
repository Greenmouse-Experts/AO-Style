import { useMutation, useQueryClient } from "@tanstack/react-query";
import WithdrawalService from "../../services/api/withdrawal";
import { toast } from "react-toastify";

function useInitiateTransfer() {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, error, data, isSuccess } = useMutation({
    mutationFn: (payload) => {
      console.log("🚀 Initiating transfer with payload:", payload);
      return WithdrawalService.initiateTransfer(payload);
    },
    onSuccess: (response) => {
      console.log("✅ Transfer initiated successfully:", response);
      toast.success("Transfer initiated successfully");

      // Invalidate and refetch withdrawal data
      queryClient.invalidateQueries({ queryKey: ["withdrawal-fetch-all"] });
      queryClient.invalidateQueries({ queryKey: ["withdrawal-fetch"] });
    },
    onError: (error) => {
      console.error("❌ Failed to initiate transfer:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to initiate transfer";
      toast.error(errorMessage);
    },
  });

  return {
    initiateTransfer: mutate,
    isPending,
    isLoading: isPending,
    isError,
    error,
    data: data?.data,
    isSuccess,
  };
}

export default useInitiateTransfer;
