import { useQuery } from "@tanstack/react-query";
import UserService from "../../services/api/users";
import WithdrawalService from "../../services/api/withdrawal";

function useFetchWithdrawal(params) {
  const { isLoading, isFetching, data, isError, refetch, isPending } = useQuery(
    {
      queryKey: ["withdrawal-fetch", params],
      queryFn: () => WithdrawalService.getWithdrawal(params),
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

export default useFetchWithdrawal;
