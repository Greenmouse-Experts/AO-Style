import { useMutation, useQueryClient } from "@tanstack/react-query";
import useToast from "../useToast";
import FAQService from "../../services/api/faq";

const useDeleteFAQ = () => {
  const queryClient = useQueryClient();

  const { toastError, toastSuccess } = useToast();

  const { isPending, mutate: deleteFAQMutate } = useMutation({
    mutationFn: (id) => FAQService.deleteFAQ(id),
    mutationKey: ["delete-faq"],
    onSuccess(data) {
      toastSuccess(data?.data?.message || "FAQ deleted successfully");
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
        toastError(error?.data?.message || "Failed to delete FAQ");
      }
    },
  });

  return {
    isPending,
    deleteFAQMutate,
  };
};

export default useDeleteFAQ;
