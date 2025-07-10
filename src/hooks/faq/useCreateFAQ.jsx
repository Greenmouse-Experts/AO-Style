import { useMutation, useQueryClient } from "@tanstack/react-query";
import useToast from "../useToast";
import FAQService from "../../services/api/faq";

const useCreateFAQ = () => {
  const queryClient = useQueryClient();

  const { toastError, toastSuccess } = useToast();

  const { isPending, mutate: createFAQMutate } = useMutation({
    mutationFn: (payload) => FAQService.createFAQ(payload),
    mutationKey: ["create-faq"],
    onSuccess(data) {
      toastSuccess(data?.data?.message || "FAQ created successfully");
      console.log("FAQ created successfully:", data?.data);
      queryClient.invalidateQueries({
        queryKey: ["get-faqs"],
      });
    },
    onError: (error) => {
      if (!navigator.onLine) {
        toastError("No internet connection. Please check your network.");
        return;
      }

      const message = error?.response?.data?.message || 
                     error?.response?.data?.error?.message || 
                     error?.message || 
                     "Failed to create FAQ";
      
      if (Array.isArray(message)) {
        toastError(message[0]);
      } else {
        toastError(message);
      }
    },
  });

  return {
    isPending,
    createFAQMutate,
  };
};

export default useCreateFAQ;
