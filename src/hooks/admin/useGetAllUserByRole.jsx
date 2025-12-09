import { useQuery } from "@tanstack/react-query";
import MarketRepService from "../../services/api/marketrep";
import UserService from "../../services/api/users";

function useGetAllUsersByRole(params) {
  const { isLoading, isFetching, data, isError, refetch, isPending } = useQuery(
    {
      queryKey: ["get-all-userby-role", params],
      queryFn: () => UserService.getUsersByRole(params),
      enabled: !!params?.role, // Only fetch when role is provided
    },
  );

  return {
    isLoading,
    isFetching,
    data: { data: data?.data?.data, count: data?.data?.count },
    isError,
    isPending,
    refetch,
  };
}

export default useGetAllUsersByRole;
