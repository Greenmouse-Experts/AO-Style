import { useMutation, useQueryClient } from "@tanstack/react-query";
import JobService from "../../services/api/jobs";
import useToast from "../useToast";

const useDeleteJob = () => {
  const queryClient = useQueryClient();
  const { toastSuccess, toastError } = useToast();

  const { mutate: deleteJobMutate, isPending } = useMutation({
    mutationFn: (id) => {
      console.log("🗑️ Deleting job:", id);
      return JobService.deleteJob(id);
    },
    onSuccess: (data, variables) => {
      console.log("✅ Job deleted successfully:", { data, jobId: variables });
      queryClient.invalidateQueries({ queryKey: ["get-jobs"] });
      toastSuccess("Job deleted successfully");
    },
    onError: (error, variables) => {
      console.error("❌ Failed to delete job:", { error, jobId: variables });
      const message = error?.response?.data?.message || "Failed to delete job";
      toastError(message);
    },
  });

  return {
    deleteJobMutate,
    isPending,
  };
};

export default useDeleteJob;
