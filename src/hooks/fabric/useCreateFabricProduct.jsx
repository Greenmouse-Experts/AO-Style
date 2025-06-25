import { useMutation, useQueryClient } from "@tanstack/react-query";
import useToast from "../useToast";
import FabricService from "../../services/api/fabric";

const useCreateFabricProduct = () => {
  const queryClient = useQueryClient();

  const { toastError, toastSuccess } = useToast();

  const { isPending, mutate: createFabricProductMutate } = useMutation({
    mutationFn: (payload) => FabricService.createFabricProduct(payload),
    mutationKey: ["create-fabric-product"],
    onSuccess(data) {
      toastSuccess(data?.data?.message);
      queryClient.invalidateQueries({
        queryKey: ["get-fabric-products"],
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
  return { isPending, createFabricProductMutate };
};

export default useCreateFabricProduct;
