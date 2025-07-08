import { useMutation, useQueryClient } from "@tanstack/react-query";
import useToast from "../useToast";
import FabricService from "../../services/api/fabric";
import CartService from "../../services/api/cart";

const useCreatePayment = () => {
  //   const queryClient = useQueryClient();

  const { toastError, toastSuccess } = useToast();

  const { isPending, mutate: createPaymentMutate } = useMutation({
    mutationFn: (payload) => CartService.createPayment(payload),
    mutationKey: ["create-payment"],
    onSuccess(data) {
      toastSuccess(data?.data?.message);
      //   queryClient.invalidateQueries({
      //     queryKey: ["get-adminfabric-product"],
      //   });
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
  return { isPending, createPaymentMutate };
};

export default useCreatePayment;
