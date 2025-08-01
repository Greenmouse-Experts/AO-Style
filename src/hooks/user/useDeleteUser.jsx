import { useMutation, useQueryClient } from "@tanstack/react-query";
import useToast from "../useToast";
import UserService from "../../services/api/users";

const useDeleteUser = () => {
  const { toastError, toastSuccess } = useToast();
  const queryClient = useQueryClient();

  const { isPending, mutate: deleteUserMutate } = useMutation({
    mutationFn: (userId) => UserService.deleteUser(userId),
    mutationKey: ["delete-user"],
    onMutate: async (userId) => {
      // Cancel any outgoing refetches so they don't overwrite optimistic update
      await queryClient.cancelQueries({ queryKey: ["get-all-userby-role"] });

      // Get all current queries that match the pattern
      const queries = queryClient.getQueriesData({
        queryKey: ["get-all-userby-role"],
      });

      // Optimistically remove the user from all matching queries
      queries.forEach(([queryKey, queryData]) => {
        if (queryData?.data) {
          const updatedData = {
            ...queryData,
            data: queryData.data.filter((user) => user.id !== userId),
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
    onSuccess(data, userId) {
      // Invalidate all user-related queries to ensure consistency
      queryClient.invalidateQueries({
        queryKey: ["get-all-userby-role"],
      });

      // Also invalidate any specific user queries
      queryClient.invalidateQueries({
        queryKey: ["get-user"],
      });

      // Invalidate market rep queries for market representatives
      queryClient.invalidateQueries({
        queryKey: ["get-market-rep"],
      });

      // Remove any cached user detail data
      queryClient.removeQueries({
        queryKey: ["get-user", userId],
      });

      toastSuccess(data?.data?.message || "User deleted successfully");
    },
    onError: (error, userId, context) => {
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
        toastError(error?.data?.message || "Failed to delete user");
      }
    },
    onSettled: () => {
      // Always refetch after mutation completes (success or error)
      queryClient.invalidateQueries({
        queryKey: ["get-all-userby-role"],
      });

      // Also invalidate market rep queries
      queryClient.invalidateQueries({
        queryKey: ["get-market-rep"],
      });
    },
  });

  return { isPending, deleteUserMutate };
};

export default useDeleteUser;
