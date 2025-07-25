import { useMutation, useQueryClient } from "@tanstack/react-query";
import useToast from "../useToast";
import DeliveryService from "../../services/api/delivery";

const useAddDelivery = () => {
  const queryClient = useQueryClient();

  const { toastError, toastSuccess } = useToast();

  const { isPending, mutate: addDeliveryMutate } = useMutation({
    mutationFn: (payload) => DeliveryService.addDelivery(payload),
    mutationKey: ["add-delivery"],
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
  return { isPending, addDeliveryMutate };
};

export default useAddDelivery;
