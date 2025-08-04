import { useMutation, useQueryClient } from "@tanstack/react-query";
import useToast from "../useToast";
import CartService from "../../services/api/cart";

const useUpdateCartItem = () => {
  const queryClient = useQueryClient();
  const { toastError, toastSuccess } = useToast();

  const { isPending, mutate: updateCartItemMutate } = useMutation({
    mutationFn: (payload) => CartService.updateCartItem(payload),
    mutationKey: ["update-cart-item"],
    onSuccess(data, variables) {
      // Custom success message based on what was updated
      let message = "Cart item updated successfully";
      if (variables.style_product_id && variables.measurement) {
        message = "Style and measurements added to cart successfully";
      } else if (variables.style_product_id) {
        message = "Style added to cart successfully";
      } else if (variables.measurement) {
        message = "Measurements added to cart successfully";
      } else if (
        variables.quantity &&
        !variables.style_product_id &&
        !variables.measurement
      ) {
        message = "Cart quantity updated successfully";
      }

      toastSuccess(data?.data?.message || message);
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
        toastError(error?.data?.message || "Failed to update cart item");
      }
    },
  });

  return { isPending, updateCartItemMutate };
};

export default useUpdateCartItem;
