import { useMutation, useQueryClient } from "@tanstack/react-query";
import useToast from "../useToast";
import ProductService from "../../services/api/products";
import MarketService from "../../services/api/market";
import FabricService from "../../services/api/fabric";
import AdminRoleService from "../../services/api/adminRole";
import NotificationService from "../../services/api/notification";

const useMarkReadNotification = () => {
  const queryClient = useQueryClient();

  const { toastError, toastSuccess } = useToast();

  const { isPending, mutate: markReadNotificationMutate } = useMutation({
    mutationFn: (payload) => NotificationService.markkReadNotification(payload),
    mutationKey: ["mark-read"],
    onSuccess(data) {
      toastSuccess(data?.data?.message);
      queryClient.invalidateQueries({
        queryKey: ["get-notification"],
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
  return { isPending, markReadNotificationMutate };
};

export default useMarkReadNotification;
