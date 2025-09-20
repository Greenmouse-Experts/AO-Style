import { useQuery } from "@tanstack/react-query";
import MarketRepService from "../../services/api/marketrep";
import useGetAllMarketRepVendor from "./useGetAllReps";

const useGetMarketRepAllVendorProducts = (options = {}) => {
  const {
    enabled = true,
    refetchInterval = false,
    staleTime = 5 * 60 * 1000, // 5 minutes
    ...queryOptions
  } = options;

  // Get all fabric vendors managed by this market rep
  const { data: getAllFabVendorData, isLoading: vendorsLoading } =
    useGetAllMarketRepVendor({}, "fabric-vendor");

  console.log("🔧 HOOK: useGetMarketRepAllVendorProducts called");
  console.log("🔧 HOOK: Vendors:", getAllFabVendorData?.data);
  console.log("🔧 HOOK: Vendors loading:", vendorsLoading);

  const {
    data,
    isLoading: productsLoading,
    isError,
    error,
    refetch,
    isPending,
    isFetching,
  } = useQuery({
    queryKey: [
      "market-rep-all-vendor-products",
      getAllFabVendorData?.data?.map((v) => v.id),
    ],
    queryFn: async () => {
      console.log("🔧 HOOK: QueryFn executing for all vendor products");

      if (!getAllFabVendorData?.data || getAllFabVendorData.data.length === 0) {
        console.log("🔧 HOOK: No vendors found, returning empty array");
        return [];
      }

      // Fetch products for all vendors
      const promises = getAllFabVendorData.data.map((vendor) =>
        MarketRepService.getMarketRepProducts({ vendor_id: vendor.id })
          .then((response) => ({
            vendor,
            products: response?.data?.data || [],
          }))
          .catch((error) => {
            console.error(
              `🔧 HOOK: Error fetching products for vendor ${vendor.id}:`,
              error,
            );
            return { vendor, products: [] };
          }),
      );

      const results = await Promise.all(promises);
      console.log("🔧 HOOK: All vendor products results:", results);

      // Flatten all products and add vendor info to each product
      const allProducts = results.reduce((acc, { vendor, products }) => {
        const productsWithVendor = products.map((product) => ({
          ...product,
          vendor_info: {
            id: vendor.id,
            name: vendor.name,
            business_name: vendor.business_name,
            email: vendor.email,
          },
        }));
        return [...acc, ...productsWithVendor];
      }, []);

      console.log("🔧 HOOK: Flattened products with vendor info:", allProducts);
      return allProducts;
    },
    enabled:
      enabled &&
      !vendorsLoading &&
      getAllFabVendorData?.data &&
      getAllFabVendorData.data.length > 0,
    refetchInterval,
    staleTime,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onSuccess: (data) => {
      console.log(
        "🔧 HOOK: useGetMarketRepAllVendorProducts successful, processed data:",
        data,
      );
    },
    onError: (error) => {
      console.error("🔧 HOOK: useGetMarketRepAllVendorProducts error:", error);
    },
    ...queryOptions,
  });

  // Process the final data
  const products = data || [];
  const isLoading = vendorsLoading || productsLoading;

  console.log("🔧 HOOK: Final hook state:");
  console.log("  - products:", products);
  console.log("  - products count:", products.length);
  console.log("  - isLoading:", isLoading);
  console.log("  - isError:", isError);
  console.log("  - vendors count:", getAllFabVendorData?.data?.length || 0);

  return {
    products,
    isLoading,
    isError,
    error,
    refetch,
    isPending,
    isFetching,
    vendors: getAllFabVendorData?.data || [],
    rawData: data,
  };
};

export default useGetMarketRepAllVendorProducts;
