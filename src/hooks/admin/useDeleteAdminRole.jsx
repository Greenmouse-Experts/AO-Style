import { useMutation, useQueryClient } from "@tanstack/react-query";
import useToast from "../useToast";
import AdminRoleService from "../../services/api/adminRole";

const useDeleteAdminRole = () => {
  const queryClient = useQueryClient();

  const { toastError, toastSuccess } = useToast();

  const { isPending, mutate: deleteAdminRoleMutate } = useMutation({
    mutationFn: (payload) => AdminRoleService.deleteAdminRole(payload),
    mutationKey: ["delete-admin-role"],
    onSuccess(data) {
      toastSuccess(data?.data?.message);
      queryClient.invalidateQueries({
        queryKey: ["get-admin-role"],
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
  return { isPending, deleteAdminRoleMutate };
};

export default useDeleteAdminRole;
