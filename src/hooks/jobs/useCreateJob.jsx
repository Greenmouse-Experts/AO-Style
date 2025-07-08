import { useMutation, useQueryClient } from "@tanstack/react-query";
import JobService from "../../services/api/jobs";
import useToast from "../useToast";

const useCreateJob = () => {
  const queryClient = useQueryClient();
  const { toastSuccess, toastError } = useToast();

  const { mutate: createJobMutate, isPending } = useMutation({
    mutationFn: (payload) => {
      console.log("➕ Creating job:", payload);
      return JobService.createJob(payload);
    },
    onSuccess: (data, variables) => {
      console.log("✅ Job created successfully:", { data, variables });
      queryClient.invalidateQueries({ queryKey: ["get-jobs"] });
      toastSuccess("Job created successfully");
    },
    onError: (error, variables) => {
      console.error("❌ Failed to create job:", { error, variables });
      const message = error?.response?.data?.message || "Failed to create job";
      toastError(message);
    },
  });

  return {
    createJobMutate,
    isPending,
  };
};

export default useCreateJob;
