import { useQuery } from "@tanstack/react-query";
import CartService from "../../services/api/cart";

function useGetCartCount() {
  const { isLoading, isFetching, data, isError, refetch, isPending } = useQuery(
    {
      queryKey: ["get-cart-count"],
      queryFn: () => CartService.getCartCount(),
      staleTime: 30000, // 30 seconds
      refetchOnWindowFocus: true,
    }
  );

  return {
    isLoading,
    isFetching,
    data: data?.data,
    count: data?.data?.count || 0,
    isError,
    isPending,
    refetch,
  };
}

export default useGetCartCount;
