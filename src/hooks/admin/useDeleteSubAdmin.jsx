import { useMutation, useQueryClient } from "@tanstack/react-query";
import useToast from "../useToast";
import AdminService from "../../services/api/admin";

const useDeleteSubAdmin = () => {
  const queryClient = useQueryClient();

  const { toastError, toastSuccess } = useToast();

  const { isPending, mutate: deleteSubAdminMutate } = useMutation({
    mutationFn: (payload) => AdminService.deleteSubAdmin(payload),
    mutationKey: ["delete-subadmin"],
    onMutate: async (payload) => {
      // Cancel any outgoing refetches so they don't overwrite optimistic update
      await queryClient.cancelQueries({ queryKey: ["get-all-userby-role"] });

      // Get all current queries that match the pattern
      const queries = queryClient.getQueriesData({
        queryKey: ["get-all-userby-role"],
      });

      // Optimistically remove the admin from all matching queries
      queries.forEach(([queryKey, queryData]) => {
        if (queryData?.data) {
          const updatedData = {
            ...queryData,
            data: queryData.data.filter((admin) => admin.id !== payload.id),
            count: queryData.count
              ? queryData.count - 1
              : queryData.data.length - 1,
          };
          queryClient.setQueryData(queryKey, updatedData);
        }
      });

      // Return context for rollback
      return { previousQueries: queries };
    },
    onSuccess(data, payload) {
      toastSuccess(data?.data?.message);
      queryClient.invalidateQueries({
        queryKey: ["get-all-userby-role"],
      });

      // Remove any cached admin detail data
      queryClient.removeQueries({
        queryKey: ["get-user", payload.id],
      });
    },
    onError: (error, payload, context) => {
      // Rollback optimistic updates on error
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, queryData]) => {
          queryClient.setQueryData(queryKey, queryData);
        });
      }

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
    onSettled: () => {
      // Always refetch after mutation completes (success or error)
      queryClient.invalidateQueries({
        queryKey: ["get-all-userby-role"],
      });
    },
  });
  return { isPending, deleteSubAdminMutate };
};

export default useDeleteSubAdmin;
