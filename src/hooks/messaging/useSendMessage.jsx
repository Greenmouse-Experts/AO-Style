import { useMutation } from "@tanstack/react-query";
import MessagingService from "../../services/api/messaging";
import useToast from "../useToast";

const useSendMessage = () => {
  const { toastError, toastSuccess } = useToast();

  const { isPending, mutate: sendMessageMutate, isError, error } = useMutation({
    mutationFn: (payload) => MessagingService.sendMessage(payload),
    mutationKey: ["send-message"],
    onSuccess: (data) => {
      toastSuccess(data?.data?.message || "Message sent successfully");
    },
    onError: (error) => {
      if (!navigator.onLine) {
        toastError("No internet connection. Please check your network.");
        return;
      }
      toastError(error?.data?.message || "Failed to send message");
    },
  });

  return {
    isPending,
    sendMessageMutate,
    isError,
    error
  };
};

export default useSendMessage;
