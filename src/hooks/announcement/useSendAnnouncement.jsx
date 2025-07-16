import { useMutation } from "@tanstack/react-query";
import AnnouncementService from "../../services/api/announcement/index";
import useToast from "../useToast";

const useSendAnnouncement = () => {
  const { toastSuccess, toastError } = useToast();

  return useMutation({
    mutationFn: (payload) => AnnouncementService.sendAnnouncement(payload),
    onSuccess: (response) => {
      toastSuccess(response?.data?.message || "Announcement sent successfully!");
    },
    onError: (error) => {
      const errorMessage = 
        error?.response?.data?.message || 
        error?.message || 
        "Failed to send announcement";
      toastError(errorMessage);
    },
  });
};

export default useSendAnnouncement;
