import { useQuery } from "@tanstack/react-query";
import UserService from "../../services/api/users";
import WithdrawalService from "../../services/api/withdrawal";

function useFetchWithdrawal(params) {
  const { isLoading, isFetching, data, isError, refetch, isPending } = useQuery(
    {
      queryKey: ["withdrawal-fetch", params],
      queryFn: async () => {
        console.log("🔍 Fetching withdrawal data with params:", params);
        const response = await WithdrawalService.getWithdrawal(params);
        console.log("💸 Withdrawal Response:", response);
        console.log("📋 Withdrawal Data:", response?.data?.data);
        console.log("🔢 Total Withdrawals:", response?.data?.total);
        return response;
      },
    },
  );

  console.log("💰 Withdrawal Hook State:", {
    isLoading,
    isFetching,
    isPending,
    isError,
    params,
    hasData: !!data,
    withdrawalCount: data?.data?.data?.length || 0,
  });

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
