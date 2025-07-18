import { useMutation, useQueryClient } from "@tanstack/react-query";
import FabricService from "../../services/api/fabric";
import useToast from "../useToast";
import CartService from "../../services/api/cart";

const useDeleteCart = () => {
  const queryClient = useQueryClient();

  const { toastError, toastSuccess } = useToast();

  const { isPending, mutate: deleteCartMutate } = useMutation({
    mutationFn: (payload) => CartService.deleteCart(payload),
    mutationKey: ["delete-cart"],
    onSuccess(data) {
      toastSuccess(data?.data?.message);
      queryClient.invalidateQueries({
        queryKey: ["get-cart"],
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
  return { isPending, deleteCartMutate };
};

export default useDeleteCart;
