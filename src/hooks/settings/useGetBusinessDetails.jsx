import { useQuery } from "@tanstack/react-query";
import SettingsService from "../../services/api/settings";

function useGetBusinessDetails() {
  const { isLoading, isFetching, data, isError, refetch, isPending } = useQuery(
    {
      queryKey: ["get-business-details"],
      queryFn: async () => {
        console.log("🔍 Fetching business details...");
        const response = await SettingsService.getBusinessDetails();
        console.log("📊 Business Details Response:", response);
        console.log("💰 Wallet Data:", response?.data?.data?.business_wallet);
        return response;
      },
    },
  );

  console.log("🏢 Business Details Hook State:", {
    isLoading,
    isFetching,
    isPending,
    isError,
    hasData: !!data,
    walletBalance: data?.data?.business_wallet?.balance,
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

export default useGetBusinessDetails;
