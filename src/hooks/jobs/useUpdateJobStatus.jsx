import { useMutation, useQueryClient } from "@tanstack/react-query";
import JobService from "../../services/api/jobs";
import useToast from "../useToast";

const useUpdateJobStatus = () => {
  const queryClient = useQueryClient();
  const { toastSuccess, toastError } = useToast();

  const { mutate: updateJobStatusMutate, isPending } = useMutation({
    mutationFn: ({ id, payload }) => {
      console.log("🔄 Updating job status:", { id, payload });
      return JobService.updateJobStatus(id, payload);
    },
    onSuccess: (data, variables) => {
      console.log("✅ Job status updated successfully:", { data, variables });
      queryClient.invalidateQueries({ queryKey: ["get-jobs"] });
      toastSuccess("Job status updated successfully");
    },
    onError: (error, variables) => {
      console.error("❌ Failed to update job status:", { error, variables });
      const message = error?.response?.data?.message || "Failed to update job status";
      toastError(message);
    },
  });

  return {
    updateJobStatusMutate,
    isPending,
  };
};

export default useUpdateJobStatus;
