import { useMutation, useQueryClient } from "@tanstack/react-query";
import useToast from "../useToast";
import AdminRoleService from "../../services/api/adminRole";

const useSuspendOwner = () => {
  const queryClient = useQueryClient();

  const { toastError, toastSuccess } = useToast();

  const { isPending, mutate: suspendOwnerMutate } = useMutation({
    mutationFn: (payload) => AdminRoleService.suspendOwner(payload),
    mutationKey: ["suspend-owner"],
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
  return { isPending, suspendOwnerMutate };
};

export default useSuspendOwner;
