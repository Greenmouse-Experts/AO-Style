import { useMutation, useQueryClient } from "@tanstack/react-query";
import AnnouncementService from "../../services/api/announcement/index";

const useMarkAnnouncementAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => AnnouncementService.markAnnouncementAsRead(id),
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["announcements"] });

      // Snapshot the previous value
      const previousAnnouncements = queryClient.getQueryData([
        "announcements",
        "user",
      ]);

      // Optimistically update to the new value
      queryClient.setQueryData(["announcements", "user"], (oldData) => {
        if (!oldData) return oldData;

        const updateAnnouncements = (announcements) => {
          return announcements.map((announcement) =>
            announcement.id === id
              ? { ...announcement, read: true, is_read: true }
              : announcement,
          );
        };

        // Handle different data structures
        if (Array.isArray(oldData)) {
          return updateAnnouncements(oldData);
        }

        if (oldData.data && Array.isArray(oldData.data)) {
          return {
            ...oldData,
            data: updateAnnouncements(oldData.data),
          };
        }

        if (oldData.data?.data && Array.isArray(oldData.data.data)) {
          return {
            ...oldData,
            data: {
              ...oldData.data,
              data: updateAnnouncements(oldData.data.data),
            },
          };
        }

        return oldData;
      });

      // Return a context object with the snapshotted value
      return { previousAnnouncements };
    },
    onSuccess: (data, id) => {
      console.log("Successfully marked announcement as read:", id);
      // The optimistic update should already be in place
      // Optionally invalidate to ensure consistency
      queryClient.invalidateQueries({
        queryKey: ["announcements"],
        exact: false,
      });
    },
    onError: (error, id, context) => {
      console.error("Failed to mark announcement as read:", error);
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousAnnouncements) {
        queryClient.setQueryData(
          ["announcements", "user"],
          context.previousAnnouncements,
        );
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });
};

export default useMarkAnnouncementAsRead;
