import { useMutation } from "@tanstack/react-query";
import Cookies from "js-cookie";
import SettingsService from "../../services/api/settings";
import useToast from "../useToast";
import MediaService from "../../services/api/multimedia";

const useUploadDocument = () => {
  const { toastError } = useToast();

  const { isPending, mutate: uploadDocumentMutate } = useMutation({
    mutationFn: (payload) => MediaService.uploadDocument(payload),
    mutationKey: ["upload-document"],
    onSuccess() {
      // toastSuccess(data?.data?.message);
    },
    onError: (error) => {
      toastError(error?.data?.message);
    },
  });
  return { isPending, uploadDocumentMutate };
};

export default useUploadDocument;
