import { useMutation, useQueryClient } from "@tanstack/react-query";
import MarketRepService from "../../services/api/marketrep";
import useToast from "../useToast";

const useAddFabricVendor = () => {
  const { toastError, toastSuccess } = useToast();

  const queryClient = useQueryClient();

  const { isPending, mutate: addMarketRepFabricVendorMutate } = useMutation({
    mutationFn: (payload) => MarketRepService.addMarketRepFabric(payload),
    mutationKey: ["add-marketrep-fabricvendor"],
    onSuccess(data) {
      toastSuccess(data?.data?.message);
      queryClient.invalidateQueries({
        queryKey: ["get-market-rep-vendor"],
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
  return { isPending, addMarketRepFabricVendorMutate };
};

export default useAddFabricVendor;
