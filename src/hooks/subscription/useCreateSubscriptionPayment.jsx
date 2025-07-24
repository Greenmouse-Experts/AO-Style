import { useMutation, useQueryClient } from "@tanstack/react-query";
import useToast from "../useToast";
import FabricService from "../../services/api/fabric";
import CartService from "../../services/api/cart";
import SubscriptionService from "../../services/api/subscription";

const useCreateSubscriptionPayment = () => {
  //   const queryClient = useQueryClient();

  const { toastError, toastSuccess } = useToast();

  const { isPending, mutate: createSubMutate } = useMutation({
    mutationFn: (payload) => SubscriptionService.createSubPayment(payload),
    mutationKey: ["create-subpayment"],
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
  return { isPending, createSubMutate };
};

export default useCreateSubscriptionPayment;
