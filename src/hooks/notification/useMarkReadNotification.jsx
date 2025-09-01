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
    mutationFn: (notificationId) =>
      NotificationService.markkReadNotification({ id: notificationId }),
    mutationKey: ["mark-read"],
    onMutate: async (notificationId) => {
      console.log(
        "🔄 Starting optimistic update for notification:",
        notificationId,
      );

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["get-notification"] });

      // Snapshot previous values
      const previousData = queryClient.getQueriesData({
        queryKey: ["get-notification"],
      });

      console.log(
        "📸 Snapshot taken, previous data count:",
        previousData.length,
      );

      // Optimistically update all notification queries
      queryClient.setQueriesData({ queryKey: ["get-notification"] }, (old) => {
        if (!old?.data) {
          console.log("⚠️ No data found in cache");
          return old;
        }

        const wasUnread = old.data.data?.some(
          (n) => n.id === notificationId && !n.read,
        );

        const newCount = wasUnread ? old.data.count - 1 : old.data.count;

        console.log("📊 Count update:", {
          oldCount: old.data.count,
          newCount,
          wasUnread,
          notificationId,
        });

        const updatedData = {
          ...old,
          data: {
            ...old.data,
            data: old.data.data?.map((notification) =>
              notification.id === notificationId
                ? { ...notification, read: true }
                : notification,
            ),
            count: newCount,
          },
        };

        console.log("✅ Optimistic update applied");
        return updatedData;
      });

      return { previousData };
    },
    onSuccess(data) {
      console.log("✅ Mark as read successful:", data);
      toastSuccess(data?.data?.message || "Marked as read");

      // Invalidate and refetch to ensure server sync
      console.log("🔄 Invalidating notification queries...");
      queryClient.invalidateQueries({
        queryKey: ["get-notification"],
      });
    },
    onError: (error, notificationId, context) => {
      console.error("❌ Mark as read failed:", error);

      // Rollback optimistic updates
      if (context?.previousData) {
        console.log("🔄 Rolling back optimistic updates...");
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      if (!navigator.onLine) {
        toastError("No internet connection. Please check your network.");
        return;
      }

      if (Array.isArray(error?.response?.data?.message)) {
        toastError(error?.response?.data?.message[0]);
      } else {
        toastError(error?.response?.data?.message || "Failed to mark as read");
      }
    },
    onSettled: () => {
      // Ensure queries are up to date
      console.log("🏁 Mutation settled, final invalidation...");
      queryClient.invalidateQueries({ queryKey: ["get-notification"] });
    },
  });
  return { isPending, markReadNotificationMutate };
};

export default useMarkReadNotification;
