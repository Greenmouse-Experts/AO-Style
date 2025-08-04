import { useMutation, useQueryClient } from "@tanstack/react-query";
import useToast from "../useToast";
import FabricService from "../../services/api/fabric";
import CartService from "../../services/api/cart";

const useAddMultipleCart = () => {
  const queryClient = useQueryClient();

  const { toastError, toastSuccess } = useToast();

  const { isPending, mutate: addMultipleCartMutate } = useMutation({
    mutationFn: (payload) => CartService.addMultipleToCart(payload),
    mutationKey: ["addmultiple-cart"],
    onSuccess(data) {
      toastSuccess(data?.data?.message || "Items added to cart successfully");
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
        toastError(error?.data?.message || "Failed to add items to cart");
      }
    },
  });
  return { isPending, addMultipleCartMutate };
};

export default useAddMultipleCart;
