import { useQuery } from "@tanstack/react-query";
import AdminRoleService from "../../services/api/adminRole";

function useFetchAllCartTransactions(params) {
  const { isLoading, isFetching, data, isError, refetch, isPending } = useQuery(
    {
      queryKey: ["get-cart-transactions", params],
      queryFn: () => AdminRoleService.getAllCartTransactions(params),
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

export default useFetchAllCartTransactions;
