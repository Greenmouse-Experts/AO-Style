import { useMutation, useQueryClient } from "@tanstack/react-query";
import useToast from "../useToast";
import ProductService from "../../services/api/products";
import MarketService from "../../services/api/market";
import FabricService from "../../services/api/fabric";
import DeliveryService from "../../services/api/delivery";

const useUpdateDelivery = () => {
  const queryClient = useQueryClient();

  const { toastError, toastSuccess } = useToast();

  const { isPending, mutate: updateDeliveryMutate } = useMutation({
    mutationFn: (payload) => DeliveryService.updateDelivery(payload),
    mutationKey: ["update-delivery"],
    onSuccess(data) {
      toastSuccess(data?.data?.message);
      queryClient.invalidateQueries({
        queryKey: ["get-delivery"],
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
  return { isPending, updateDeliveryMutate };
};

export default useUpdateDelivery;
