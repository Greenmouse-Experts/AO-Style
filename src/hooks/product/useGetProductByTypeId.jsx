import { useQuery } from "@tanstack/react-query";
import ProductService from "../../services/api/products";

function useGetProductByTypeId(type, id, params = {}, options = {}) {
  const { isLoading, isFetching, data, isError, refetch, isPending } = useQuery(
    {
      queryKey: ["get-product-by-type-id", type, id, params],
      queryFn: () => ProductService.getProductByTypeAndId(type, id, params),
      enabled: !!(type && id), // Only run query if both type and id are provided
      ...options,
    }
  );

  return {
    isLoading,
    isFetching,
    data: data?.data,
    isError,
    isPending,
    refetch,
  };
}

export default useGetProductByTypeId;
