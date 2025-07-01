import { useMutation, useQueryClient } from "@tanstack/react-query";
import useToast from "../useToast";
import AdminService from "../../services/api/admin";

const useDeleteSubAdmin = () => {
  const queryClient = useQueryClient();

  const { toastError, toastSuccess } = useToast();

  const { isPending, mutate: deleteSubAdminMutate } = useMutation({
    mutationFn: (payload) => AdminService.deleteSubAdmin(payload),
    mutationKey: ["delete-subadmin"],
    onSuccess(data) {
      toastSuccess(data?.data?.message);
      queryClient.invalidateQueries({
        queryKey: ["get-all-userby-role"],
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
  return { isPending, deleteSubAdminMutate };
};

export default useDeleteSubAdmin;
