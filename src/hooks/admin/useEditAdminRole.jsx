import { useMutation, useQueryClient } from "@tanstack/react-query";
import useToast from "../useToast";
import FabricService from "../../services/api/fabric";
import AdminRoleService from "../../services/api/adminRole";
import AdminService from "../../services/api/admin";

const useEditAdminRole = () => {
  const queryClient = useQueryClient();

  const { toastError, toastSuccess } = useToast();

  const { isPending, mutate: editAdminRoleMutate } = useMutation({
    mutationFn: (payload) => AdminService.updateAdminRole(payload),
    mutationKey: ["update-adminrole"],
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
  return { isPending, editAdminRoleMutate };
};

export default useEditAdminRole;
