import { useQuery } from "@tanstack/react-query";
import ReviewService from "../../services/api/reviews";

function useGetProductAverageRating(productId) {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["product-average-rating", productId],
    queryFn: () => ReviewService.getProductAverageRating(productId),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    averageRating: data?.data?.data?.averageRating || 0,
    totalReviews: data?.data?.data?.totalReviews || 0,
    ratingData: data?.data?.data || null,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  };
}

export default useGetProductAverageRating;
