import { useMutation, useQueryClient } from "@tanstack/react-query";
import useToast from "../useToast";
import StyleService from "../../services/api/style";

const useDeleteAdminStyle = () => {
  const queryClient = useQueryClient();

  const { toastError, toastSuccess } = useToast();

  const { isPending, mutate: deleteAdminStyleMutate } = useMutation({
    mutationFn: (payload) => StyleService.deleteAdminStyleProduct(payload),
    mutationKey: ["delete-adminstyle"],
    onSuccess(data) {
      toastSuccess(data?.data?.message);
      queryClient.invalidateQueries({
        queryKey: ["get-adminfabric-product"],
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
        toastError(error?.data?.message);
      }
    },
  });
  return { isPending, deleteAdminStyleMutate };
};

export default useDeleteAdminStyle;
