import React from "react";
import { Star, TrendingUp } from "lucide-react";
import StarRating from "./StarRating";
import useGetProductAverageRating from "../../hooks/reviews/useGetProductAverageRating";
import useGetProductReviews from "../../hooks/reviews/useGetProductReviews";
import LoaderComponent from "../BeatLoader";

const ReviewSummary = ({ productId, className = "" }) => {
  const {
    averageRating,
    totalReviews,
    ratingData,
    isLoading: avgLoading,
    isError: avgError,
    error: avgErrorMessage,
  } = useGetProductAverageRating(productId);

  const {
    reviews,
    isLoading: reviewsLoading,
    isError: reviewsError,
  } = useGetProductReviews(productId);

  const isLoading = avgLoading || reviewsLoading;
  const isError = avgError || reviewsError;
  const error = avgErrorMessage;

  if (isLoading) {
    return (
      <div className={`bg-gray-50 rounded-lg p-6 ${className}`}>
        <div className="flex justify-center">
          <LoaderComponent />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={`bg-red-50 rounded-lg p-6 ${className}`}>
        <p className="text-red-600 text-center">
          Failed to load rating: {error?.message || "Unknown error"}
        </p>
      </div>
    );
  }

  if (totalReviews === 0) {
    return (
      <div className={`bg-gray-50 rounded-lg p-6 text-center ${className}`}>
        <Star size={48} className="mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Reviews Yet
        </h3>
        <p className="text-gray-600">Be the first to review this product!</p>
      </div>
    );
  }

  // Calculate rating distribution from actual reviews
  const calculateRatingDistribution = () => {
    const distribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    reviews.forEach((review) => {
      const rating = review.rating;
      if (rating >= 1 && rating <= 5) {
        distribution[rating]++;
      }
    });

    console.log(
      "📊 ReviewSummary: Calculated rating distribution:",
      distribution,
    );
    console.log(
      "📊 ReviewSummary: From reviews:",
      reviews.map((r) => ({ id: r.id, rating: r.rating })),
    );

    return distribution;
  };

  const distribution = calculateRatingDistribution();

  const getPercentage = (count) => {
    return totalReviews > 0 ? (count / totalReviews) * 100 : 0;
  };

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}
    >
      {/* Main Rating Display */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="text-4xl font-bold text-gray-900">
            {averageRating.toFixed(1)}
          </span>
          <div className="flex flex-col items-start">
            <StarRating rating={averageRating} readonly={true} size={24} />
            <span className="text-sm text-gray-600 mt-1">
              {totalReviews} review{totalReviews !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {averageRating >= 4 && (
          <div className="flex items-center justify-center gap-1 text-green-600">
            <TrendingUp size={16} />
            <span className="text-sm font-medium">Highly Rated</span>
          </div>
        )}
      </div>

      {/* Rating Distribution */}
      {Object.keys(distribution).length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Rating Breakdown
          </h4>

          {[5, 4, 3, 2, 1].map((stars) => {
            const count = distribution[stars] || 0;
            const percentage = getPercentage(count);

            return (
              <div key={stars} className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1 w-12">
                  <span className="text-gray-700">{stars}</span>
                  <Star size={12} className="text-yellow-400 fill-current" />
                </div>

                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <span className="text-gray-600 w-8 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Additional Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-[#AB52EE]">
              {((averageRating / 5) * 100).toFixed(0)}%
            </p>
            <p className="text-sm text-gray-600">Satisfaction</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#AB52EE]">
              {averageRating >= 4
                ? "Excellent"
                : averageRating >= 3
                  ? "Good"
                  : averageRating >= 2
                    ? "Fair"
                    : "Poor"}
            </p>
            <p className="text-sm text-gray-600">Overall Rating</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewSummary;
