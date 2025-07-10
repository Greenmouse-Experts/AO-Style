import { useMutation, useQueryClient } from "@tanstack/react-query";
import JobService from "../../services/api/jobs";
import useToast from "../useToast";

const useDeleteJobCategory = () => {
  const queryClient = useQueryClient();
  const { toastSuccess, toastError } = useToast();

  const { mutate: deleteJobCategoryMutate, isPending } = useMutation({
    mutationFn: (id) => {
      console.log("🗑️ Deleting job category:", id);
      return JobService.deleteJobCategory(id);
    },
    onSuccess: (data, variables) => {
      console.log("✅ Job category deleted successfully:", { data, categoryId: variables });
      queryClient.invalidateQueries({ queryKey: ["get-job-categories"] });
      toastSuccess("Job category deleted successfully");
    },
    onError: (error, variables) => {
      console.error("❌ Failed to delete job category:", { error, categoryId: variables });
      const message = error?.response?.data?.message || 
                     error?.response?.data?.error?.message || 
                     error?.message || 
                     "Failed to delete job category";
      toastError(message);
    },
  });

  return {
    deleteJobCategoryMutate,
    isPending,
  };
};

export default useDeleteJobCategory;
