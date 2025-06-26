import { useMutation, useQueryClient } from "@tanstack/react-query";
import FabricService from "../../services/api/fabric";
import useToast from "../useToast";
import StyleService from "../../services/api/style";

const useUpdateStyle = () => {
  const queryClient = useQueryClient();

  const { toastError, toastSuccess } = useToast();

  const { isPending, mutate: updateStyleMutate } = useMutation({
    mutationFn: (payload) => StyleService.updateStyleProduct(payload),
    mutationKey: ["update-style-product"],
    onSuccess(data) {
      toastSuccess(data?.data?.message);
      queryClient.invalidateQueries({
        queryKey: ["get-fabric-product"],
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
  return { isPending, updateStyleMutate };
};

export default useUpdateStyle;
