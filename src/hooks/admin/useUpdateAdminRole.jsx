import { useMutation, useQueryClient } from "@tanstack/react-query";
import useToast from "../useToast";
import ProductService from "../../services/api/products";
import MarketService from "../../services/api/market";
import FabricService from "../../services/api/fabric";
import AdminRoleService from "../../services/api/adminRole";

const useUpdateAdminRole = () => {
  const queryClient = useQueryClient();

  const { toastError, toastSuccess } = useToast();

  const { isPending, mutate: updateRoleMutate } = useMutation({
    mutationFn: (payload) => AdminRoleService.updateAdminRole(payload),
    mutationKey: ["update-admin-role"],
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

      toastError(error?.data?.message);
    },
  });
  return { isPending, updateRoleMutate };
};

export default useUpdateAdminRole;
