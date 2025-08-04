import { useMutation, useQueryClient } from "@tanstack/react-query";
import useToast from "../useToast";
import CartService from "../../services/api/cart";

const useClearCart = () => {
  const queryClient = useQueryClient();
  const { toastError, toastSuccess } = useToast();

  const { isPending, mutate: clearCartMutate } = useMutation({
    mutationFn: () => CartService.clearCart(),
    mutationKey: ["clear-cart"],
    onSuccess(data) {
      toastSuccess(data?.data?.message || "Cart cleared successfully");
      queryClient.invalidateQueries({
        queryKey: ["get-cart"],
      });
      queryClient.invalidateQueries({
        queryKey: ["get-cart-count"],
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
        toastError(error?.data?.message || "Failed to clear cart");
      }
    },
  });

  return { isPending, clearCartMutate };
};

export default useClearCart;
