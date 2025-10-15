import { useQuery } from "@tanstack/react-query";
import MarketRepService from "../../services/api/marketrep";

const useGetMarketRepProfile = () => {
  const {
    data: profileData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["market-rep-profile"],
    queryFn: async () => {
      console.log("🔧 MARKET REP PROFILE: Starting API call");
      const response = await MarketRepService.getMarketRepProfile();
      console.log("🔧 MARKET REP PROFILE: Full API Response received", response);
      console.log("🔧 MARKET REP PROFILE: Profile data structure", {
        statusCode: response.data?.statusCode,
        hasWallet: !!response.data?.data?.wallet,
        walletBalance: response.data?.data?.wallet?.balance,
        walletCurrency: response.data?.data?.wallet?.currency,
        userName: response.data?.data?.name,
        userRole: response.data?.data?.role?.name,
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error) => {
      console.error("🔧 MARKET REP PROFILE ERROR:", error);
      console.error("🔧 MARKET REP PROFILE ERROR Response:", error.response);
    },
  });

  // Extract wallet data for easier access
  const walletData = profileData?.data?.wallet;
  const userProfile = profileData?.data;

  return {
    profileData,
    walletData,
    userProfile,
    isLoading,
    isError,
    error,
    refetch,
  };
};

export default useGetMarketRepProfile;
