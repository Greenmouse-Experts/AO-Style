import { useMutation, useQueryClient } from "@tanstack/react-query";
import useToast from "../useToast";
import FAQService from "../../services/api/faq";

const useToggleFAQStatus = () => {
  const queryClient = useQueryClient();

  const { toastError, toastSuccess } = useToast();

  const { isPending, mutate: toggleFAQStatusMutate } = useMutation({
    mutationFn: ({ id, payload }) => FAQService.toggleFAQStatus(id, payload),
    mutationKey: ["toggle-faq-status"],
    onSuccess(data) {
      toastSuccess(data?.data?.message || "FAQ status updated successfully");
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
        toastError(error?.data?.message || "Failed to update FAQ status");
      }
    },
  });

  return {
    isPending,
    toggleFAQStatusMutate,
  };
};

export default useToggleFAQStatus;
