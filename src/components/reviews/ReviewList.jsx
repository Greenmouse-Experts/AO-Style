import React, { useState } from "react";
import { Star, ChevronDown, ChevronUp, User, Calendar } from "lucide-react";
import StarRating from "./StarRating";
import useGetProductReviews from "../../hooks/reviews/useGetProductReviews";
import LoaderComponent from "../BeatLoader";

const ReviewList = ({ productId, className = "", showEmptyState = true }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("newest");
  const [expandedReviews, setExpandedReviews] = useState(new Set());

  const {
    reviews,
    totalReviews,
    pagination,
    isLoading,
    isFetching,
    isError,
    error,
  } = useGetProductReviews(productId, {
    page: currentPage,
    limit: 5,
    sort: sortBy,
  });

  const toggleReviewExpansion = (reviewId) => {
    const newExpanded = new Set(expandedReviews);
    if (newExpanded.has(reviewId)) {
      newExpanded.delete(reviewId);
    } else {
      newExpanded.add(reviewId);
    }
    setExpandedReviews(newExpanded);
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setCurrentPage(1);
  };

  if (isLoading && currentPage === 1) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex justify-center py-8">
          <LoaderComponent />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-red-600">
          Failed to load reviews: {error?.message || "Unknown error"}
        </p>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    if (!showEmptyState) {
      return null;
    }
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="bg-gray-50 rounded-lg p-8">
          <Star size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Reviews Yet
          </h3>
          <p className="text-gray-600">
            Be the first to share your experience with this product!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Sort Options */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Reviews ({totalReviews})
        </h3>

        <div className="flex items-center gap-2">
          <label htmlFor="sort-reviews" className="text-sm text-gray-600">
            Sort by:
          </label>
          <select
            id="sort-reviews"
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#AB52EE] focus:border-[#AB52EE]"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => {
          const isExpanded = expandedReviews.has(review.id);
          const shouldShowExpand =
            review.content && review.content.length > 200;
          const displayContent =
            shouldShowExpand && !isExpanded
              ? review.content.substring(0, 200) + "..."
              : review.content;

          return (
            <div
              key={review.id}
              className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#AB52EE] rounded-full flex items-center justify-center text-white font-medium">
                    {review.user?.name ? (
                      review.user.name.charAt(0).toUpperCase()
                    ) : (
                      <User size={20} />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {review.user?.name || "Anonymous User"}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar size={14} />
                      {formatDate(review.created_at)}
                    </div>
                  </div>
                </div>

                <StarRating rating={review.rating} readonly={true} size={16} />
              </div>

              {/* Review Title */}
              {review.title && (
                <h4 className="font-medium text-gray-900 mb-2">
                  {review.title}
                </h4>
              )}

              {/* Review Content */}
              {review.content && (
                <div className="text-gray-700 mb-3">
                  <p className="leading-relaxed whitespace-pre-wrap">
                    {displayContent}
                  </p>

                  {shouldShowExpand && (
                    <button
                      onClick={() => toggleReviewExpansion(review.id)}
                      className="mt-2 text-[#AB52EE] hover:text-[#9542d4] text-sm font-medium flex items-center gap-1 transition-colors"
                    >
                      {isExpanded ? (
                        <>
                          Show Less <ChevronUp size={16} />
                        </>
                      ) : (
                        <>
                          Show More <ChevronDown size={16} />
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}

              {/* Review Actions/Meta (if needed in future) */}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>
                  {review.rating} star{review.rating !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Loading More */}
      {isFetching && currentPage > 1 && (
        <div className="flex justify-center py-4">
          <LoaderComponent />
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || isFetching}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          <div className="flex items-center gap-1">
            {Array.from(
              { length: Math.min(5, pagination.totalPages) },
              (_, index) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = index + 1;
                } else if (currentPage <= 3) {
                  pageNum = index + 1;
                } else if (currentPage >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + index;
                } else {
                  pageNum = currentPage - 2 + index;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    disabled={isFetching}
                    className={`px-3 py-2 text-sm rounded-md transition-colors ${
                      currentPage === pageNum
                        ? "bg-[#AB52EE] text-white"
                        : "border border-gray-300 hover:bg-gray-50"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {pageNum}
                  </button>
                );
              },
            )}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === pagination.totalPages || isFetching}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewList;
