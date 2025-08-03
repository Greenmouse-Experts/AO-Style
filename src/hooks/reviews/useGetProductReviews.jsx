import { useQuery } from "@tanstack/react-query";
import ReviewService from "../../services/api/reviews";

function useGetProductReviews(productId, params = {}) {
  console.log("📤 useGetProductReviews: Called with productId:", productId);
  console.log("📤 useGetProductReviews: Additional params:", params);
  console.log(
    "🎯 useGetProductReviews: FETCHING REVIEWS FOR PRODUCT ID:",
    productId,
  );

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["product-reviews", productId, params],
    queryFn: () => {
      console.log(
        "📡 useGetProductReviews: Making API call for productId:",
        productId,
      );
      return ReviewService.getProductReviews(productId, params);
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  console.log("📊 useGetProductReviews: Hook state:", {
    productId,
    hasData: !!data,
    reviewCount: data?.data?.data?.length || 0,
    totalReviews: data?.data?.count || 0,
    isLoading,
    isError,
    errorMessage: error?.message,
  });

  return {
    reviews: data?.data?.data || [],
    totalReviews: data?.data?.count || 0,
    pagination: data?.data?.pagination || {},
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  };
}

export default useGetProductReviews;
