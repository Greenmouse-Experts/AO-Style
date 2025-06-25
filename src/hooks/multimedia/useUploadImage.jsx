import { useMutation } from "@tanstack/react-query";
import Cookies from "js-cookie";
import SettingsService from "../../services/api/settings";
import useToast from "../useToast";
import MediaService from "../../services/api/multimedia";

const useUploadImage = () => {
  const { toastError } = useToast();

  const { isPending, mutate: uploadImageMutate } = useMutation({
    mutationFn: (payload) => MediaService.uploadImage(payload),
    mutationKey: ["upload-image"],
    onSuccess() {
      // toastSuccess(data?.data?.message);
    },
    onError: (error) => {
      if (!navigator.onLine) {
        toastError("No internet connection. Please check your network.");
        return;
      }

      toastError(error?.data?.message);
    },
  });
  return { isPending, uploadImageMutate };
};

export default useUploadImage;
