import { useMutation, useQueryClient } from "@tanstack/react-query";
import useToast from "../useToast";
import UserService from "../../services/api/users";

const useDeleteUser = () => {
  const { toastError, toastSuccess } = useToast();
  const queryClient = useQueryClient();

  const { isPending, mutate: deleteUserMutate } = useMutation({
    mutationFn: (userId) => UserService.deleteUser(userId),
    mutationKey: ["delete-user"],
    onSuccess(data) {
      queryClient.invalidateQueries({
        queryKey: ["get-all-users-by-role"],
      });

      toastSuccess(data?.data?.message || "User deleted successfully");
    },
    onError: (error) => {
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
  });

  return { isPending, deleteUserMutate };
};

export default useDeleteUser;
