import { useMutation } from "@tanstack/react-query";
import useToast from "../useToast";
import MediaService from "../../services/api/multimedia";

const useUploadImages = () => {
  const { toastError } = useToast();

  const { isPending, mutate: uploadImagesMutate } = useMutation({
    mutationFn: (payload) => MediaService.uploadImages(payload),
    mutationKey: ["upload-images"],
    onSuccess() {
      // toastSuccess(data?.data?.message);
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
  return { isPending, uploadImagesMutate };
};

export default useUploadImages;
