import { useMutation, useQueryClient } from "@tanstack/react-query";
import useToast from "../useToast";
import FabricService from "../../services/api/fabric";

const useUpdateAdminFabric = () => {
  const queryClient = useQueryClient();

  const { toastError, toastSuccess } = useToast();

  const { isPending, mutate: updateAdminFabricMutate } = useMutation({
    mutationFn: (payload) => FabricService.updateAdminFabricProduct(payload),
    mutationKey: ["update-adminfabric-product"],
    onSuccess(data) {
      toastSuccess(data?.data?.message);
      queryClient.invalidateQueries({
        queryKey: ["get-adminfabric-product"],
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
  return { isPending, updateAdminFabricMutate };
};

export default useUpdateAdminFabric;
