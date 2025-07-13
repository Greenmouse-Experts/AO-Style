import { useMutation } from "@tanstack/react-query";
import useToast from "../useToast";
import FabricService from "../../services/api/fabric";
import CartService from "../../services/api/cart";
import BillingService from "../../services/api/billing";

const useCreateBilling = () => {
  //   const queryClient = useQueryClient();

  const { toastError, toastSuccess } = useToast();

  const { isPending, mutate: createBillingMutate } = useMutation({
    mutationFn: (payload) => BillingService.createBilling(payload),
    mutationKey: ["create-billing"],
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
  return { isPending, createBillingMutate };
};

export default useCreateBilling;
