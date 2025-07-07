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

      if (Array.isArray(error?.data?.message)) {
        toastError(error?.data?.message[0]);
      } else {
        toastError(error?.data?.message || "Failed to create FAQ");
      }
    },
  });

  return {
    isPending,
    createFAQMutate,
  };
};

export default useCreateFAQ;
