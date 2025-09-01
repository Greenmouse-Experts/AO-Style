import { useQuery } from "@tanstack/react-query";
import WithdrawalService from "../../services/api/withdrawal";

function useFetchAllWithdrawals(params) {
  const { isLoading, isFetching, data, isError, refetch, isPending } = useQuery(
    {
      queryKey: ["withdrawal-fetch-all", params],
      queryFn: async () => {
        console.log("🔍 Fetching all withdrawal data with params:", params);
        const response = await WithdrawalService.getAllWithdrawals(params);
        console.log("💸 All Withdrawals Response:", response);
        console.log("📋 All Withdrawals Data:", response?.data?.data);
        console.log("🔢 Total All Withdrawals:", response?.data?.total);
        return response;
      },
    }
  );

  console.log("💰 All Withdrawals Hook State:", {
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

export default useFetchAllWithdrawals;
