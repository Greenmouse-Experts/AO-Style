import { useQuery } from "@tanstack/react-query";
import MarketRepService from "../../services/api/marketrep";

function useGetAllMarketRepVendors() {
  console.log("🔧 useGetAllMarketRepVendors: Starting queries");

  const {
    data: fabricVendorsData,
    isLoading: fabricVendorsLoading,
    isError: fabricVendorsError,
  } = useQuery({
    queryKey: ["market-rep-fabric-vendors"],
    queryFn: async () => {
      console.log("🔧 useGetAllMarketRepVendors: Fetching fabric vendors");
      const response = await MarketRepService.GetMarketRepVendor({}, "fabric-vendor");
      console.log("🔧 useGetAllMarketRepVendors: Fabric vendors response:", response);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  const {
    data: fashionDesignersData,
    isLoading: fashionDesignersLoading,
    isError: fashionDesignersError,
  } = useQuery({
    queryKey: ["market-rep-fashion-designers"],
    queryFn: async () => {
      console.log("🔧 useGetAllMarketRepVendors: Fetching fashion designers");
      const response = await MarketRepService.GetMarketRepVendor({}, "fashion-designer");
      console.log("🔧 useGetAllMarketRepVendors: Fashion designers response:", response);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Combine and process data
  const combinedData = {
    data: [
      ...(fabricVendorsData?.data || []),
      ...(fashionDesignersData?.data || [])
    ],
    count: (fabricVendorsData?.count || 0) + (fashionDesignersData?.count || 0)
  };

  const isLoading = fabricVendorsLoading || fashionDesignersLoading;
  const isError = fabricVendorsError || fashionDesignersError;

  // Sort by creation date (newest first)
  if (combinedData.data.length > 0) {
    combinedData.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  console.log("🔧 useGetAllMarketRepVendors: Combined results:", {
    fabricVendorsCount: fabricVendorsData?.count || 0,
    fashionDesignersCount: fashionDesignersData?.count || 0,
    totalCount: combinedData.count,
    isLoading,
    isError
  });

  return {
    data: combinedData,
    isLoading,
    isError,
    fabricVendorsData,
    fashionDesignersData,
  };
}

export default useGetAllMarketRepVendors;
