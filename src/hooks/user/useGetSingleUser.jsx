import { useQuery } from "@tanstack/react-query";
import UserService from "../../services/api/users";

function useGetUser(id) {
  const { isLoading, isFetching, data, isError, refetch, isPending } = useQuery(
    {
      queryKey: ["get-user", id],
      queryFn: () => UserService.getUser(id),
      enabled: !!id,
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

export default useGetUser;
