import { useMutation, useQueryClient } from "@tanstack/react-query";
import useToast from "../useToast";
import FabricService from "../../services/api/fabric";
import AdminRoleService from "../../services/api/adminRole";

const useCreateAdminRole = () => {
  const queryClient = useQueryClient();

  const { toastError, toastSuccess } = useToast();

  const { isPending, mutate: createAdminRoleMutate } = useMutation({
    mutationFn: (payload) => AdminRoleService.createAdminRole(payload),
    mutationKey: ["create-admin-role"],
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
  return { isPending, createAdminRoleMutate };
};

export default useCreateAdminRole;
