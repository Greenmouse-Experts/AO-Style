import { useMutation, useQueryClient } from "@tanstack/react-query";
import useToast from "../useToast";
import FabricService from "../../services/api/fabric";
import StyleService from "../../services/api/style";

const useCreateStyleProduct = (business_id) => {
  const queryClient = useQueryClient();

  const { toastError, toastSuccess } = useToast();

  const { isPending, mutate: createStyleProductMutate } = useMutation({
    mutationFn: (payload) =>
      StyleService.createStyleProduct(payload, business_id),
    mutationKey: ["create-style-product"],
    onSuccess(data) {
      toastSuccess(data?.data?.message);
      queryClient.invalidateQueries({
        queryKey: ["get-style-products"],
      });
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
  return { isPending, createStyleProductMutate };
};

export default useCreateStyleProduct;
