import { useMutation, useQueryClient } from "@tanstack/react-query";
import ProductService from "../../services/api/products";
import MarketService from "../../services/api/market";
import FabricService from "../../services/api/fabric";
import useToast from "../useToast";

const useDeleteFabric = () => {
  const queryClient = useQueryClient();

  const { toastError, toastSuccess } = useToast();

  const { isPending, mutate: deleteFabricMutate } = useMutation({
    mutationFn: (payload) => FabricService.deleteFabricProduct(payload),
    mutationKey: ["delete-fabric"],
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
  return { isPending, deleteFabricMutate };
};

export default useDeleteFabric;
