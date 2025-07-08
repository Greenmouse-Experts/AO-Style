import { useMutation, useQueryClient } from "@tanstack/react-query";
import JobService from "../../services/api/jobs";
import useToast from "../useToast";

const useCreateJobCategory = () => {
  const queryClient = useQueryClient();
  const { toastSuccess, toastError } = useToast();

  const { mutate: createJobCategoryMutate, isPending } = useMutation({
    mutationFn: (payload) => {
      console.log("➕ Creating job category:", payload);
      return JobService.createJobCategory(payload);
    },
    onSuccess: (data, variables) => {
      console.log("✅ Job category created successfully:", { data, variables });
      queryClient.invalidateQueries({ queryKey: ["get-job-categories"] });
      toastSuccess("Job category created successfully");
    },
    onError: (error, variables) => {
      console.error("❌ Failed to create job category:", { error, variables });
      const message = error?.response?.data?.message || "Failed to create job category";
      toastError(message);
    },
  });

  return {
    createJobCategoryMutate,
    isPending,
  };
};

export default useCreateJobCategory;
