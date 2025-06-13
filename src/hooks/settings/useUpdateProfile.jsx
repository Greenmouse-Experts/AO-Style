import { useMutation, useQueryClient } from "@tanstack/react-query";
import SettingsService from "../../services/api/settings";
import useToast from "../useToast";

const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { toastError, toastSuccess } = useToast();

  const { isPending, mutate: updatePersonalMutate } = useMutation({
    mutationFn: (payload) => SettingsService.updatePersonalInfo(payload),
    mutationKey: ["update-profile"],
    onSuccess(data) {
      toastSuccess(data?.data?.message);
      queryClient.invalidateQueries({
        queryKey: ["get-user-profile"],
      });
    },
    onError: (error) => {
      // @ts-ignore
      toastError(error?.data?.message);
    },
  });
  return { isPending, updatePersonalMutate };
};

export default useUpdateProfile;
