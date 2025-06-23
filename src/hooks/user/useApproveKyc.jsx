import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import useToast from "../useToast";
import UserService from "../../services/api/users";

const useApproveKyc = () => {
  const { toastError, toastSuccess } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { isPending, mutate: approveKycMutate } = useMutation({
    mutationFn: (payload) => UserService.approveUserKyc(payload),
    mutationKey: ["approve-userkyc"],
    onSuccess(data) {
      queryClient.invalidateQueries({
        queryKey: ["get-user"],
      });

      toastSuccess(data?.data?.message);
      navigate(-1);
    },
    onError: (error) => {
      toastError(error?.data?.message);
    },
  });
  return { isPending, approveKycMutate };
};

export default useApproveKyc;
