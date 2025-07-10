import { useMutation, useQueryClient } from "@tanstack/react-query";
import JobService from "../../services/api/jobs";
import useToast from "../useToast";

const useUpdateJob = () => {
  const queryClient = useQueryClient();
  const { toastSuccess, toastError } = useToast();

  const { mutate: updateJobMutate, isPending } = useMutation({
    mutationFn: ({ id, payload }) => {
      console.log("✏️ Updating job:", { id, payload });
      return JobService.updateJob(id, payload);
    },
    onSuccess: (data, variables) => {
      console.log("✅ Job updated successfully:", { data, variables });
      queryClient.invalidateQueries({ queryKey: ["get-jobs"] });
      toastSuccess("Job updated successfully");
    },
    onError: (error, variables) => {
      console.error("❌ Failed to update job:", { error, variables });
      // Extract the correct error message from the response
      const message = error?.response?.data?.message || 
                     error?.response?.data?.error?.message || 
                     error?.message || 
                     "Failed to update job";
      toastError(message);
    },
  });

  return {
    updateJobMutate,
    isPending,
  };
};

export default useUpdateJob;
