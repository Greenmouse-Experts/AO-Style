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
      // Extract the correct error message from the response
      let message = "Failed to create job";
      
      if (error?.data?.message && Array.isArray(error.data.message)) {
        // Handle validation errors that come as an array
        message = error.data.message[0];
      } else if (error?.response?.data?.message) {
        // Handle general error messages
        message = error.response.data.message;
      } else if (error?.response?.data?.error?.message) {
        // Handle nested error messages
        message = error.response.data.error.message;
      } else if (error?.message) {
        // Handle generic error messages
        message = error.message;
      }
      console.log("Error message:", error);
      toastError(message);
    },
  });

  return {
    createJobMutate,
    isPending,
  };
};

export default useCreateJob;
