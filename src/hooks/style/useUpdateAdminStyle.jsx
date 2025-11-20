import { useMutation, useQueryClient } from "@tanstack/react-query";
import FabricService from "../../services/api/fabric";
import useToast from "../useToast";
import StyleService from "../../services/api/style";

const useUpdateAdminStyle = (business_id) => {
  const queryClient = useQueryClient();

  const { toastError, toastSuccess } = useToast();

  const { isPending, mutate: updateAdminStyleMutate } = useMutation({
    mutationFn: (payload) =>
      StyleService.updateAdminStyleProduct({
        ...payload,
        business_id,
      }),
    mutationKey: ["update-adminstyle-product"],
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
  return { isPending, updateAdminStyleMutate };
};

export default useUpdateAdminStyle;
