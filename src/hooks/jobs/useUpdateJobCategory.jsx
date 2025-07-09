import { useMutation, useQueryClient } from "@tanstack/react-query";
import JobService from "../../services/api/jobs";
import useToast from "../useToast";

const useUpdateJobCategory = () => {
  const queryClient = useQueryClient();
  const { toastSuccess, toastError } = useToast();

  const { mutate: updateJobCategoryMutate, isPending } = useMutation({
    mutationFn: ({ id, payload }) => {
      console.log("✏️ Updating job category:", { id, payload });
      return JobService.updateJobCategory(id, payload);
    },
    onSuccess: (data, variables) => {
      console.log("✅ Job category updated successfully:", { data, variables });
      queryClient.invalidateQueries({ queryKey: ["get-job-categories"] });
      toastSuccess("Job category updated successfully");
    },
    onError: (error, variables) => {
      console.error("❌ Failed to update job category:", { error, variables });
      const message = error?.response?.data?.message || 
                     error?.response?.data?.error?.message || 
                     error?.message || 
                     "Failed to update job category";
      toastError(message);
    },
  });

  return {
    updateJobCategoryMutate,
    isPending,
  };
};

export default useUpdateJobCategory;
