import { useMutation, useQueryClient } from "@tanstack/react-query";
import useToast from "../useToast";
import AdminService from "../../services/api/admin";

const useDeleteSubAdmin = () => {
  const queryClient = useQueryClient();

  const { toastError, toastSuccess } = useToast();

  const { isPending, mutate: deleteSubAdminMutate } = useMutation({
    mutationFn: (payload) => AdminService.deleteSubAdmin(payload),
    mutationKey: ["delete-subadmin"],
    onSuccess(data, payload) {
      toastSuccess(data?.data?.message);

      // Invalidate all related queries
      queryClient.invalidateQueries({
        queryKey: ["get-all-userby-role"],
      });

      // Also invalidate any queries with different parameters
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === "get-all-userby-role",
      });

      // Remove any cached admin detail data
      queryClient.removeQueries({
        queryKey: ["get-user", payload.id],
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
        toastError(error?.data?.message || "Failed to delete admin");
      }
    },
  });
  return { isPending, deleteSubAdminMutate };
};

export default useDeleteSubAdmin;
