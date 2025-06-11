import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import SettingsService from "../../services/api/settings";
import useToast from "../useToast";
import MediaService from "../../services/api/multimedia";

const useUploadImage = () => {
  const { toastError, toastSuccess } = useToast();

  const { isPending, mutate: uploadImageMutate } = useMutation({
    mutationFn: (payload) => MediaService.uploadImage(payload),
    mutationKey: ["upload-image"],
    onSuccess(data) {
      toastSuccess(data?.data?.message);
    },
    onError: (error) => {
      toastError(error?.data?.message);
    },
  });
  return { isPending, uploadImageMutate };
};

export default useUploadImage;