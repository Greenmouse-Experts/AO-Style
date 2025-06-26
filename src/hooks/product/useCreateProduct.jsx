import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import useToast from "../useToast";
import ProductService from "../../services/api/products";

const useCreateProduct = () => {
  const queryClient = useQueryClient();

  const { toastError, toastSuccess } = useToast();

  const { isPending, mutate: createProductMutate } = useMutation({
    mutationFn: (payload) => ProductService.createProduct(payload),
    mutationKey: ["create-product"],
    onSuccess(data) {
      toastSuccess(data?.data?.message);
      queryClient.invalidateQueries({
        queryKey: ["get-products"],
      });
    },
    onError: (error) => {
      if (!navigator.onLine) {
        toastError("No internet connection. Please check your network.");
        return;
      }

      toastError(error?.data?.message);
    },
  });
  return { isPending, createProductMutate };
};

export default useCreateProduct;
