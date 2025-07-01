import { useMutation, useQueryClient } from "@tanstack/react-query";
import useToast from "../useToast";
import FabricService from "../../services/api/fabric";
import AdminRoleService from "../../services/api/adminRole";
import AdminService from "../../services/api/admin";

const useCreateSubAdmin = () => {
  const queryClient = useQueryClient();

  const { toastError, toastSuccess } = useToast();

  const { isPending, mutate: createSubAdminMutate } = useMutation({
    mutationFn: (payload) => AdminService.createSubAdmin(payload),
    mutationKey: ["create-subadmin"],
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
  return { isPending, createSubAdminMutate };
};

export default useCreateSubAdmin;
