import { useMutation, useQueryClient } from "@tanstack/react-query";
import WithdrawalService from "../../services/api/withdrawal";
import { toast } from "react-toastify";

function useResendOtp() {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, error, data, isSuccess } = useMutation({
    mutationFn: (payload) => {
      console.log("🚀 resending OTP with payload:", payload);
      return WithdrawalService.resendOTP(payload);
    },
    onSuccess: (response) => {
      console.log("✅ OTP resent successfully:", response);
      toast.success("OTP resent successfully");

      // Invalidate and refetch withdrawal data
      // queryClient.invalidateQueries({ queryKey: ["withdrawal-fetch-all"] });
      // queryClient.invalidateQueries({ queryKey: ["withdrawal-fetch"] });
    },
    onError: (error) => {
      console.error("❌ Failed to resend OTP:", error);
      const errorMessage =
        error?.data?.message || error?.message || "Failed to resend OTP";
      toast.error(errorMessage);
    },
  });

  return {
    resendOtp: mutate,
    isPending,
    isLoading: isPending,
    isError,
    error,
    data: data?.data,
    isSuccess,
  };
}

export default useResendOtp;
