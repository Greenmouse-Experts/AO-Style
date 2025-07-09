import { useMutation, useQueryClient } from "@tanstack/react-query";
import useToast from "../useToast";
import FAQService from "../../services/api/faq";

const useUpdateFAQ = () => {
  const queryClient = useQueryClient();

  const { toastError, toastSuccess } = useToast();

  const { isPending, mutate: updateFAQMutate } = useMutation({
    mutationFn: ({ id, payload }) => FAQService.updateFAQ(id, payload),
    mutationKey: ["update-faq"],
    onSuccess(data) {
      toastSuccess(data?.data?.message || "FAQ updated successfully");
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
        toastError(error?.data?.message || "Failed to update FAQ");
      }
    },
  });

  return {
    isPending,
    updateFAQMutate,
  };
};

export default useUpdateFAQ;
