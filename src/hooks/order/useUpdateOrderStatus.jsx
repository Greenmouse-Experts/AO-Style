import { useMutation } from "@tanstack/react-query";
// import CaryBinApi from "../../services/api/CarybinBaseUrl";
import useToast from "../useToast";

const useUpdateOrderStatus = () => {
  const { toastError } = useToast();

  const { isPending, mutate: updateOrderStatusMutate } = useMutation({
    mutationFn: ({ id, statusData }) =>
      CaryBinApi.put(`/orders/${id}/status`, statusData, {
        headers: {
          "Content-Type": "application/json",
        },
      }),
    mutationKey: ["update-order-status"],
    onSuccess() {
      // Optionally show a success toast
    },
    onError: (error) => {
      if (!navigator.onLine) {
        toastError("No internet connection. Please check your network.");
        return;
      }
      toastError(error?.data?.message || "Failed to update order status");
    },
  });

  return { isPending, updateOrderStatusMutate };
};

export default useUpdateOrderStatus;
