import { useQuery } from "@tanstack/react-query";
import MarketRepService from "../../services/api/marketrep";

const useGetVendorProducts = (vendorId, options = {}) => {
  const {
    enabled = true,
    refetchInterval = false,
    staleTime = 5 * 60 * 1000, // 5 minutes
    ...queryOptions
  } = options;

  const { data, isLoading, isError, error, refetch, isPending, isFetching } =
    useQuery({
      queryKey: ["vendor-products", vendorId],
      queryFn: () => {
        console.log(
          "🔧 useGetVendorProducts: Starting query for vendor:",
          vendorId,
        );
        return MarketRepService.getMarketRepProducts({ vendor_id: vendorId })
          .then((response) => {
            console.log("🔧 useGetVendorProducts: Raw API response:", response);
            console.log("🔧 useGetVendorProducts: Response data structure:", {
              status: response?.status,
              data: response?.data,
              hasNestedData: !!response?.data?.data,
              dataLength: response?.data?.data?.length || 0,
            });
            return response;
          })
          .catch((error) => {
            console.error("🔧 useGetVendorProducts: API error:", error);
            throw error;
          });
      },
      enabled: enabled && !!vendorId,
      refetchInterval,
      staleTime,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      ...queryOptions,
    });

  // Process the data to ensure consistent structure
  // The API returns: { data: { status: 200, data: [...products] } }
  const products = data?.data?.data || [];

  console.log("🔧 useGetVendorProducts: Hook return values:");
  console.log("  - vendorId:", vendorId);
  console.log("  - rawData:", data);
  console.log("  - API response structure:", {
    hasData: !!data,
    hasNestedData: !!data?.data,
    hasProductsArray: !!data?.data?.data,
    productsCount: data?.data?.data?.length || 0,
    firstProduct: data?.data?.data?.[0] || null,
  });
  console.log("  - processed products:", products);
  console.log("  - products count:", products.length);
  console.log("  - isLoading:", isLoading);
  console.log("  - isError:", isError);
  console.log("  - error:", error);

  // Log the structure of the first product for debugging
  if (products.length > 0) {
    console.log("🔧 useGetVendorProducts: First product structure:", {
      id: products[0].id,
      name: products[0].name,
      price: products[0].price,
      original_price: products[0].original_price,
      hasFabric: !!products[0].fabric,
      hasStyle: !!products[0].style,
      hasPhotos: !!products[0].photos,
      fabricPhotos: products[0].fabric?.photos?.length || 0,
      stylePhotos: products[0].style?.photos?.length || 0,
      creator: products[0].creator?.name || "No creator",
      category: products[0].category?.name || "No category",
    });
  }

  return {
    products,
    isLoading,
    isError,
    error,
    refetch,
    isPending,
    isFetching,
    rawData: data,
  };
};

export default useGetVendorProducts;
